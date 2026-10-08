import {
    Alert,
    Anchor,
    Box,
    Button,
    Divider,
    Group,
    Modal,
    NumberInput,
    Select,
    Stack,
    Switch,
    Text,
    TextInput,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { fetchUsage } from "../../../functions/questionnaire";
import ChildQuestionsEditor from "./ChildQuestionsEditor";
import {
    ArchiveQuestionDialog,
    MasterImpactDialog,
    ReplacementDialog,
} from "./ConfirmDialogs";
import LocalisedInput from "./LocalisedInput";
import OptionsList from "./OptionsList";
import {
    PARENT_TYPES,
    QUESTION_TYPES,
    SELECT_TYPES,
    STICKY_FOOTER,
    nameList,
    plural,
    shortTypeLabel,
} from "./constants";
import {
    DEFAULT_LANGUAGE,
    languageName,
    localise,
    withoutBlanks,
} from "./localise";
import { SectionHeading } from "./shell";

// The design opens on a single select with two empty rows to fill in.
const emptyForm = {
    label: {},
    helper_text: {},
    type: "single_select",
    options: [
        { value: "", label: {} },
        { value: "", label: {} },
    ],
    children: [],
    required: false,
    min: "",
    max: "",
    presentation: "inline",
};

/**
 * A saved question as form values, fields of a group included. `saved` marks
 * the options whose key is already stored with answers: the options list
 * locks those and offers Archive instead of Remove.
 */
const toForm = (question) => ({
    ...emptyForm,
    ...question,
    label: question.label || {},
    helper_text: question.helper_text || {},
    min: question.min ?? "",
    max: question.max ?? "",
    presentation: question.presentation || "inline",
    options: (question.options || []).map((option) => ({
        ...option,
        saved: true,
    })),
    children: (question.children || []).map(toForm),
});

const number = (value) =>
    value === "" || value === null || value === undefined ? null : Number(value);

/** Form values as the API takes them. A row left wholly blank is no option. */
const payloadOf = (form) => ({
    label: withoutBlanks(form.label),
    helper_text: withoutBlanks(form.helper_text),
    type: form.type,
    options: SELECT_TYPES.includes(form.type)
        ? (form.options || [])
              .filter((option) => option.value || localise(option.label))
              .map((option) => ({
                  value: (option.value || "").trim(),
                  label: withoutBlanks(option.label),
                  ...(option.archived && { archived: true }),
              }))
        : [],
    required: form.type !== "section" && Boolean(form.required),
    min: number(form.min),
    max: number(form.max),
    presentation: form.presentation || "inline",
});

/** What stops a save, in words. The server checks everything again. */
const problemWith = (form, field = false) => {
    const body = payloadOf(form);
    if (!body.label[DEFAULT_LANGUAGE])
        return field
            ? "Every field needs a label in English."
            : "Enter the question in English.";
    if (SELECT_TYPES.includes(body.type)) {
        if (!body.options.some((option) => !option.archived))
            return "Add at least one option.";
        if (
            body.options.some(
                (option) => !option.value || !option.label[DEFAULT_LANGUAGE]
            )
        )
            return "Every option needs a label in English and a key.";
        if (
            new Set(body.options.map((option) => option.value)).size <
            body.options.length
        )
            return "Two options have the same key.";
    }
    return PARENT_TYPES.includes(body.type)
        ? (form.children || [])
              .map((child) => problemWith(child, true))
              .find(Boolean)
        : undefined;
};

const changedKeys = (before, after) =>
    Object.keys(after).filter(
        (key) => JSON.stringify(after[key]) !== JSON.stringify(before[key])
    );

const pick = (source, keys) =>
    Object.fromEntries(keys.map((key) => [key, source[key]]));

/** Every field under a question, at any depth, by id. */
const fieldsById = (question, found = new Map()) => {
    (question?.children || []).forEach((child) => {
        found.set(child._id, child);
        fieldsById(child, found);
    });
    return found;
};

/**
 * What to send for the fields of a group or section, as a tree of
 * `{ _id, rev, body, children }`: everything for a new field, and for a saved
 * one only what changed. Sending a saved field whole would put every one of
 * them in the list of changes to publish.
 */
const fieldWrites = (children, originals) =>
    children.map((child) => {
        const body = payloadOf(child);
        const original = originals.get(child._id);
        return {
            _id: child._id,
            rev: child.rev,
            body: original
                ? pick(body, changedKeys(payloadOf(toForm(original)), body))
                : body,
            children: PARENT_TYPES.includes(child.type)
                ? fieldWrites(child.children || [], originals)
                : [],
        };
    });

const hasWrites = (write) =>
    !write._id ||
    Object.keys(write.body).length > 0 ||
    write.children.some(hasWrites);

/** Whether a saved field, at any depth, is about to have one of `keys` changed. */
const touches = (writes, keys) =>
    writes.some(
        (write) =>
            (write._id && keys.some((key) => key in write.body)) ||
            touches(write.children, keys)
    );

const answeredAnywhere = (question) =>
    Boolean(question.answered) ||
    (question.children || []).some(answeredAnywhere);

// The wording that belongs to one kind of questionnaire: the Master's here,
// a place's from `placeCopy`, so neither is threaded through the panel.
const COPY = {
    master: {
        addTitle: "Add question to the Master",
        addNote:
            "Every place gets this question, switched on. A regional team can switch it off or reword it for its own place.",
        editTitle: "Edit question",
        editSubtitle: (page) => `Master questionnaire · ${page}`,
        editNote: (reach) =>
            `You are editing the Master. Changes reach every place that has not made its own change to this question: ${plural(
                reach?.countries ?? 0,
                "country",
                "countries"
            )}, ${plural(reach?.villages ?? 0, "village")}.`,
    },
};

/** For a question a place added itself (PDF p.16), in that place's name. */
const placeCopy = (name, reach) => {
    const note = `This question is asked in ${reach} only. It is not added to the Master or to any other place.`;
    return {
        addTitle: `Add question to ${name}`,
        addNote: note,
        editTitle: `Edit question for ${name}`,
        editSubtitle: (page) => `${name} · ${page}`,
        editNote: () => note,
    };
};

/**
 * "Asked in every place. Reworded in Ladakh." (PDF p.3): where places differ
 * from the Master on this question, with every place named.
 */
const whereUsed = ({
    hiddenIn = [],
    rewordedIn = [],
    optionsChangedIn = [],
} = {}) =>
    [
        `Asked in every place${
            hiddenIn.length ? ` except ${nameList(hiddenIn)}` : ""
        }.`,
        rewordedIn.length && `Reworded in ${nameList(rewordedIn)}.`,
        optionsChangedIn.length &&
            `Options changed in ${nameList(optionsChangedIn)}.`,
    ]
        .filter(Boolean)
        .join(" ");

/**
 * The panel a question is added and edited in (PDF p.3 and p.4).
 *
 * It decides WHAT a save consists of and hands that to the editor, which
 * sends it: `onAdd(body, fields)`, or `onEdit(changes, fields)` with only the
 * keys that differ from the saved question.
 *
 * Adding a replacement is the add form with `replaces` (the old question) and
 * `preset` (the chosen type, and the wording and options when they were
 * copied). `copiesFields` says the server copies the old group's fields, so
 * none are authored here.
 *
 * In a place it serves the questions that place added itself (p.16);
 * `placeName` is the place's name. Such a question is never archived or
 * replaced, and is deleted only while it has not been published. On a
 * `listPage` (one repeating list) a new question goes inside each entry.
 */
export default function QuestionFormModal({
    scope,
    placeName,
    placeReach,
    listPage,
    opened,
    onClose,
    question,
    category,
    replaces,
    preset,
    copiesFields,
    reach,
    languages,
    language: pageLanguage,
    onAdd,
    onEdit,
    onArchive,
    onDelete,
    onReplace,
    saving,
}) {
    const {
        control,
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { isDirty },
    } = useForm({ defaultValues: emptyForm });
    const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
    // The three questions this panel can ask on top of itself.
    const [impact, setImpact] = useState({ opened: false });
    const [removing, setRemoving] = useState(false);
    const [replacing, setReplacing] = useState(false);

    const master = scope.type === "master";
    const copy = master ? COPY.master : placeCopy(placeName, placeReach);
    const type = watch("type");
    const isGroup = type === "repeatable_group";
    const locked = Boolean(question?.answered);
    const answered = Boolean(question) && answeredAnywhere(question);
    // Only the Master archives. What a place may remove, it deletes.
    const archives = master && answered;
    const archived =
        question?.active === false || Boolean(question?.replacedByPending);

    // Filled when the panel opens and not again while it is open, so a
    // reload of the list behind it cannot wipe what is being typed.
    useEffect(() => {
        if (!opened) return;
        setLanguage(pageLanguage);
        setImpact({ opened: false });
        setRemoving(false);
        setReplacing(false);
        reset(question ? toForm(question) : { ...emptyForm, ...preset });
    }, [opened, question, preset, pageLanguage, reset]);

    // Only an answered question has options that cannot simply be deleted.
    const { data: usage } = useQuery({
        queryKey: ["questionnaire-usage", "question", question?._id],
        queryFn: () => fetchUsage({ questionId: question._id }),
        enabled: opened && answered,
    });

    const page = localise(category?.title, pageLanguage);
    const name = localise(question?.label, pageLanguage);
    const subtitle = question
        ? copy.editSubtitle(page)
        : replaces
        ? page
        : `${page} · ${
              listPage ? "added to each entry" : "added at the end of the page"
          }`;

    const requestClose = () => {
        if (
            isDirty &&
            !window.confirm("Close without saving what you changed?")
        )
            return;
        onClose();
    };

    const onSubmit = (form) => {
        const problem = problemWith(form);
        if (problem) {
            // English is what can be missing while another language is shown.
            setLanguage(DEFAULT_LANGUAGE);
            toast.error(problem);
            return;
        }
        const body = payloadOf(form);
        const fields =
            PARENT_TYPES.includes(form.type) && !copiesFields
                ? fieldWrites(form.children || [], fieldsById(question))
                : [];
        if (!question) return onAdd(body, fields);

        const changes = pick(
            body,
            changedKeys(payloadOf(toForm(question)), body)
        );
        if (!Object.keys(changes).length && !fields.some(hasWrites))
            return onClose();

        const reworded =
            "label" in changes ||
            "helper_text" in changes ||
            touches(fields, ["label", "helper_text"]);
        // A new type empties the options by itself; that is not this edit.
        const reoptioned =
            ("options" in changes && !("type" in changes)) ||
            touches(fields, ["options"]);
        // Nothing reaches a place from a question that was never published.
        if (master && !question.unpublished && (reworded || reoptioned)) {
            setImpact({
                opened: true,
                wording: reworded,
                // Places that reworded THIS question keep their wording.
                // How far a reworded field reaches is not counted apart.
                kept:
                    "label" in changes || "helper_text" in changes
                        ? question.usage?.wording
                        : undefined,
                summary: [
                    reworded && "wording changed",
                    reoptioned && "options changed",
                ]
                    .filter(Boolean)
                    .join(", "),
                save: () => onEdit(changes, fields),
            });
            return;
        }
        onEdit(changes, fields);
    };

    return (
        <>
            <Modal
                opened={opened}
                onClose={requestClose}
                // Esc reaches every open dialog: it must close only the one
                // on top.
                closeOnEscape={!impact.opened && !removing && !replacing}
                size={580}
                centered
                radius="md"
                title={
                    <Box>
                        <Text fw={700}>
                            {question ? copy.editTitle : copy.addTitle}
                        </Text>
                        <Text size="xs" c="dimmed">
                            {subtitle}
                        </Text>
                    </Box>
                }
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack gap="md">
                        <Alert variant="light">
                            {question ? copy.editNote(reach) : copy.addNote}
                        </Alert>
                        {replaces && (
                            <Text size="sm">
                                Replaces “{localise(replaces.label, pageLanguage)}
                                ”, which is archived when you publish.
                            </Text>
                        )}

                        <Group justify="space-between" wrap="nowrap">
                            <SectionHeading>Wording</SectionHeading>
                            <Select
                                aria-label="Language"
                                w={150}
                                allowDeselect={false}
                                data={languages.map((code) => ({
                                    value: code,
                                    label: languageName(code),
                                }))}
                                value={language}
                                onChange={setLanguage}
                            />
                        </Group>
                        <Controller
                            control={control}
                            name="label"
                            render={({ field }) => (
                                <LocalisedInput
                                    label="Question"
                                    language={language}
                                    value={field.value}
                                    onChange={field.onChange}
                                    data-autofocus
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="helper_text"
                            render={({ field }) => (
                                <LocalisedInput
                                    label="Helper text"
                                    language={language}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Optional. Shown under the question"
                                />
                            )}
                        />

                        <Divider />
                        <SectionHeading>Answer</SectionHeading>
                        {locked || preset?.type ? (
                            <TextInput
                                label="Answer type"
                                disabled
                                readOnly
                                value={`${shortTypeLabel(type)}${
                                    locked ? " (locked)" : ""
                                }`}
                                description={
                                    locked &&
                                    "Locked because answers are already saved. Changing it would change what past answers mean."
                                }
                                inputWrapperOrder={[
                                    "label",
                                    "input",
                                    "description",
                                ]}
                            />
                        ) : (
                            <Controller
                                control={control}
                                name="type"
                                render={({ field }) => (
                                    <Select
                                        label="Answer type"
                                        allowDeselect={false}
                                        // A field inside a group or
                                        // section does not become one.
                                        data={QUESTION_TYPES.filter(
                                            (entry) =>
                                                !question?.parentQuestionId ||
                                                !PARENT_TYPES.includes(
                                                    entry.value
                                                ) ||
                                                entry.value === question.type
                                        ).map((entry) => ({
                                            value: entry.value,
                                            label: shortTypeLabel(entry.value),
                                        }))}
                                        value={field.value}
                                        onChange={field.onChange}
                                        description="Choose carefully. The type locks once the first answer is saved."
                                        inputWrapperOrder={[
                                            "label",
                                            "input",
                                            "description",
                                        ]}
                                    />
                                )}
                            />
                        )}
                        {/* One replacement at a time: the server refuses a
                            second while the first waits to be published. */}
                        {master && locked && !question.replacedByPending && (
                            <Anchor
                                component="button"
                                type="button"
                                size="sm"
                                fw={600}
                                style={{ alignSelf: "flex-start" }}
                                onClick={() => setReplacing(true)}
                            >
                                Create a replacement question
                            </Anchor>
                        )}

                        {(type === "number" || isGroup) && (
                            <Group grow>
                                <Controller
                                    control={control}
                                    name="min"
                                    render={({ field }) => (
                                        <NumberInput
                                            label={isGroup ? "Min rows" : "Minimum"}
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name="max"
                                    render={({ field }) => (
                                        <NumberInput
                                            label={isGroup ? "Max rows" : "Maximum"}
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                            </Group>
                        )}

                        {isGroup && (
                            <Controller
                                control={control}
                                name="presentation"
                                render={({ field }) => (
                                    <Select
                                        label="How rows are entered"
                                        allowDeselect={false}
                                        data={[
                                            {
                                                value: "inline",
                                                label: "Inline — “+ Add row” on the same screen",
                                            },
                                            {
                                                value: "screen",
                                                label: "Sub-screen — tapping a row opens its own screen",
                                            },
                                        ]}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        )}

                        {type !== "section" && (
                            <Controller
                                control={control}
                                name="required"
                                render={({ field }) => (
                                    <Switch
                                        checked={Boolean(field.value)}
                                        onChange={(event) =>
                                            field.onChange(
                                                event.currentTarget.checked
                                            )
                                        }
                                        label="Required"
                                        description="The app will not let someone finish this page without answering."
                                        styles={{ label: { fontWeight: 700 } }}
                                    />
                                )}
                            />
                        )}

                        {SELECT_TYPES.includes(type) && (
                            <>
                                <Divider />
                                <OptionsList
                                    control={control}
                                    register={register}
                                    watch={watch}
                                    setValue={setValue}
                                    mode={question ? "edit" : "add"}
                                    language={language}
                                    // Not answered: nothing holds any option,
                                    // so every one of them can be deleted.
                                    usedOptions={
                                        locked ? usage?.usedOptions : []
                                    }
                                />
                            </>
                        )}

                        {PARENT_TYPES.includes(type) && (
                            <>
                                <Divider />
                                {copiesFields ? (
                                    <Text size="sm" c="dimmed">
                                        Its fields are copied from “
                                        {localise(replaces?.label, pageLanguage)}
                                        ” when you add it. Open the new
                                        question afterwards to change them.
                                    </Text>
                                ) : (
                                    <ChildQuestionsEditor
                                        control={control}
                                        register={register}
                                        watch={watch}
                                        setValue={setValue}
                                        language={language}
                                        parentType={type}
                                    />
                                )}
                            </>
                        )}

                        {master && question && (
                            <>
                                <Divider />
                                <Box>
                                    <SectionHeading>
                                        Where it is used
                                    </SectionHeading>
                                    <Text size="sm" mt={4}>
                                        {whereUsed(question.usage)}
                                    </Text>
                                    <Text size="sm" c="dimmed" mt={4}>
                                        Read only. Each regional team switches
                                        questions on or off for its own place.
                                    </Text>
                                </Box>
                            </>
                        )}

                        <Group
                            justify="space-between"
                            gap="sm"
                            wrap="nowrap"
                            style={STICKY_FOOTER}
                        >
                            {/* Answers decide which: what has any is
                                archived, what has none is deleted. A place
                                archives nothing: it deletes what it has
                                not published yet, and hides the rest. */}
                            {question &&
                            (master
                                ? !(answered && archived)
                                : question.unpublished) ? (
                                <Button
                                    variant="outline"
                                    color="red.9"
                                    onClick={() => setRemoving(true)}
                                >
                                    {archives
                                        ? "Archive question"
                                        : "Delete question"}
                                </Button>
                            ) : (
                                <span />
                            )}
                            <Group gap="sm" wrap="nowrap">
                                <Button variant="default" onClick={requestClose}>
                                    Cancel
                                </Button>
                                <Button type="submit" loading={saving}>
                                    {question ? "Save to draft" : "Add question"}
                                </Button>
                            </Group>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            <MasterImpactDialog
                opened={opened && impact.opened}
                onClose={() => setImpact({ ...impact, opened: false })}
                name={name}
                summary={impact.summary}
                wording={impact.wording}
                reach={reach}
                kept={impact.kept}
                onConfirm={() => {
                    setImpact({ ...impact, opened: false });
                    impact.save();
                }}
            />
            <ArchiveQuestionDialog
                opened={opened && removing}
                onClose={() => setRemoving(false)}
                target={
                    question && {
                        _id: question._id,
                        name,
                        unpublished: question.unpublished,
                    }
                }
                subtitle={subtitle}
                remove={!archives}
                lead={
                    master
                        ? undefined
                        : `This question was added in ${placeName} and has not been published, so it can be deleted.`
                }
                onConfirm={archives ? onArchive : onDelete}
                loading={saving}
            />
            <ReplacementDialog
                opened={opened && replacing}
                onClose={() => setReplacing(false)}
                question={question}
                name={name}
                // Closed in the same step: the panel is about to hold the
                // new question, and this dialog is about the old one.
                onCreate={(choice) => {
                    setReplacing(false);
                    onReplace(choice);
                }}
            />
        </>
    );
}
