import axiosInstance from "../axios/axiosInstance";
import { endpoints } from "../axios/endpoints";

const { questionnaire } = endpoints;
const { categories, questions, responses } = questionnaire;

/*
 * Two questionnaires are served from these addresses: the villagers', and
 * the one field officers answer about each village assigned to them.
 * `audience: "officer"` on a call means the second. The villagers' calls
 * carry none, which the server reads as theirs: they are sent exactly as
 * they were before the officers' questionnaire existed.
 */

/* ---------------- editor: drafts, publish, history ---------------- */

/**
 * "master", or the id of the place whose questionnaire is being edited. The
 * officers' questionnaire has the Master's scope only, with its `audience`
 * beside the type: `{ type: "master", audience: "officer" }`.
 */
export const scopeKey = (scope) =>
    scope.type === "master" ? "master" : scope.placeId;

/**
 * Everything the editor screen shows, in one request: every category and
 * question with its draft applied, and the changes waiting to be published.
 */
export const fetchEditor = async (scope) => {
    const res = await axiosInstance.get(questionnaire.editor, {
        params: { scope: scopeKey(scope), audience: scope.audience },
    });
    return res.data;
};

/** `{ questionId }` or `{ categoryId }`: how many saved answers depend on it. */
export const fetchUsage = async (params) => {
    const res = await axiosInstance.get(questionnaire.usage, { params });
    return res.data;
};

/** `items` are the `{ type, id, rev }` of the pending rows being published. */
export const publishChanges = async ({ scope, items }) => {
    const res = await axiosInstance.post(questionnaire.publish, {
        scope: scopeKey(scope),
        audience: scope.audience,
        items,
    });
    return res.data;
};

/**
 * `scope` says whose changes these are: a new order of the categories is one
 * change with no id of its own, and each questionnaire has one.
 */
export const discardChanges = async ({ scope, items }) => {
    const res = await axiosInstance.post(questionnaire.discard, {
        audience: scope.audience,
        items,
    });
    return res.data;
};

/** `params` may carry `audience`: each questionnaire has a history of its own. */
export const fetchHistory = async (params) => {
    const res = await axiosInstance.get(questionnaire.history, { params });
    return res.data;
};

/**
 * Takes back the latest published change. `id` is its history row, the one
 * `fetchHistory` names in `latest`: the latest of the questionnaire that
 * `audience` names. What cannot be put back in one step is refused (409)
 * with the reason in `message`.
 */
export const undoChange = async ({ id, audience }) => {
    const res = await axiosInstance.post(questionnaire.undo, { id, audience });
    return res.data;
};

/**
 * What a place changes about questions and categories, saved as drafts. Each
 * item is `{ placeId, targetType, targetId, rev?, patch }`. A patch holds only
 * the keys that change: a value sets one, `null` takes it back to what the
 * place inherits. Several items go in one call (hiding the ticked questions).
 */
export const saveOverrides = async (items) => {
    const res = await axiosInstance.put(questionnaire.overrides, { items });
    return res.data;
};

/**
 * What a place adds is its own: the server keeps it to that place and the
 * places inside it. Left as it is for the Master, which owns the rest.
 */
const owned = (body, scope) =>
    scope?.type === "place" ? { ...body, ownerPlaceId: scope.placeId } : body;

/* ---------------- categories ---------------- */

/**
 * Published categories only; the Responses page reads this. `place` holds the
 * list to one place: the Master's categories, those the places above it added
 * and those added in it or inside it. A regional team is held to its own
 * place whether it names one or not. `audience` picks the questionnaire.
 */
export const fetchCategories = async ({
    tree = false,
    includeInactive = true,
    place,
    audience,
} = {}) => {
    const res = await axiosInstance.get(categories.get, {
        params: {
            tree: tree ? "true" : undefined,
            includeInactive: includeInactive ? "true" : undefined,
            place: place || undefined,
            audience,
        },
    });
    return res.data;
};

// Every write below is saved as a draft. Those that change one saved document
// carry the `rev` it was read at, so the server can refuse a save made on top
// of someone else's.

export const addCategory = async (body, scope) => {
    const res = await axiosInstance.post(categories.add, {
        ...owned(body, scope),
        // A top-level category starts a branch of one questionnaire and
        // says which. One inside another is its parent's.
        audience: body.parentId ? undefined : scope?.audience,
    });
    return res.data;
};

export const editCategory = async (body) => {
    const res = await axiosInstance.put(categories.edit, body);
    return res.data;
};

export const reparentCategory = async (body) => {
    const res = await axiosInstance.put(categories.reparent, body);
    return res.data;
};

export const reorderCategories = async (body) => {
    const res = await axiosInstance.put(categories.reorder, body);
    return res.data;
};

export const deleteCategory = async ({ id, rev }) => {
    const res = await axiosInstance.delete(categories.delete, { params: { id, rev } });
    return res.data;
};

/* ---------------- questions ---------------- */

export const addQuestion = async (body, scope) => {
    const res = await axiosInstance.post(questions.add, owned(body, scope));
    return res.data;
};

export const editQuestion = async (body) => {
    const res = await axiosInstance.put(questions.edit, body);
    return res.data;
};

export const toggleQuestion = async (body) => {
    const res = await axiosInstance.put(questions.toggle, body);
    return res.data;
};

export const reorderQuestions = async (body) => {
    const res = await axiosInstance.put(questions.reorder, body);
    return res.data;
};

/** `{ question_id, rev, categoryId }`: a question a place added, to another page. */
export const moveQuestion = async (body) => {
    const res = await axiosInstance.put(questions.move, body);
    return res.data;
};

/**
 * The Master's questions, one or several, to a new place: `{ items: [{
 * question_id, rev }], categoryId, parentQuestionId, before }` (null parent:
 * the top of the page; null before: at the end). As a draft.
 */
export const arrangeQuestions = async (body) => {
    const res = await axiosInstance.put(questions.arrange, body);
    return res.data;
};

export const deleteQuestion = async ({ id, rev }) => {
    const res = await axiosInstance.delete(questions.delete, { params: { id, rev } });
    return res.data;
};

/* ---------------- responses ---------------- */

/**
 * `params` is already in wire shape: `categoryId`, `place` (a place of any
 * level; without one a super admin gets every place and a regional team its
 * own), `from`, `to`, `user` (words of a villager's name or phone number),
 * `page`, `limit` and `f`. `f` may be an array, which axios serialises as
 * repeated query params, matching the backend's repeatable-filter contract.
 *
 * With `audience: "officer"` the three calls below read what field officers
 * saved: one response per village and page, each row carrying `villageName`
 * and `savedBy` (the officer who saved last) where a villager's carries
 * `userName`; `user` then searches the village's name and the officer's
 * name or phone number.
 */
export const fetchResponses = async (params) => {
    const res = await axiosInstance.get(responses.list, { params });
    return res.data;
};

export const fetchResponseRows = async (params) => {
    const res = await axiosInstance.get(responses.rows, { params });
    return res.data;
};

export const fetchResponseStats = async (params) => {
    const res = await axiosInstance.get(responses.stats, { params });
    return res.data;
};

/**
 * One photo or recording of an answer, as a Blob whose `type` is what the
 * server found the file to be. `thumb` asks for the small copy kept of a
 * photo. A file the account may not see is a 404, like one that is not there.
 */
export const fetchFile = async (id, { thumb = false } = {}) => {
    const res = await axiosInstance.get(
        // The id can come from an address someone typed. It stays one part
        // of the path whatever it holds.
        `${questionnaire.file}/${encodeURIComponent(id)}`,
        { params: { thumb: thumb ? 1 : undefined }, responseType: "blob" }
    );
    return res.data;
};
