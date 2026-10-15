import {
    Alert,
    Anchor,
    Box,
    Button,
    Divider,
    Flex,
    Group,
    Paper,
    Select,
    Stack,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
    Navigate,
    useNavigate,
    useParams,
    useSearchParams,
} from "react-router-dom";
import { toast } from "sonner";
import { fetchPlaces } from "../../../functions/places";
import {
    addCategory,
    addQuestion,
    deleteCategory,
    deleteQuestion,
    discardChanges,
    editCategory,
    editQuestion,
    fetchEditor,
    moveQuestion,
    arrangeQuestions,
    publishChanges,
    reorderCategories,
    reorderQuestions,
    reparentCategory,
    saveOverrides,
    scopeKey,
    toggleQuestion,
} from "../../../functions/questionnaire";
import { landingFor } from "../../components/AuthProvider/AuthProvider";
import Loading from "../../components/loading";
import BulkBar from "../../components/questionnaire/BulkBar";
import CategoryFormDialog from "../../components/questionnaire/CategoryFormDialog";
import CategoryTree from "../../components/questionnaire/CategoryTree";
import {
    ArchiveQuestionDialog,
    HideCategoryDialog,
} from "../../components/questionnaire/ConfirmDialogs";
import HistoryDialog from "../../components/questionnaire/HistoryDialog";
import MantineShell from "../../components/questionnaire/MantineShell";
import PlacePicker from "../../components/questionnaire/PlacePicker";
import PlaceQuestionPanel from "../../components/questionnaire/PlaceQuestionPanel";
import PublishDialog from "../../components/questionnaire/PublishDialog";
import QuestionFormModal from "../../components/questionnaire/QuestionFormModal";
import QuestionRows from "../../components/questionnaire/QuestionRows";
import StatusPill, { Pill } from "../../components/questionnaire/StatusPill";
import {
    PARENT_TYPES,
    SELECT_TYPES,
    changedIn,
    closed,
    isRefusal,
    isStale,
    levelLabel,
    nameList,
    ownPlaceOf,
    plural,
    reachOf,
    rememberOwnPlace,
    retry,
} from "../../components/questionnaire/constants";
import {
    DEFAULT_LANGUAGE,
    languageName,
    languagesFor,
    localise,
} from "../../components/questionnaire/localise";
import { EmptyState } from "../../components/questionnaire/shell";
import Wrapper from "../../components/wrapper/wrapper";

const MASTER = { type: "master" };
// The questionnaire field officers answer about their villages: a tree of
// its own, edited as the Master is. No place has a version of it.
const OFFICER = { type: "master", audience: "officer" };

// What belongs to the Master: its wording, and the chips that filter its
// questions by what places have done to them. A place's wording carries the
// place's name, so it is written where that name is known.
const COPY = {
    master: {
        title: "Master questionnaire",
        tag: "Master",
        note: "Every place starts with this questionnaire. Regional teams then switch questions off, reword them or add their own, for their own place only.",
        footnote:
            "Click a question to edit or archive it. Drag a question by its handle to move it: between two questions, onto a group or section to put it inside, or onto a page on the left. Categories on the left are dragged the same way: beside another, or onto a group to go inside it. Tick several questions, or several categories, to move them together. Places are not chosen here: each regional team switches questions on or off for itself. Questions a team added for its own place are listed in that place. From the keyboard, Alt and the arrow keys move a focused question or category: up and down among its neighbours, right into the group above it, left out of its group.",
        searchNote:
            "Search looks at question wording, helper text and option labels. A status filter works the same way and groups its results by category.",
        chips: [
            { value: "", label: "All" },
            {
                value: "hidden",
                label: "Hidden somewhere",
                test: ({ usage }) => usage?.hiddenIn?.length > 0,
            },
            {
                value: "changed",
                label: "Changed somewhere",
                test: ({ usage }) => changedIn(usage).length > 0,
            },
        ],
    },
    // The officers' questionnaire. No place hides or rewords anything in it,
    // so the Master's sentences about places are left out, and there is
    // nothing for a chip to filter by: the one left is never drawn.
    officer: {
        title: "Officer questionnaire",
        tag: "Officer",
        note: "Field officers answer these pages for each village assigned to them. Places do not change them.",
        footnote:
            "Click a question to edit or archive it. Drag a question by its handle to move it: between two questions, onto a group or section to put it inside, or onto a page on the left. Categories on the left are dragged the same way: beside another, or onto a group to go inside it. Tick several questions, or several categories, to move them together. From the keyboard, Alt and the arrow keys move a focused question or category: up and down among its neighbours, right into the group above it, left out of its group.",
        searchNote:
            "Search looks at question wording, helper text and option labels.",
        chips: [{ value: "", label: "All" }],
    },
};

// A place's chips list what the place itself did, as the count line above
// them counts it: by what it set, not by the ONE pill a row can show (a
// question it reworded and then hid shows "Hidden", and is still changed).
// The last chip is what a place above it did.
const placeChips = (placeId) => [
    { value: "", label: "All" },
    {
        value: "hidden",
        label: "Hidden here",
        test: ({ status }) => status.kind === "hidden" && status.here,
    },
    {
        value: "changed",
        label: "Changed here",
        test: ({ from = {} }) =>
            [from.label, from.helper_text, from.required, from.options].includes(
                placeId
            ),
    },
    {
        value: "added",
        label: "Added here",
        test: ({ ownerPlaceId }) => ownerPlaceId === placeId,
    },
];

const fromAbove = (names) => ({
    value: "above",
    label: `From ${nameList(names)}`,
    test: ({ status }) => !status.here && status.kind !== "master",
});

const BULK_NOTE =
    "Tick boxes appear when the pointer is over a row. Move to category works only on questions this place added.";

/**
 * Out of the app once published: archived, or replaced by a question that is
 * waiting to be published.
 */
const isArchived = (question) =>
    question.active === false || Boolean(question.replacedByPending);

/** Documents listed under what `parentOf` gives for each, in display order. */
const byParent = (docs, parentOf) => {
    const lists = new Map();
    docs.forEach((doc) => {
        const key = parentOf(doc);
        if (!lists.has(key)) lists.set(key, []);
        lists.get(key).push(doc);
    });
    lists.forEach((list) => list.sort((a, b) => a.order - b.order));
    return lists;
};

/**
 * The flat category list as the rows of the tree: in tree order, each with
 * its `depth` and its `trail` (the categories that lead to it, itself last).
 * Depth is worked out here: a category moved in a draft still carries the
 * depth of where it was published.
 */
const treeRows = (categories) => {
    const ids = new Set(categories.map((category) => category._id));
    // A parent missing from the list must not take its categories off the
    // screen with it: they are shown at the top instead.
    const children = byParent(categories, (category) =>
        ids.has(category.parentId) ? category.parentId : null
    );
    const walk = (parentId, trail, rows) => {
        (children.get(parentId) || []).forEach((category) => {
            const row = { ...category, parentId, depth: trail.length };
            row.trail = [...trail, row];
            rows.push(row);
            walk(category._id, row.trail, rows);
        });
        return rows;
    };
    return walk(null, [], []);
};

/**
 * The flat question list nested by parent: a Map from a page's id to its
 * top-level questions, each with its fields under `children`.
 */
const nestQuestions = (questions) => {
    const children = byParent(
        questions,
        (question) => question.parentQuestionId || null
    );
    const nest = (question) => ({
        ...question,
        children: (children.get(question._id) || []).map(nest),
    });
    return byParent(
        (children.get(null) || []).map(nest),
        (question) => question.categoryId
    );
};

/**
 * Flattens the nested question tree into rows, keeping the nesting visible.
 * An archived question takes its fields out of the app with it, so they are
 * left out, or dimmed, together. In a place the same goes for a question the
 * place does not ask (`asked`, which the Master's questions do not carry):
 * it is dimmed with its fields, each keeping its own switch.
 */
const toRows = (questions, showArchived, depth = 0, dimmed = false, rows = []) => {
    questions.forEach((question) => {
        const archived = isArchived(question);
        if (archived && !showArchived) return;
        const off = dimmed || archived || question.asked === false;
        rows.push({ ...question, depth, archived, dimmed: off });
        toRows(question.children, showArchived, depth + 1, off, rows);
    });
    return rows;
};

/**
 * Search looks at a question's wording, its helper text and its option
 * labels, in the language on screen and in English. `term` is lowercase.
 */
const matches = (question, term, language) =>
    [
        question.label,
        question.helper_text,
        ...(question.options || []).map((option) => option.label),
    ].some((text) =>
        [localise(text, language), localise(text)].some((value) =>
            value.toLowerCase().includes(term)
        )
    );

/**
 * A question with fields is saved as several requests. If one of them fails
 * after another went through, the error is marked `partial`: the form it
 * came from must not be sent a second time on top of what was saved.
 */
const inSequence = async (work) => {
    let wrote = false;
    const send = async (call, body) => {
        const answer = await call(body);
        wrote = true;
        return answer;
    };
    try {
        return await work(send);
    } catch (err) {
        err.partial = wrote;
        throw err;
    }
};

/**
 * Saves a parent's fields after the parent, one at a time and in order: the
 * server puts a new field after the last one it has, and a failed field must
 * not leave later ones saved around a gap. `fields` is the panel's tree of
 * `{ _id, rev, body, children }`; `add` adds a question to the questionnaire
 * on screen.
 */
const saveFields = async (send, add, categoryId, parentId, fields) => {
    for (const field of fields) {
        let id = field._id;
        if (!id) {
            const created = await send(add, {
                categoryId,
                parentQuestionId: parentId,
                ...field.body,
            });
            id = created._id;
        } else if (Object.keys(field.body).length) {
            await send(editQuestion, {
                question_id: id,
                rev: field.rev,
                ...field.body,
            });
        }
        await saveFields(send, add, categoryId, id, field.children);
    }
};

/**
 * The questionnaire editor: the Master (PDF p.2), or one place's own
 * questionnaire (p.9) when `scope` names a place.
 *
 * One request loads everything, drafts applied; searching, filtering and
 * grouping happen here over that payload. What is on screen is in the URL
 * (`category`, `lang`, `q`, `chip`, `archived`), so Back works and a view is
 * a link.
 *
 * A place is shown every question it is given, each with what the place did
 * to it. It decides whether to ask one, rewords it, changes its options, and
 * adds questions and categories of its own; it reorders and archives nothing.
 *
 * The officers' questionnaire (`scope.audience`) is the Master's screen on
 * another tree: everything that asks `master` below holds for it too. Only
 * what the Master says and shows about places is missing.
 */
function Editor({ scope }) {
    const master = scope.type === "master";
    const copy = scope.audience === "officer" ? COPY.officer : COPY.master;
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    // With the audience: both questionnaires have a Master, and one must
    // never be drawn from what was loaded for the other.
    const queryKey = ["questionnaire-editor", scopeKey(scope), scope.audience];

    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get("q") || "";
    // The box keeps up with the keys; the 450 questions are filtered after.
    const term = useDeferredValue(search.trim().toLowerCase());
    // A place lists what it can switch on or off, and an archived question
    // is in no place's app.
    const showArchived = master && searchParams.get("archived") === "1";

    // A value sets a parameter, an empty one removes it. Typing in the
    // search box replaces the history entry instead of adding one a letter.
    const setParams = (changes, replace = false) => {
        const next = new URLSearchParams(searchParams);
        Object.entries(changes).forEach(([name, value]) =>
            value ? next.set(name, value) : next.delete(name)
        );
        setSearchParams(next, { replace });
    };

    const [panel, setPanel] = useState({ opened: false });
    const [categoryForm, setCategoryForm] = useState({ opened: false });
    const [removal, setRemoval] = useState({ opened: false });
    const [hiding, setHiding] = useState({ opened: false });
    const [publish, setPublish] = useState({ opened: false });
    const [historyOpen, setHistoryOpen] = useState(false);
    // The ids of the rows ticked for the bar that acts on several at once.
    const [ticked, setTicked] = useState(() => new Set());

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey,
        queryFn: () => fetchEditor(scope),
        // A refusal is an answer: asking again would only get it again.
        retry,
    });
    // Every language some place asks for, so each can be written here.
    const { data: places = [] } = useQuery({
        queryKey: ["places"],
        queryFn: () => fetchPlaces(),
    });
    const languages = useMemo(() => languagesFor(places), [places]);
    // Only a language that is on offer: an address can name any, and wording
    // typed under one the panels do not show would be saved out of sight.
    const language = languages.includes(searchParams.get("lang"))
        ? searchParams.get("lang")
        : DEFAULT_LANGUAGE;

    // A regional account's place, as the server holds it now (the copy from
    // sign-in goes stale when the account is moved to another place), and
    // the place that copy named when this screen opened.
    const ownPlace = useMemo(() => ownPlaceOf(places), [places]);
    const [storedPlace] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "{}").place?._id;
        } catch (unreadable) {
            return undefined;
        }
    });
    useEffect(() => {
        if (ownPlace) rememberOwnPlace(ownPlace);
    }, [ownPlace]);

    // The place on screen, as the server writes its name, and how it
    // compares with what is above it.
    const here = data?.scope?.name || "";
    // "Ladakh and its villages", or the village alone: whom a change reaches.
    const reach = reachOf(here, data?.scope?.level);
    const reachFor = (status) =>
        status.here
            ? reach
            : reachOf(status.placeName, data?.places?.[status.placeId]?.level);
    const compare = data?.compare;
    const chips = master
        ? copy.chips
        : [
              ...placeChips(scope.placeId),
              ...(compare?.inherited
                  ? [fromAbove(compare.inherited.names)]
                  : []),
          ];
    const chip =
        chips.find((entry) => entry.value === searchParams.get("chip")) ||
        chips[0];

    // What waits to be deleted is already gone from this view. So is, in a
    // place, what the Master archived, with everything inside it: it is in
    // no place's app, and no place can switch it back on.
    const { tree, questionsOf } = useMemo(() => {
        const listed = (data?.categories || []).filter(
            (entry) => !entry.pendingDelete
        );
        const byId = new Map(listed.map((entry) => [entry._id, entry]));
        const archived = (entry) =>
            Boolean(entry) &&
            (entry.active === false || archived(byId.get(entry.parentId)));
        return {
            tree: treeRows(
                master ? listed : listed.filter((entry) => !archived(entry))
            ),
            questionsOf: nestQuestions(
                (data?.questions || []).filter((entry) => !entry.pendingDelete)
            ),
        };
    }, [data, master]);
    const pending = data?.pending || [];

    // The first question page when the URL names none, or one that is gone:
    // one the place asks, if it asks any.
    const selected =
        tree.find((entry) => entry._id === searchParams.get("category")) ||
        tree.find((entry) => entry.is_screen && entry.asked !== false) ||
        tree.find((entry) => entry.is_screen);

    // A page the place does not ask (`asked`, which the Master's categories
    // do not carry) is listed dimmed from its first row down.
    const rows = useMemo(
        () =>
            toRows(
                questionsOf.get(selected?._id) || [],
                showArchived,
                0,
                selected?.asked === false
            ),
        [questionsOf, selected?._id, selected?.asked, showArchived]
    );
    const archivedCount = useMemo(
        () =>
            toRows(questionsOf.get(selected?._id) || [], true).filter(
                (row) => row.archived
            ).length,
        [questionsOf, selected?._id]
    );

    const pathOf = (category) =>
        category.trail.map((entry) => localise(entry.title, language)).join(" › ");

    // A search or a filter leaves the page for every category at once.
    const searching = Boolean(term || chip.value);
    const results = searching
        ? tree.flatMap((category) =>
              toRows(
                  questionsOf.get(category._id) || [],
                  showArchived,
                  0,
                  category.asked === false
              )
                  .filter(
                      (row) =>
                          (!term || matches(row, term, language)) &&
                          (!chip.test || chip.test(row))
                  )
                  .map((row) => ({ ...row, depth: 0, group: pathOf(category) }))
          )
        : [];

    // A page that is one repeating list: the app draws it as a list, and a
    // question a place adds there goes inside each entry, not beside it.
    // For a place the server says which pages are lists, by the very rule
    // it places a new question with; only a place's screen asks.
    // In the Master a question added to a page that is ONE list stands
    // beside the list, not inside each entry (a place's goes inside). Such
    // a page is most of Production and Consumption: the panel says so.
    const onlyListOf = (categoryId) => {
        const top = (data?.questions || []).filter(
            (question) =>
                question.categoryId === categoryId &&
                !question.parentQuestionId &&
                // Archived, or retired by a replacement that waits to be
                // published, or waiting to be deleted: not in the list on
                // screen any more.
                !isArchived(question) &&
                !question.pendingDelete
        );
        return top.length === 1 && top[0].type === "repeatable_group"
            ? top[0]
            : null;
    };
    const isList = (categoryId) =>
        Boolean(
            data?.categories.find((category) => category._id === categoryId)
                ?.list
        );

    // Only what is on screen counts as ticked: a row ticked on another page
    // must not be hidden from here, where nobody can see it.
    const tickedRows = (searching ? results : rows).filter((row) =>
        ticked.has(row._id)
    );
    const tick = (ids, on) =>
        setTicked((old) => {
            const next = new Set(old);
            ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
            return next;
        });
    const clearTicks = () => setTicked(new Set());
    // Only a question this place added, standing on a page of its own
    // right, can go to another page; and not to a page that is a list.
    const movable = tickedRows.every(
        (row) => row.ownerPlaceId === scope.placeId && !row.parentQuestionId
    );
    const movePages = movable
        ? tree
              .filter(
                  (category) =>
                      category.is_screen &&
                      !isList(category._id) &&
                      tickedRows.some((row) => row.categoryId !== category._id)
              )
              .map((category) => ({
                  value: category._id,
                  label: pathOf(category),
              }))
        : [];

    /*
     * Every change to the questionnaire is sent from here, so what follows a
     * save is decided once: the editor is loaded again, and a refusal is
     * shown in the server's own words.
     */
    const write = useMutation({
        mutationFn: (job) => job.send(),
        onSuccess: (answer, job) => job.then?.(answer),
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Something went wrong");
            // Stale: what is on screen is no longer what is saved. `partial`:
            // a save of several requests stopped halfway. Either way an open
            // form would be sent again over something it has not seen, so it
            // closes and the reloaded list is what is left. Any other refusal
            // is a rule the person can still put right in the form, which
            // stays open with what was typed. The Publish dialog stays too:
            // it shows the reloaded changes.
            if (isStale(err) || err?.partial) {
                setPanel(closed);
                setCategoryForm(closed);
                setRemoval(closed);
                setHiding(closed);
            }
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey }),
    });
    // Until the reload that follows a save has landed, the list still holds
    // the revisions from before it: `busy` covers that stretch too (the
    // mutation waits for onSettled), and nothing is opened or sent from a
    // stale row meanwhile.
    const busy = write.isPending;
    const idle =
        (action) =>
        (...args) => {
            if (!busy) action(...args);
        };
    const save = (send, then) => write.mutate({ send, then });
    const saveDraft = (send, close) =>
        save(send, (answer) => {
            toast.success("Saved to draft");
            close?.(answer);
        });

    // A dragged row is drawn where it was dropped at once, and a switch
    // where it was put: waiting for the reload would show it jump back
    // first. If the save is refused, the reload puts it back. `patches` are
    // `{ _id, ...what changed }`.
    const showNow = (collection, patches) => {
        queryClient.cancelQueries({ queryKey });
        queryClient.setQueryData(
            queryKey,
            (old) =>
                old && {
                    ...old,
                    [collection]: old[collection].map((doc) => ({
                        ...doc,
                        ...patches.find((patch) => patch._id === doc._id),
                    })),
                }
        );
    };
    const orders = (moved, idField) =>
        moved.map(({ _id, order }) => ({ [idField]: _id, order }));

    // Into another group (null: the top level). `moving` are the categories
    // themselves, what they hold goes along; `moved` is the new order of
    // their new level, theirs and their neighbours' (shared orders are
    // renumbered to make a place for them).
    const moveCategories = (moving, parentId, moved) => {
        const going = moving.filter(
            (category) => (category.parentId || null) !== parentId
        );
        const ids = new Set(going.map((category) => category._id));
        const orderOf = (id) => moved.find((entry) => entry._id === id)?.order;
        showNow(
            "categories",
            moved.map((entry) =>
                ids.has(entry._id) ? { ...entry, parentId } : entry
            )
        );
        const others = moved.filter((entry) => !ids.has(entry._id));
        save(() =>
            inSequence(async (send) => {
                for (const category of going)
                    await send(reparentCategory, {
                        category_id: category._id,
                        rev: category.rev,
                        parentId,
                        order: orderOf(category._id),
                    });
                if (others.length)
                    await send(
                        reorderCategories,
                        orders(others, "category_id")
                    );
            })
        );
    };

    const removeCategory = () => {
        const { category, remove } = removal;
        const close = () => setRemoval(closed);
        if (!remove)
            return saveDraft(
                () =>
                    editCategory({
                        category_id: category._id,
                        rev: category.rev,
                        active: false,
                    }),
                close
            );
        save(
            () => deleteCategory({ id: category._id, rev: category.rev }),
            (answer) => {
                // Never published: gone at once, and nothing waits for it.
                toast.success(answer.pending ? "Saved to draft" : "Category deleted");
                close();
            }
        );
    };

    /*
     * What a place changes about something it did not add (and whether it
     * asks what it did add) is saved as that place's own change to it.
     */
    const override = (targetType, target, patch) => ({
        placeId: scope.placeId,
        targetType,
        targetId: target._id,
        patch,
    });

    // The Asked switch, for one row or for every ticked one. It is drawn
    // where it was put at once; a refusal puts it back, and the reload that
    // follows every save then shows what the server holds.
    const ask = (questions, asked, then) => {
        if (!questions.length) return;
        const before = queryClient.getQueryData(queryKey);
        showNow(
            "questions",
            questions.map(({ _id }) => ({ _id, asked }))
        );
        save(
            () =>
                saveOverrides(
                    questions.map((question) =>
                        override("question", question, { asked })
                    )
                ).catch((err) => {
                    queryClient.setQueryData(queryKey, before);
                    throw err;
                }),
            then
        );
    };
    const bulkDone = () => {
        toast.success("Saved to draft");
        clearTicks();
    };

    const moveTicked = (categoryId) =>
        saveDraft(
            () =>
                inSequence(async (send) => {
                    for (const row of tickedRows)
                        await send(moveQuestion, {
                            question_id: row._id,
                            rev: row.rev,
                            categoryId,
                        });
                }),
            clearTicks
        );

    /*
     * Where the Master's questions go: a drag, a keyboard move, or the bar of
     * ticked ones. They are drawn there at once, numbered as the server will
     * number them; a refusal reloads them where they were, in its words.
     * `moving` are the questions themselves (what is inside them follows);
     * `parentQuestionId` null is the top of the page, `before` null the end.
     */
    const arrange = (moving, { categoryId, parentQuestionId = null, before = null }) => {
        if (!moving.length || !data) return;
        const ids = new Set(moving.map((question) => question._id));
        const beside = data.questions
            .filter(
                (question) =>
                    !question.ownerPlaceId &&
                    !ids.has(question._id) &&
                    (parentQuestionId
                        ? question.parentQuestionId === parentQuestionId
                        : !question.parentQuestionId &&
                          question.categoryId === categoryId)
            )
            .sort((a, b) => a.order - b.order);
        const at = before
            ? beside.findIndex((question) => question._id === before)
            : -1;
        const sequence =
            at < 0
                ? [...beside, ...moving]
                : [...beside.slice(0, at), ...moving, ...beside.slice(at)];
        showNow(
            "questions",
            sequence.map((question, index) =>
                ids.has(question._id)
                    ? { _id: question._id, parentQuestionId, categoryId, order: index + 1 }
                    : { _id: question._id, order: index + 1 }
            )
        );
        saveDraft(
            () =>
                arrangeQuestions({
                    items: moving.map((question) => ({
                        question_id: question._id,
                        rev: question.rev ?? 0,
                    })),
                    categoryId,
                    parentQuestionId,
                    before,
                }),
            clearTicks
        );
    };

    // Hiding a category asks first (it takes its questions with it);
    // showing it again does not.
    const showCategory = (category) =>
        saveDraft(() =>
            saveOverrides([override("category", category, { asked: true })])
        );

    const closePanel = () => setPanel(closed);
    const add = (body) => addQuestion(body, scope);

    const addQuestionFromPanel = (body, fields) => {
        const { category, replaces, copiesFields } = panel;
        saveDraft(
            () =>
                inSequence(async (send) => {
                    const created = await send(add, {
                        ...body,
                        categoryId: category._id,
                        ...(replaces && { replaces: replaces._id }),
                        ...(copiesFields && { copyChildren: true }),
                    });
                    await saveFields(send, add, category._id, created._id, fields);
                }),
            closePanel
        );
    };

    const editQuestionFromPanel = (changes, fields) => {
        const { question } = panel;
        saveDraft(
            () =>
                inSequence(async (send) => {
                    if (Object.keys(changes).length)
                        await send(editQuestion, {
                            question_id: question._id,
                            rev: question.rev,
                            ...changes,
                        });
                    await saveFields(
                        send,
                        add,
                        question.categoryId,
                        question._id,
                        fields
                    );
                }),
            closePanel
        );
    };

    // What the place changes about a question it did not add: one change,
    // on top of the one the panel was opened on.
    const saveOverride = (patch) =>
        saveDraft(
            () =>
                saveOverrides([
                    {
                        ...override("question", panel.question, patch),
                        rev: panel.question.own?.rev,
                    },
                ]),
            closePanel
        );

    // The edit panel turns into the add panel for the question that takes
    // the old one's place.
    const startReplacement = ({ type, copy: copied }) => {
        const old = panel.question;
        const both = (types) => types.includes(old.type) && types.includes(type);
        setPanel({
            opened: true,
            category: panel.category,
            replaces: old,
            // The server copies fields only from a repeating group into a
            // repeating group (it refuses the request for any other pair);
            // the panel then has none to author. A group replaced by a
            // section, or the other way round, gets its fields in the panel.
            copiesFields:
                copied &&
                old.type === "repeatable_group" &&
                type === "repeatable_group",
            preset: {
                type,
                ...(copied && {
                    label: old.label || {},
                    helper_text: old.helper_text || {},
                }),
                // An archived option is kept for old answers only.
                ...(copied &&
                    both(SELECT_TYPES) && {
                        options: old.options
                            .filter((option) => !option.archived)
                            .map(({ value, label }) => ({ value, label })),
                    }),
            },
        });
    };

    const publishRows = (sent) =>
        save(
            () =>
                publishChanges({
                    scope,
                    items: sent.flatMap((row) => row.items),
                }),
            (answer) => {
                // The server may leave a change out (one that needs another
                // which was not sent, say) and gives its reason.
                const skipped = sent.flatMap((row) => {
                    const miss = (answer.skipped || []).find((entry) =>
                        row.items.some((item) => item.id === entry.id)
                    );
                    return miss
                        ? [
                              {
                                  key: row.key,
                                  name: localise(row.label, language),
                                  reason: miss.reason,
                              },
                          ]
                        : [];
                });
                const published = sent.length - skipped.length;
                if (published)
                    toast.success(
                        `Published ${plural(published, "change")}${
                            master ? "" : ` for ${here}`
                        }`
                    );
                setPublish(skipped.length ? { opened: true, skipped } : closed);
            }
        );

    const openAdd = () => setPanel({ opened: true, category: selected });
    const openCategoryForm = (form) => setCategoryForm({ opened: true, ...form });
    // A question the place did not add opens the panel for what the place
    // changes about it. One it added, like any of the Master's in the
    // Master, opens the panel that edits the question itself.
    const inherits =
        !master &&
        Boolean(panel.question) &&
        panel.question.ownerPlaceId !== scope.placeId;

    // The same page of another place, in the same language. A search or a
    // filter belongs to the place being left.
    const openPlace = (placeId) => {
        const keep = new URLSearchParams();
        ["category", "lang"].forEach((name) => {
            if (searchParams.get(name)) keep.set(name, searchParams.get(name));
        });
        navigate({
            pathname: `/questionnaire/place/${placeId}`,
            search: keep.toString(),
        });
    };

    // A page some place added, as the tag it gets beside its title. Told
    // by its owner, not its status: it may also be hidden.
    const addedPage =
        !master && selected?.ownerPlaceId
            ? {
                  kind: "added",
                  here: selected.ownerPlaceId === scope.placeId,
                  placeName: data.places?.[selected.ownerPlaceId]?.name,
              }
            : null;
    // The category that keeps the page on screen out of the place's app:
    // the page itself, or a group it sits in.
    const hiddenWith =
        !master &&
        selected?.trail.find((entry) => entry.status?.kind === "hidden");
    const categoriesOf = (counts) =>
        [
            counts?.categoriesHidden &&
                `${plural(counts.categoriesHidden, "category", "categories")} hidden`,
            counts?.categoriesAdded &&
                `${plural(counts.categoriesAdded, "category", "categories")} added`,
        ]
            .filter(Boolean)
            .join(" and ");
    const categoryChanges = categoriesOf(compare?.own);
    const categoriesAbove = categoriesOf(compare?.inherited);

    // In the Master the bar moves what is ticked: into a group or section of
    // this page (at its end), or to the end of another page. A ticked
    // question inside a ticked group goes along with the group.
    const questionById = new Map(
        (data?.questions || []).map((question) => [question._id, question])
    );
    const tickedAbove = (question) => {
        for (let at = question; at; at = questionById.get(at.parentQuestionId))
            if (ticked.has(at._id)) return true;
        return false;
    };
    const tickedRoots = tickedRows.filter(
        (row) => !tickedAbove(questionById.get(row.parentQuestionId))
    );
    const masterMoves = master
        ? [
              ...rows
                  .filter(
                      (row) =>
                          PARENT_TYPES.includes(row.type) &&
                          !row.archived &&
                          !tickedAbove(row)
                  )
                  .map((row) => ({
                      value: `into:${row._id}`,
                      label: `Into “${localise(row.label, language)}”`,
                      group: "On this page",
                  })),
              ...tree
                  .filter(
                      (category) =>
                          category.is_screen &&
                          category.active !== false &&
                          category._id !== selected?._id
                  )
                  .map((category) => ({
                      value: `page:${category._id}`,
                      label: pathOf(category),
                      group: "To the end of another page",
                  })),
          ]
        : [];
    const moveTickedTo = (value) => {
        const [kind, id] = value.split(":");
        arrange(
            tickedRoots,
            kind === "into"
                ? { categoryId: selected._id, parentQuestionId: id }
                : { categoryId: id }
        );
    };

    const bulkBar = master ? (
        <BulkBar
            count={tickedRows.length}
            pages={masterMoves}
            busy={busy}
            onMove={moveTickedTo}
            onClear={clearTicks}
        />
    ) : (
        <BulkBar
            count={tickedRows.length}
            placeName={here}
            pages={movePages}
            busy={busy}
            onHide={() =>
                // The field that names each entry of a list stays asked.
                ask(
                    tickedRows.filter((row) => !row.lockedSwitch),
                    false,
                    bulkDone
                )
            }
            onShow={() => ask(tickedRows, true, bulkDone)}
            onMove={moveTicked}
            onClear={clearTicks}
        />
    );
    const openQuestion = (category) =>
        idle((question) => setPanel({ opened: true, question, category }));
    const refusal =
        (isRefusal(error) &&
            (error.response.data?.message ||
                "This page could not be opened.")) ||
        // A server from before the officers' questionnaire drops the
        // request's `audience` and sends the villagers' Master. Nothing of
        // it may be drawn here, where every edit would then land on the
        // villagers' questionnaire under the officers' title.
        (Boolean(scope.audience) &&
            Boolean(data) &&
            data.scope?.audience !== scope.audience &&
            "This server does not have the officer questionnaire yet.");
    const restoreQuestion = idle((question) =>
        saveDraft(() =>
            toggleQuestion({
                question_id: question._id,
                rev: question.rev,
                active: true,
            })
        )
    );

    // A team that was moved to another place is taken to the place it has
    // now, instead of being told that the one its own menu link still led
    // to is not its own. Any other place that is not its own is refused in
    // the server's words, below.
    if (
        refusal &&
        ownPlace &&
        storedPlace === scope.placeId &&
        ownPlace._id !== scope.placeId
    )
        return (
            <Navigate to={`/questionnaire/place/${ownPlace._id}`} replace={true} />
        );

    return (
        <Wrapper
            plain
            title={master ? copy.title : `Questionnaire${here && ` · ${here}`}`}
        >
            <Loading isLoading={isLoading} />
            <MantineShell>
                {!isError && refusal && <EmptyState title={refusal} />}
                {isError &&
                    (refusal ? (
                        // Said plainly, in the server's words, and with
                        // nothing to try again. Nothing else is drawn: what
                        // an earlier load left in the cache is not this
                        // account's, or no longer exists.
                        <EmptyState title={refusal} />
                    ) : data ? (
                        // The list on screen is from before: it stays, and
                        // says so.
                        <Alert
                            color="red"
                            variant="light"
                            mb="md"
                            title="The questionnaire could not be loaded again"
                        >
                            <Group justify="space-between" gap="md">
                                <Text size="sm">
                                    What is below may be out of date. Check the
                                    connection and try again.
                                </Text>
                                <Button
                                    size="xs"
                                    variant="default"
                                    onClick={() => refetch()}
                                >
                                    Try again
                                </Button>
                            </Group>
                        </Alert>
                    ) : (
                        <EmptyState
                            title="The questionnaire could not be loaded"
                            description="Check the connection and try again."
                            action={
                                <Button onClick={() => refetch()}>Try again</Button>
                            }
                        />
                    ))}
                {data && !refusal && (
                    <Paper withBorder radius="md">
                        <Group p="lg" gap="sm" wrap="nowrap">
                            {!master && (
                                <PlacePicker
                                    places={places}
                                    current={data.scope}
                                    above={compare?.inherited?.names.at(-1)}
                                    onChoose={openPlace}
                                />
                            )}
                            <Select
                                aria-label="Language"
                                w={130}
                                style={{ flexShrink: 0 }}
                                allowDeselect={false}
                                data={languages.map((code) => ({
                                    value: code,
                                    label: languageName(code),
                                }))}
                                value={language}
                                onChange={(value) =>
                                    setParams({
                                        lang:
                                            value === DEFAULT_LANGUAGE ? "" : value,
                                    })
                                }
                            />
                            <TextInput
                                aria-label="Search questions"
                                placeholder="Search questions"
                                miw={200}
                                style={{ flex: 1 }}
                                value={search}
                                onChange={(event) =>
                                    setParams({ q: event.currentTarget.value }, true)
                                }
                            />
                            <Button
                                variant="default"
                                style={{ flexShrink: 0 }}
                                onClick={() => setHistoryOpen(true)}
                            >
                                History
                            </Button>
                            <Button
                                style={{ flexShrink: 0 }}
                                disabled={pending.length === 0}
                                onClick={() => setPublish({ opened: true })}
                            >
                                {pending.length
                                    ? `Publish ${plural(pending.length, "change")}`
                                    : "Nothing to publish"}
                            </Button>
                        </Group>
                        <Divider />

                        <Stack px="lg" py="md" gap="sm">
                            {master ? (
                                <Alert variant="light" py="xs">
                                    {copy.note}
                                </Alert>
                            ) : (
                                // The place's own differences, then what it
                                // takes over from the places above it.
                                <Text size="sm" c="dimmed">
                                    {here} compared with {compare.baseName}:{" "}
                                    <Text
                                        span
                                        inherit
                                        fw={700}
                                        c="var(--mantine-color-text)"
                                    >
                                        {compare.own.hidden} hidden ·{" "}
                                        {compare.own.changed} changed ·{" "}
                                        {compare.own.added} added
                                    </Text>
                                    {categoryChanges && `, plus ${categoryChanges}`}
                                    {compare.inherited &&
                                        `. It also inherits ${nameList(
                                            compare.inherited.names
                                        )}'s ${compare.inherited.hidden} hidden, ${
                                            compare.inherited.changed
                                        } changed and ${
                                            compare.inherited.added
                                        } added${
                                            categoriesAbove
                                                ? `, plus ${categoriesAbove}`
                                                : ""
                                        }.`}
                                </Text>
                            )}
                            {/* "All" on its own filters nothing. */}
                            {chips.length > 1 && (
                                <Group gap="xs">
                                    {chips.map((entry) => (
                                        <Button
                                            key={entry.value}
                                            variant="default"
                                            radius="xl"
                                            aria-pressed={entry === chip}
                                            fw={entry === chip ? 700 : 500}
                                            bg={
                                                entry === chip
                                                    ? "gray.2"
                                                    : undefined
                                            }
                                            onClick={() =>
                                                setParams({ chip: entry.value })
                                            }
                                        >
                                            {entry.label}
                                        </Button>
                                    ))}
                                </Group>
                            )}
                        </Stack>
                        <Divider />

                        <Flex align="stretch" mih={480}>
                            <CategoryTree
                                scope={scope}
                                placeName={here}
                                reachFor={reachFor}
                                categories={tree}
                                selectedId={selected?._id}
                                language={language}
                                // Picking a page leaves a search: the results
                                // would otherwise stay over the page asked for.
                                onSelect={(id) =>
                                    setParams({ category: id, q: "", chip: "" })
                                }
                                onAdd={(parent) => openCategoryForm({ parent })}
                                onRename={idle((category) =>
                                    openCategoryForm({
                                        category,
                                        path: pathOf(category),
                                    })
                                )}
                                onRemove={idle((category, remove) =>
                                    setRemoval({
                                        opened: true,
                                        category,
                                        remove,
                                        target: {
                                            _id: category._id,
                                            name: localise(category.title, language),
                                            unpublished: category.unpublished,
                                        },
                                    })
                                )}
                                onRestore={idle((category) =>
                                    saveDraft(() =>
                                        editCategory({
                                            category_id: category._id,
                                            rev: category.rev,
                                            active: true,
                                        })
                                    )
                                )}
                                onReorder={idle((moved) => {
                                    showNow("categories", moved);
                                    save(() =>
                                        reorderCategories(
                                            orders(moved, "category_id")
                                        )
                                    );
                                })}
                                onMove={idle(moveCategories)}
                                onDropQuestions={idle((page, ids) =>
                                    arrange(
                                        ids
                                            .map((id) => questionById.get(id))
                                            .filter(Boolean),
                                        { categoryId: page._id }
                                    )
                                )}
                                onHide={idle((category) =>
                                    setHiding({ opened: true, category })
                                )}
                                onShow={idle(showCategory)}
                            />

                            <Box
                                p="lg"
                                style={{
                                    flex: 1,
                                    minWidth: 0,
                                    // On this pane, not on the tree: the tree
                                    // is only as tall as its own rows.
                                    borderLeft:
                                        "1px solid var(--mantine-color-gray-3)",
                                }}
                            >
                                {searching ? (
                                    <>
                                        {tickedRows.length > 0 ? (
                                            bulkBar
                                        ) : (
                                            <Group
                                                justify="space-between"
                                                align="baseline"
                                                wrap="nowrap"
                                                gap="md"
                                            >
                                                <Group gap="sm" align="baseline">
                                                    <Title order={2} fz={20}>
                                                        {plural(
                                                            results.length,
                                                            "result"
                                                        )}
                                                        {term &&
                                                            ` for “${search.trim()}”`}
                                                    </Title>
                                                    <Text size="sm" c="dimmed">
                                                        in every category
                                                        {!master &&
                                                            `, as asked in ${here}`}
                                                    </Text>
                                                </Group>
                                                {term && (
                                                    <Anchor
                                                        component="button"
                                                        type="button"
                                                        size="sm"
                                                        fw={600}
                                                        style={{ flexShrink: 0 }}
                                                        onClick={() =>
                                                            setParams({ q: "" })
                                                        }
                                                    >
                                                        Clear search
                                                    </Anchor>
                                                )}
                                            </Group>
                                        )}
                                        <QuestionRows
                                            scope={scope}
                                            placeName={here}
                                            placeNames={data.places}
                                            rows={results}
                                            language={language}
                                            grouped
                                            ticked={ticked}
                                            onTick={tick}
                                            onAsk={(question, asked) =>
                                                ask([question], asked)
                                            }
                                            onOpen={(question) =>
                                                openQuestion(
                                                    tree.find(
                                                        (entry) =>
                                                            entry._id ===
                                                            question.categoryId
                                                    )
                                                )(question)
                                            }
                                            onRestore={restoreQuestion}
                                        />
                                        <Text size="sm" c="dimmed" mt="lg">
                                            {tickedRows.length > 0
                                                ? BULK_NOTE
                                                : copy.searchNote}
                                        </Text>
                                    </>
                                ) : !selected ? (
                                    <EmptyState
                                        title="No question pages yet"
                                        description="Questions are kept on question pages. Add a category to start."
                                        action={
                                            <Button
                                                leftSection={<IconPlus size={16} />}
                                                onClick={() => openCategoryForm({})}
                                            >
                                                Add category
                                            </Button>
                                        }
                                    />
                                ) : !selected.is_screen ? (
                                    <Text size="sm" c="dimmed">
                                        This group holds other categories. Pick a
                                        question page.
                                    </Text>
                                ) : (
                                    <>
                                        {tickedRows.length > 0 ? (
                                            bulkBar
                                        ) : (
                                            <Group
                                                justify="space-between"
                                                align="flex-start"
                                                wrap="nowrap"
                                                gap="md"
                                                mb="md"
                                            >
                                                <Group gap="sm" align="baseline">
                                                    <Title order={2} fz={20}>
                                                        {localise(
                                                            selected.title,
                                                            language
                                                        )}
                                                    </Title>
                                                    {master ? (
                                                        <Text size="sm" c="dimmed">
                                                            {copy.tag}
                                                        </Text>
                                                    ) : addedPage ? (
                                                        <StatusPill
                                                            status={addedPage}
                                                        />
                                                    ) : (
                                                        <Text size="sm" c="dimmed">
                                                            as asked in {here}
                                                        </Text>
                                                    )}
                                                </Group>
                                                <Button
                                                    variant="default"
                                                    leftSection={
                                                        <IconPlus size={16} />
                                                    }
                                                    style={{ flexShrink: 0 }}
                                                    onClick={openAdd}
                                                >
                                                    Add question
                                                </Button>
                                            </Group>
                                        )}
                                        {hiddenWith && (
                                            <Text size="sm" c="dimmed" mb="md">
                                                {localise(
                                                    hiddenWith.title,
                                                    language
                                                )}{" "}
                                                is hidden in{" "}
                                                {hiddenWith.status.here
                                                    ? here
                                                    : hiddenWith.status.placeName}
                                                . Its questions are not asked.
                                            </Text>
                                        )}
                                        <QuestionRows
                                            scope={scope}
                                            placeName={here}
                                            placeNames={data.places}
                                            rows={rows}
                                            language={language}
                                            emptyNote={
                                                addedPage
                                                    ? `This question page exists only in ${reachFor(
                                                          addedPage
                                                      )}. It appears in the app once it has at least one question and you publish.`
                                                    : undefined
                                            }
                                            ticked={ticked}
                                            onTick={tick}
                                            onAsk={(question, asked) =>
                                                ask([question], asked)
                                            }
                                            onOpen={openQuestion(selected)}
                                            onAdd={openAdd}
                                            onRestore={restoreQuestion}
                                            onReorder={idle((moved) => {
                                                showNow("questions", moved);
                                                save(() =>
                                                    reorderQuestions(
                                                        orders(moved, "question_id")
                                                    )
                                                );
                                            })}
                                            onArrange={idle((moving, place) =>
                                                arrange(moving, {
                                                    categoryId: selected._id,
                                                    ...place,
                                                })
                                            )}
                                        />
                                        {master ? (
                                            <Group
                                                justify="space-between"
                                                wrap="nowrap"
                                                gap="xl"
                                                mt="lg"
                                            >
                                                <Text size="sm" c="dimmed" maw={520}>
                                                    {copy.footnote}
                                                </Text>
                                                {archivedCount > 0 && (
                                                    <Anchor
                                                        component="button"
                                                        type="button"
                                                        size="sm"
                                                        fw={600}
                                                        style={{ flexShrink: 0 }}
                                                        onClick={() =>
                                                            setParams({
                                                                archived:
                                                                    showArchived
                                                                        ? ""
                                                                        : "1",
                                                            })
                                                        }
                                                    >
                                                        {showArchived
                                                            ? "Hide"
                                                            : "Show"}{" "}
                                                        {plural(
                                                            archivedCount,
                                                            "archived question"
                                                        )}
                                                    </Anchor>
                                                )}
                                            </Group>
                                        ) : rows.length > 0 ? (
                                            <Stack gap="sm" mt="lg">
                                                <Text size="sm" c="dimmed">
                                                    {tickedRows.length > 0
                                                        ? BULK_NOTE
                                                        : `Every Master question is already listed. The switch decides whether ${here} asks it. Click a question to reword it or change its options for ${here}. Nothing here changes the Master or any other place.`}
                                                </Text>
                                                {compare.inherited && (
                                                    <>
                                                        <Group gap="lg">
                                                            <Group gap="xs">
                                                                <Pill
                                                                    tone="blue"
                                                                    filled
                                                                >
                                                                    Filled
                                                                </Pill>
                                                                <Text
                                                                    size="sm"
                                                                    c="dimmed"
                                                                >
                                                                    set at this level
                                                                </Text>
                                                            </Group>
                                                            <Group gap="xs">
                                                                <Pill tone="blue">
                                                                    Outlined
                                                                </Pill>
                                                                <Text
                                                                    size="sm"
                                                                    c="dimmed"
                                                                >
                                                                    set at a level
                                                                    above, here{" "}
                                                                    {nameList(
                                                                        compare
                                                                            .inherited
                                                                            .names
                                                                    )}
                                                                </Text>
                                                            </Group>
                                                        </Group>
                                                        <Text size="sm" c="dimmed">
                                                            Switching on a question
                                                            that{" "}
                                                            {nameList(
                                                                compare.inherited
                                                                    .names
                                                            )}{" "}
                                                            hides shows it in this{" "}
                                                            {levelLabel(
                                                                data.scope.level
                                                            ).toLowerCase()}{" "}
                                                            only.
                                                        </Text>
                                                    </>
                                                )}
                                            </Stack>
                                        ) : // An empty page says what it
                                        // needs in its own box.
                                        null}
                                    </>
                                )}
                            </Box>
                        </Flex>
                    </Paper>
                )}

                <QuestionFormModal
                    scope={scope}
                    placeName={here}
                    placeReach={reach}
                    listPage={
                        !master &&
                        Boolean(panel.category) &&
                        isList(panel.category._id)
                    }
                    besideList={
                        // Not for a replacement: that one takes the place of
                        // the question it replaces, wherever that is.
                        master &&
                        !panel.question &&
                        !panel.replaces &&
                        panel.category
                            ? onlyListOf(panel.category._id)
                            : null
                    }
                    {...panel}
                    opened={panel.opened && !inherits}
                    onClose={closePanel}
                    reach={data?.reach}
                    languages={languages}
                    language={language}
                    onAdd={addQuestionFromPanel}
                    onEdit={editQuestionFromPanel}
                    onArchive={() =>
                        saveDraft(
                            () =>
                                toggleQuestion({
                                    question_id: panel.question._id,
                                    rev: panel.question.rev,
                                    active: false,
                                }),
                            closePanel
                        )
                    }
                    onDelete={() =>
                        save(
                            () =>
                                deleteQuestion({
                                    id: panel.question._id,
                                    rev: panel.question.rev,
                                }),
                            (answer) => {
                                toast.success(
                                    answer.pending
                                        ? "Saved to draft"
                                        : "Question deleted"
                                );
                                closePanel();
                            }
                        )
                    }
                    onReplace={startReplacement}
                    saving={busy}
                />
                {!master && data && (
                    <PlaceQuestionPanel
                        {...panel}
                        opened={panel.opened && inherits}
                        onClose={closePanel}
                        place={{
                            _id: scope.placeId,
                            name: here,
                            reach,
                            nameOf: (id) => data.places?.[id]?.name,
                        }}
                        languages={languages}
                        language={language}
                        onSave={saveOverride}
                        // Its wording and its options, not whether it is
                        // asked: that is the switch in the list.
                        onReset={() =>
                            saveOverride({
                                label: null,
                                helper_text: null,
                                required: null,
                                options: null,
                                addedOptions: null,
                            })
                        }
                        saving={busy}
                    />
                )}
                <CategoryFormDialog
                    scope={scope}
                    placeName={here}
                    placeReach={reach}
                    {...categoryForm}
                    onClose={() => setCategoryForm(closed)}
                    language={language}
                    onAdd={(body) =>
                        saveDraft(
                            () => addCategory(body, scope),
                            (created) => {
                                setCategoryForm(closed);
                                // A new page is where the next step happens.
                                if (created.is_screen)
                                    setParams({ category: created._id });
                            }
                        )
                    }
                    onRename={(changes) =>
                        saveDraft(
                            () =>
                                editCategory({
                                    category_id: categoryForm.category._id,
                                    rev: categoryForm.category.rev,
                                    ...changes,
                                }),
                            () => setCategoryForm(closed)
                        )
                    }
                    loading={busy}
                />
                <ArchiveQuestionDialog
                    kind="category"
                    officer={scope.audience === "officer"}
                    {...removal}
                    onClose={() => setRemoval(closed)}
                    subtitle={copy.title}
                    onConfirm={removeCategory}
                    loading={busy}
                />
                <HideCategoryDialog
                    opened={hiding.opened}
                    onClose={() => setHiding(closed)}
                    name={localise(hiding.category?.title, language)}
                    placeName={here}
                    placeReach={reach}
                    onConfirm={() =>
                        saveDraft(
                            () =>
                                saveOverrides([
                                    override("category", hiding.category, {
                                        asked: false,
                                    }),
                                ]),
                            () => setHiding(closed)
                        )
                    }
                    loading={busy}
                />
                <PublishDialog
                    scope={scope}
                    placeName={here}
                    placeReach={reach}
                    {...publish}
                    onClose={() => setPublish(closed)}
                    pending={pending}
                    language={language}
                    onPublish={publishRows}
                    onDiscard={(row) =>
                        save(
                            () => discardChanges({ scope, items: row.items }),
                            () => toast.success("Change discarded")
                        )
                    }
                    busy={busy}
                />
                <HistoryDialog
                    opened={historyOpen}
                    onClose={() => setHistoryOpen(false)}
                    language={language}
                    scope={scope}
                    places={places}
                />
            </MantineShell>
        </Wrapper>
    );
}

/**
 * The page behind three addresses: the Master's, a place's
 * (`/questionnaire/place/:placeId`) and, with `audience="officer"`, the
 * officers' questionnaire (`/officer/questionnaire`).
 */
export default function EditorPage({ audience }) {
    const { placeId } = useParams();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    // The officers' questionnaire is one screen: its address names no place,
    // and only a super admin is let onto it (routes.js).
    if (audience === "officer") return <Editor scope={OFFICER} />;
    // A regional team has no Master to open: its own place's questionnaire
    // is the one it has.
    if (!placeId && user.role === "regional")
        return <Navigate to={landingFor(user)} replace={true} />;
    // Not an id at all (a link that lost its end, or "master" typed here).
    if (placeId && !/^[a-f0-9]{24}$/i.test(placeId))
        return <Navigate to="/404" replace={true} />;
    return (
        // Keyed: nothing chosen in one place (ticked rows, an open panel)
        // is carried into the next.
        <Editor
            key={placeId || "master"}
            scope={placeId ? { type: "place", placeId } : MASTER}
        />
    );
}
