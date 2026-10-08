import {
    Alert,
    Anchor,
    Box,
    Button,
    Divider,
    Group,
    Modal,
    Select,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ResetDialog } from "./ConfirmDialogs";
import LocalisedInput from "./LocalisedInput";
import OptionsList from "./OptionsList";
import StatusPill from "./StatusPill";
import {
    SELECT_TYPES,
    STICKY_FOOTER,
    shortTypeLabel,
} from "./constants";
import {
    DEFAULT_LANGUAGE,
    languageName,
    localise,
    withoutBlanks,
} from "./localise";
import { SectionHeading } from "./shell";

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Whether two wordings say the same in every language, blanks left aside. */
const sameWording = (a, b) => {
    const [one, other] = [withoutBlanks(a), withoutBlanks(b)];
    const languages = Object.keys(one);
    return (
        languages.length === Object.keys(other).length &&
        languages.every((code) => one[code] === other[code])
    );
};

const written = (wording) => Object.keys(withoutBlanks(wording)).length > 0;

/**
 * What to save for one wording box: nothing (`undefined`) when it holds what
 * it held, `null` when the place goes back to the wording it inherits (the
 * box was emptied, or the inherited wording typed back), and otherwise what
 * was typed.
 */
const wordingPatch = (typed, shown, inherited) => {
    const next = withoutBlanks(written(typed) ? typed : inherited);
    if (sameWording(next, shown)) return undefined;
    return sameWording(next, inherited) ? null : next;
};

/**
 * What changed among the options, as the `options` and `addedOptions` of a
 * patch, each left out when it did not change.
 *
 * `options` is the place's whole list of switches. The server keeps a switch
 * only where it differs from what the place inherits. So a switch it holds
 * goes back to what is inherited when it is flipped (and is dropped), while
 * one it does not hold starts to differ (and is added). Only the switches
 * moved here are touched: the rest of the list is sent back as it was.
 */
const optionsPatch = (form, question, placeId) => {
    const patch = {};
    const before = new Map(
        question.options.map((option) => [option.value, option])
    );
    const rows = form.options.filter((option) => option.value);
    const switches = new Map(
        (question.own?.state?.options || []).map((entry) => [
            entry.value,
            entry.asked,
        ])
    );
    let moved = false;
    rows.forEach(({ value, asked }) => {
        if (asked === before.get(value).asked) return;
        moved = true;
        if (!switches.delete(value)) switches.set(value, asked);
    });

    const mine = (option) => !option.value || option.addedBy === placeId;
    const own = (list) => list.filter((option) => !option.archived && mine(option));
    const shape = ({ value, label }) => ({
        ...(value && { value }),
        label: withoutBlanks(label),
    });
    // A row left wholly blank is no option.
    const added = own(form.options)
        .filter((option) => option.value || written(option.label))
        .map(shape);
    if (!same(added, own(question.options).map(shape))) {
        // An option taken out takes its switch with it.
        own(question.options)
            .filter((option) => !rows.some((row) => row.value === option.value))
            .forEach((option) => {
                moved = switches.delete(option.value) || moved;
            });
        // What the place archived is not listed here, and stays as it is.
        const next = [
            ...question.options
                .filter((option) => option.archived && mine(option))
                .map((option) => ({ ...shape(option), archived: true })),
            ...added,
        ];
        patch.addedOptions = next.length ? next : null;
    }
    if (moved)
        patch.options = switches.size
            ? [...switches].map(([value, asked]) => ({ value, asked }))
            : null;
    return patch;
};

/**
 * What one place changes about a question it did not add (PDF p.15): its
 * wording, which of its options the place offers, and options of the place's
 * own. The answer type, and whether the question is asked at all, are not
 * decided here.
 *
 * `question` is the editor's row for it: what the place shows now, what it
 * would show without its own changes (`inherited`), and its own saved changes
 * (`own`). `place` is `{ _id, name, nameOf(id) }`.
 *
 * It saves nothing itself. `onSave(patch)` gets only the keys that changed,
 * a `null` where the place goes back to what it inherits; `onReset()` gives
 * up everything the place changed here.
 */
export default function PlaceQuestionPanel({
    opened,
    onClose,
    question,
    category,
    place,
    languages,
    language: pageLanguage,
    onSave,
    onReset,
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
    } = useForm({ defaultValues: { label: {}, helper_text: {}, options: [] } });
    const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
    const [resetting, setResetting] = useState(false);

    // Filled when the panel opens and not again while it is open, so a
    // reload of the list behind it cannot wipe what is being typed.
    useEffect(() => {
        if (!opened) return;
        setLanguage(pageLanguage);
        setResetting(false);
        reset({
            label: question.label || {},
            helper_text: question.helper_text || {},
            // An archived option is offered nowhere, and no place can
            // bring it back.
            options: (question.options || []).filter(
                (option) => !option.archived
            ),
        });
    }, [opened, question, pageLanguage, reset]);

    const inherited = question?.inherited || {};
    const from = inherited.fromName || "Master";
    const saved = question?.own?.state || {};
    // What Reset would take away: the place's saved wording and options.
    const changedHere = ["label", "helper_text", "options", "addedOptions"].some(
        (key) => saved[key] != null
    );
    const differs = (typed, above) =>
        written(typed) && !sameWording(typed, above);
    const changedPill = <StatusPill status={{ kind: "changed", here: true }} />;

    const requestClose = () => {
        if (
            isDirty &&
            !window.confirm("Close without saving what you changed?")
        )
            return;
        onClose();
    };

    const onSubmit = (form) => {
        const patch = {};
        const label = wordingPatch(form.label, question.label, inherited.label);
        const helper = wordingPatch(
            form.helper_text,
            question.helper_text,
            inherited.helper_text
        );
        if (label !== undefined) patch.label = label;
        if (helper !== undefined) patch.helper_text = helper;
        if (SELECT_TYPES.includes(question.type))
            Object.assign(patch, optionsPatch(form, question, place._id));

        const problem =
            label && !label[DEFAULT_LANGUAGE]
                ? "Enter the question in English."
                : (patch.addedOptions || []).some(
                      (option) => !option.label[DEFAULT_LANGUAGE]
                  )
                ? "Every option needs a label in English."
                : undefined;
        if (problem) {
            // English is what can be missing while another language is shown.
            setLanguage(DEFAULT_LANGUAGE);
            toast.error(problem);
            return;
        }
        if (Object.keys(patch).length) onSave(patch);
        else onClose();
    };

    return (
        <>
            <Modal
                opened={opened}
                onClose={requestClose}
                // Esc reaches every open dialog: it must close only the one
                // on top.
                closeOnEscape={!resetting}
                size={580}
                centered
                radius="md"
                title={
                    <Box>
                        <Text fw={700}>Edit question for {place.name}</Text>
                        <Text size="xs" c="dimmed">
                            {place.name} · {localise(category?.title, pageLanguage)}
                        </Text>
                    </Box>
                }
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack gap="md">
                        <Alert variant="light">
                            These changes apply to {place.reach || place.name}{" "}
                            only. The Master and every other place stay as they
                            are.
                        </Alert>

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
                                    label={`Question in ${place.name}`}
                                    description={`${from} wording: ${localise(
                                        inherited.label,
                                        language
                                    )}`}
                                    language={language}
                                    value={field.value}
                                    onChange={field.onChange}
                                    // Left empty, the place asks it as worded
                                    // above it.
                                    placeholder={localise(
                                        inherited.label,
                                        language
                                    )}
                                    data-autofocus
                                />
                            )}
                        />
                        {(differs(watch("label"), inherited.label) ||
                            changedHere) && (
                            <Group gap="md">
                                {differs(watch("label"), inherited.label) &&
                                    changedPill}
                                {changedHere && (
                                    <Anchor
                                        component="button"
                                        type="button"
                                        size="sm"
                                        fw={600}
                                        onClick={() => setResetting(true)}
                                    >
                                        Reset to the Master version
                                    </Anchor>
                                )}
                            </Group>
                        )}
                        <Controller
                            control={control}
                            name="helper_text"
                            render={({ field }) => (
                                <LocalisedInput
                                    label={`Helper text in ${place.name}`}
                                    description={`${
                                        inherited.helperFromName || from
                                    } helper text: ${
                                        localise(
                                            inherited.helper_text,
                                            language
                                        ) || "none"
                                    }`}
                                    language={language}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Optional. Shown under the question"
                                />
                            )}
                        />
                        {differs(watch("helper_text"), inherited.helper_text) && (
                            <Group>{changedPill}</Group>
                        )}

                        <Divider />
                        <SectionHeading>Answer</SectionHeading>
                        <TextInput
                            label="Answer type"
                            disabled
                            readOnly
                            value={`${shortTypeLabel(question?.type)} (set in ${
                                question?.ownerPlaceId
                                    ? place.nameOf(question.ownerPlaceId)
                                    : "the Master"
                            })`}
                            description="The answer type is the same in every place, so answers stay comparable."
                            inputWrapperOrder={["label", "input", "description"]}
                        />

                        {SELECT_TYPES.includes(question?.type) && (
                            <>
                                <Divider />
                                <OptionsList
                                    control={control}
                                    register={register}
                                    watch={watch}
                                    setValue={setValue}
                                    language={language}
                                    place={{
                                        ...place,
                                        published:
                                            question.own?.publishedAdded || [],
                                    }}
                                />
                            </>
                        )}

                        <Text size="sm" c="dimmed">
                            To stop asking this question in {place.name}, close
                            this panel and use its switch in the list. There is
                            no delete and no archive here.
                        </Text>

                        <Group
                            justify="flex-end"
                            gap="sm"
                            wrap="nowrap"
                            style={STICKY_FOOTER}
                        >
                            <Button variant="default" onClick={requestClose}>
                                Cancel
                            </Button>
                            <Button type="submit" loading={saving}>
                                Save to draft
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            <ResetDialog
                opened={opened && resetting}
                onClose={() => setResetting(false)}
                name={localise(inherited.label, pageLanguage)}
                placeName={place.name}
                placeReach={place.reach}
                onConfirm={onReset}
                loading={saving}
            />
        </>
    );
}
