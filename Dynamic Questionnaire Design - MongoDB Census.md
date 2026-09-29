# Dynamic Questionnaire System — Design Notes

## Context

This app currently collects census-style data via **hardcoded questions**
in React Native screens. Each category/segment of questions has its own
MongoDB collection, and answers are stored per the fixed schema baked
into the app.

**Goal:** move to a system where an admin can create/edit questions and
categories ("screens") dynamically through a web dashboard, without
requiring a mobile app release. The React Native app should render
questions dynamically from the backend, and store dynamic answers —
while keeping MongoDB well-structured enough for analysts and dashboards
to query reliably, with no schema drift or orphaned/misattributed data.

This document captures the architecture and reasoning agreed on, so it
can be implemented consistently.

---

## Core principle

> **Never let a user-authored question label become a MongoDB field
> name.** Keep the document shape fixed; only the *content* (question
> text, type, options, answer values) is dynamic.

The critical invariant across the entire system:

> **`questionId` is the only thing that ever binds an answer to a
> question.** Label, wording, order, and options can change freely on
> the `questions` side without ever corrupting or orphaning data on the
> `responses` side. Nothing is ever matched by array index or by
> position — only by `questionId`.

---

## Collections

### `categories`
Represents a "screen" in the app.
```
{
  _id,
  title,
  order,
  active
}
```

### `questions`
```
{
  _id,
  categoryId,
  label,
  type,        // enum: text | number | single_select | multi_select | date | boolean
  options,     // for select types
  required,
  order,       // DISPLAY ONLY — never used to bind answers
  active,
  replacedBy   // optional, see "Editing questions" below
}
```

`type` drives both rendering (which input component to show) and
server-side validation (expected shape of `value`).

### `responses`
One doc per user submission per category:
```
{
  userId,
  categoryId,
  submittedAt,
  answers: [
    {
      questionId,
      label,      // SNAPSHOT of the question label at submit time
      type,       // SNAPSHOT of the type at submit time
      options,    // SNAPSHOT of options at submit time (if applicable)
      value
    }
  ]
}
```

Index on `answers.questionId`, `categoryId`, `userId`.

---

## Why answers are snapshotted, not just referenced by ID + version

Initial idea was `{questionId, questionVersion, value}` with a live
lookup to render historical answers. **Rejected** — this breaks the
moment a question is edited, because the app would re-render old
answers next to the *current* wording, which may no longer match what
the user was actually asked. Example: "How many people in your
household?" (answered "5") silently relabeled as "How many males in
your household?" if edited in place — actively wrong data.

**Fix:** each answer copies (`label`, `type`, `options`) into the
response at submit time. A response is a frozen, self-contained record
of exactly what the user was asked and what they answered. It never
depends on the live `questions` collection to render correctly, and it
can never be corrupted by a later edit.

---

## Editing questions: cosmetic vs. structural

This is the key operational rule for admins/editors.

- **Cosmetic edit** (typo fix, rewording that doesn't change meaning,
  reformatting) → edit the `questions` doc in place. Safe — new
  respondents see the fix; old snapshots are already frozen and
  unaffected.

- **Structural edit** (changes what's actually being asked, changes
  `type`, changes/removes options in a way that changes meaning) →
  **never edit in place.** Create a **new** question doc with a new
  `_id`. Mark the old doc `active: false, replacedBy: <newId>`.

  A structural change is a *new question*, not a new version of the old
  one. This is what prevents the "5 people" / "how many males" chaos
  scenario.

The `replacedBy` chain lets analysts consciously decide how (or
whether) to reconcile trend data across a structural change — this is
an analyst decision, not something the system should silently paper
over.

---

## Rendering flow (merge-on-load)

When a user opens a category screen, merge two sources by `questionId`:

1. **Live question set:** `questions.find({categoryId, active: true})`,
   sorted by `order`.
2. **User's existing response doc** for that category (their
   `answers[]` snapshots).

```
for each question in live question set (in `order`):
    match = user's answers.find(a => a.questionId === question._id)
    if match:
        render pre-filled from match.value   // answered, editable
    else:
        render empty                          // new, needs response
```

This single merge handles every case discussed:

- **New question added by admin:** no matching entry in `answers[]` →
  renders blank/unanswered, regardless of where in the order it was
  inserted.
- **Question reordered, or new question inserted mid-list:** `order`
  only changes *display sequence* of the live question set. It has no
  bearing on the merge — answers are still matched purely by
  `questionId`, so nothing gets misattributed even when array positions
  shift.
- **Structural replacement (old question retired, new one created):**
  old question is `active: false` so it drops out of the live set; new
  question has no match in `answers[]` so it renders blank. The user's
  original answer to the *old* question remains intact in their
  response history (for audit/analytics) but is not shown as if it
  answers the new question.

### Optional: "pending questions" indicator
Compute per category:
```
live active question count vs. count of matched questionIds in user's answers
```
If they differ, show a "new questions to answer" badge on that
category in the UI. Cheap to compute from the same merge.

---

## Validation

Validate `value` server-side against the question's current `type` /
`options` at submit time (e.g. `single_select` must be one of
`options`; `number` must be numeric / within range). This — not the
storage shape alone — is what prevents garbage data from entering the
system as questions evolve.

---

## Analytics / dashboard layer

Raw Mongo with array-of-pairs (`answers[]`) is good for app writes but
not naturally tabular for BI tools. Two options, can coexist:

1. **Aggregation pipeline on read:** `$unwind` `answers`, optionally
   `$lookup` against `questions` for anything not already snapshotted,
   reshape per category.
2. **Scheduled ETL / flatten job:** periodically flatten `responses`
   into per-category wide tables/materialized views (Mongo collection,
   or push to Postgres/BigQuery if the dashboard needs heavier
   querying/joins).

Because every answer is self-contained (snapshotted label/type/value)
and keyed by immutable `questionId`, this flattening is reliable even
as questions evolve over time — historical rows don't need the live
`questions` collection to be meaningful.

---

## Editing questions, refined: what counts as "structural"

Clarifying rule (supersedes the simple cosmetic/structural split above
for the specific case of editing `options`):

> **The real test is: does this edit change what a past answer means?**
> If yes → structural (new `questionId`). If no → cosmetic (edit in
> place).

- **Changing `type`** → always structural. Never allowed in place.
  Always create a new question doc.
- **Adding an option** to a `select`/`multi_select` question → cosmetic,
  safe to edit in place. Past answers are unaffected — they simply
  weren't offered the new choice.
- **Removing an option** → cosmetic, safe to edit in place. This is
  safe specifically *because* answers snapshot their options at submit
  time (see snapshotting section above) — a past answer still shows
  exactly what was picked and what the full option set looked like at
  that time, even if the option is gone from the live question.
- **Renaming an option's label with no change in meaning** (typo/
  wording fix) → cosmetic.
- **Renaming/changing an option such that its *meaning* shifts** (e.g.
  `"3–5 people"` → `"3–4 people"`, or a scale's endpoints change) →
  **structural**, even though only "an option" changed. A past answer
  of "3–5 people" no longer means what the new option label says.
  Treat as a new question (new `_id`), retire the old one via
  `active: false` + `replacedBy`.

In short: **type changes are always structural; option changes are
cosmetic unless the meaning of the option itself changes.**

---

## Geographic targeting (country / district)

Questions target specific countries and, within them, specific
districts. Admin manages a `countries` → `districts` hierarchy, and
each question is, by default, active everywhere — admin can then
deselect specific countries or districts they don't want that question
shown in.

### Collections
```
countries: { _id, name, code, active }
districts: { _id, countryId, name, active }
```

### Targeting field on `questions`
```
targeting: {
  excludedCountries: [countryId, ...],
  excludedDistricts: [districtId, ...]
}
```

**Exclusion-based, not inclusion-based** — this matches the UX
directly: everything is selected by default (empty arrays = applies
everywhere), and admin "deselect" actions simply add entries to these
lists. Avoids having to store a large "included everywhere" list when
there may be many countries/districts.

- Deselecting an entire **country** → add its `_id` to
  `excludedCountries`. This implicitly excludes all its districts too
  — no need to also enumerate them in `excludedDistricts`.
- Deselecting a single **district** under an otherwise-included country
  → add its `_id` to `excludedDistricts`.

### Filtering — server-side, before the merge-by-`questionId` step

The backend already knows the requesting user's `countryId` /
`districtId` (from their profile). When fetching the live question set
for a category, filter first:

```
question applies to user if:
  user.countryId NOT IN question.targeting.excludedCountries
  AND
  user.districtId NOT IN question.targeting.excludedDistricts
```

This is a `$match`/filter stage that runs *before* the existing
merge-on-load logic (matching live questions against the user's
`answers[]` by `questionId`). Nothing about the merge logic changes —
geography just narrows which questions count as "live" for that
particular user, so the client only ever receives questions relevant
to their location (also serves the lean-API goal — no wasted payload
on irrelevant questions).

### Admin dashboard requirements
- CRUD section for `countries` and `districts` (add/edit/deactivate).
- On each question's edit screen: a location tree (countries →
  districts) with checkboxes, all checked by default; admin unchecks
  the ones to exclude. Persist as `excludedCountries` /
  `excludedDistricts`.

---

## Non-functional targets: app size & API payload

### React Native app size (~10–12MB target)
Realistic primarily on Android; iOS has a higher fixed framework floor.
- Ship an **Android App Bundle (.aab)**, not a universal APK — Play
  Store serves per-device optimized splits. Largest single win.
- Use **Hermes** engine (RN default) with **Proguard/R8** minification
  enabled.
- Avoid heavy dependencies: no `moment.js` (use `dayjs`), import
  individual lodash functions rather than the full package, avoid
  bundling multiple icon-font sets.
- Lazy-load / code-split screens not needed at first launch.
- Compress images to WebP; strip unused assets.
- Because question rendering is config-driven (`type` → component), a
  small internal renderer/switch is enough — no need for a heavy
  third-party dynamic-form library, which keeps bundle size down.

### Node/Express API leanness
- Use **explicit Mongo projections** on every query — never fetch full
  documents when only a few fields are needed.
- Use **`.lean()`** in Mongoose — skips document hydration, returns
  plain JS objects, faster serialization.
- Return **DTOs shaped to exactly what the screen needs** — strip
  `__v`, internal admin-only flags, and any field the client doesn't
  render. Never forward raw Mongo docs as API responses.
- Enable **gzip/brotli compression** middleware.
- **Paginate** all list endpoints (questions, responses).
- Cache the **live question set** per category (in-memory or Redis) —
  it's read constantly but changes rarely; invalidate only on admin
  edit.

---

## Summary for implementation

- `questions` and `categories` are the *live, mutable* definitions.
- `responses` are *frozen, self-contained* records — label/type/options
  snapshotted at submit time, value keyed to `questionId`.
- Cosmetic edits: mutate in place. Structural edits: new `questionId`,
  old one retired via `active: false` + `replacedBy`. Test: "does this
  edit change what a past answer means?" Type changes are always
  structural; option changes are cosmetic unless the option's meaning
  itself shifts.
- Target RN app size ~10–12MB (mainly achievable via Android App
  Bundle splitting + Hermes + minimal deps); API should return lean,
  projected DTOs only, with compression and caching on read-heavy,
  rarely-changing data like live question sets.
- Questions carry geographic targeting (`excludedCountries` /
  `excludedDistricts`, default = applies everywhere). Filtering by the
  user's location happens server-side, as a step before the
  merge-by-`questionId` render logic — so the client only ever gets
  location-relevant questions.
- All matching between answers and questions — on render, on submit, in
  analytics — is by `questionId` only, never by array index or
  position.
- `order` is purely a rendering concern on `questions`; it never
  appears in `responses` and never participates in matching logic.
