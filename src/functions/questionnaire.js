import axiosInstance from "../axios/axiosInstance";
import { endpoints } from "../axios/endpoints";

const { questionnaire } = endpoints;
const { categories, questions, responses } = questionnaire;

/* ---------------- editor: drafts, publish, history ---------------- */

/** "master", or the id of the place whose questionnaire is being edited. */
export const scopeKey = (scope) =>
    scope.type === "master" ? "master" : scope.placeId;

/**
 * Everything the editor screen shows, in one request: every category and
 * question with its draft applied, and the changes waiting to be published.
 */
export const fetchEditor = async (scope) => {
    const res = await axiosInstance.get(questionnaire.editor, {
        params: { scope: scopeKey(scope) },
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
        items,
    });
    return res.data;
};

export const discardChanges = async (items) => {
    const res = await axiosInstance.post(questionnaire.discard, { items });
    return res.data;
};

export const fetchHistory = async (params) => {
    const res = await axiosInstance.get(questionnaire.history, { params });
    return res.data;
};

/**
 * Takes back the latest published change. `id` is its history row, the one
 * `fetchHistory` names in `latest`. What cannot be put back in one step is
 * refused (409) with the reason in `message`.
 */
export const undoChange = async (id) => {
    const res = await axiosInstance.post(questionnaire.undo, { id });
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
 * place whether it names one or not.
 */
export const fetchCategories = async ({ tree = false, includeInactive = true, place } = {}) => {
    const res = await axiosInstance.get(categories.get, {
        params: {
            tree: tree ? "true" : undefined,
            includeInactive: includeInactive ? "true" : undefined,
            place: place || undefined,
        },
    });
    return res.data;
};

// Every write below is saved as a draft. Those that change one saved document
// carry the `rev` it was read at, so the server can refuse a save made on top
// of someone else's.

export const addCategory = async (body, scope) => {
    const res = await axiosInstance.post(categories.add, owned(body, scope));
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
