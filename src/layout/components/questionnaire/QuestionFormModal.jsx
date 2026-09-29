import {
    Alert,
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
} from "@mantine/core";
import { IconAlertTriangle, IconInfoCircle, IconLock } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import ChildQuestionsEditor from "./ChildQuestionsEditor";
import LocalisedInput from "./LocalisedInput";
import OptionsEditor from "./OptionsEditor";
import TargetingTree from "./TargetingTree";
import { PARENT_TYPES, QUESTION_TYPES, SELECT_TYPES } from "./constants";

const emptyForm = {
    label: {},
    helper_text: {},
    type: "text",
    options: [],
    children: [],
    required: false,
    order: 0,
    min: "",
    max: "",
    presentation: "inline",
    targeting: { excludedCountries: [], excludedVillages: [] },
};

/**
 * One modal for add and edit.
 *
 * The structural rule is surfaced here rather than discovered via a 409:
 *   - the type picker is disabled in edit mode,
 *   - changing an option's value key offers only Replace,
 *   - changing any wording asks whether the MEANING changed, because that is
 *     the one call the server cannot make for itself.
 */
export default function QuestionFormModal({
    open,
    onClose,
    editItem,
    categoryId,
    countries,
    villages,
    languages,
    onSubmitEdit,
    onSubmitAdd,
    onSubmitReplace,
    isSaving,
}) {
    const { control, register, handleSubmit, reset, watch, setValue } = useForm({
        defaultValues: emptyForm,
    });
    const [confirm, setConfirm] = useState(null);

    const isEdit = Boolean(editItem);
    const type = watch("type");

    useEffect(() => {
        if (!open) return;
        reset(
            editItem
                ? {
                      ...emptyForm,
                      ...editItem,
                      label: editItem.label || {},
                      helper_text: editItem.helper_text || {},
                      min: editItem.min ?? "",
                      max: editItem.max ?? "",
                      options: editItem.options || [],
                      children: editItem.children || [],
                      targeting: {
                          excludedCountries:
                              editItem.targeting?.excludedCountries || [],
                          excludedVillages:
                              editItem.targeting?.excludedVillages || [],
                      },
                  }
                : emptyForm
        );
    }, [open, editItem, reset]);

    const toPayload = (form) => ({
        label: form.label,
        helper_text: form.helper_text || {},
        type: form.type,
        options: SELECT_TYPES.includes(form.type) ? form.options : [],
        required: Boolean(form.required),
        order: Number(form.order) || 0,
        min: form.min === "" ? null : Number(form.min),
        max: form.max === "" ? null : Number(form.max),
        presentation: form.presentation,
        targeting: form.targeting,
        children: form.children || [],
    });

    /** Classifies the edit so the right path is taken. */
    const classify = (form) => {
        if (!editItem) return "add";
        if (form.type !== editItem.type) return "structural";

        const oldValues = (editItem.options || []).map((o) => o.value);
        const newValues = (form.options || []).map((o) => o.value);
        const keyChanged =
            oldValues.some((v) => !newValues.includes(v)) &&
            newValues.some((v) => !oldValues.includes(v));
        if (keyChanged) return "structural";

        const labelChanged =
            JSON.stringify(form.label || {}) !==
            JSON.stringify(editItem.label || {});
        const optionLabelChanged = (form.options || []).some((option) => {
            const previous = (editItem.options || []).find(
                (o) => o.value === option.value
            );
            return (
                previous &&
                JSON.stringify(previous.label || {}) !==
                    JSON.stringify(option.label || {})
            );
        });
        if (labelChanged || optionLabelChanged) return "judgement";

        return "cosmetic";
    };

    const onSubmit = (form) => {
        const payload = toPayload(form);
        const verdict = classify(form);
        if (verdict === "add") return onSubmitAdd(payload);
        if (verdict === "cosmetic") return onSubmitEdit(payload);
        setConfirm({ verdict, payload });
    };

    const isGroup = type === "repeatable_group";

    return (
        <>
            <Modal
                opened={open}
                onClose={onClose}
                size="xl"
                centered
                radius="md"
                title={
                    <Box>
                        <Text fw={700}>
                            {isEdit ? "Edit question" : "Add question"}
                        </Text>
                        <Text size="xs" c="dimmed">
                            {isEdit
                                ? "Wording is safe to change. Type and option keys are not."
                                : "This appears in the app for everyone the screen targets."}
                        </Text>
                    </Box>
                }
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack gap="lg">
                        <Controller
                            control={control}
                            name="label"
                            render={({ field }) => (
                                <LocalisedInput
                                    label="Question"
                                    required
                                    languages={languages}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="helper_text"
                            render={({ field }) => (
                                <LocalisedInput
                                    label="Helper text"
                                    languages={languages}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Optional — shown under the question"
                                />
                            )}
                        />

                        <Group grow align="flex-end">
                            <Controller
                                control={control}
                                name="type"
                                render={({ field }) => (
                                    <Select
                                        label="Type"
                                        disabled={isEdit}
                                        rightSection={
                                            isEdit ? <IconLock size={14} /> : undefined
                                        }
                                        data={QUESTION_TYPES.map((t) => ({
                                            value: t.value,
                                            label: t.label,
                                        }))}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name="order"
                                render={({ field }) => (
                                    <NumberInput
                                        label="Display order"
                                        placeholder="Lower numbers appear first"
                                        min={0}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </Group>

                        {isEdit && (
                            <Text size="xs" c="dimmed" mt={-8}>
                                The type is locked. Changing it would change what past
                                answers mean — edit the wording, or create a
                                replacement question.
                            </Text>
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
                                        onChange={(e) =>
                                            field.onChange(e.currentTarget.checked)
                                        }
                                        label="Required"
                                        description="The app will not let someone complete this screen without answering."
                                    />
                                )}
                            />
                        )}

                        {SELECT_TYPES.includes(type) && (
                            <>
                                <Divider />
                                <OptionsEditor
                                    control={control}
                                    register={register}
                                    watch={watch}
                                    setValue={setValue}
                                    isEdit={isEdit}
                                    languages={languages}
                                />
                            </>
                        )}

                        {PARENT_TYPES.includes(type) && (
                            <>
                                <Divider />
                                <ChildQuestionsEditor
                                    control={control}
                                    register={register}
                                    watch={watch}
                                    setValue={setValue}
                                    languages={languages}
                                    parentType={type}
                                />
                            </>
                        )}

                        <Divider />
                        <Controller
                            control={control}
                            name="targeting"
                            render={({ field }) => (
                                <TargetingTree
                                    countries={countries}
                                    villages={villages}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />

                        <Group
                            justify="flex-end"
                            gap="sm"
                            style={{
                                position: "sticky",
                                bottom: 0,
                                zIndex: 2,
                                background: "var(--mantine-color-body)",
                                borderTop: "1px solid var(--mantine-color-gray-2)",
                                margin: "0 calc(var(--mantine-spacing-md) * -1)",
                                padding: "var(--mantine-spacing-sm) var(--mantine-spacing-md)",
                            }}
                        >
                            <Button variant="default" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                loading={isSaving}
                                disabled={!categoryId}
                            >
                                {isEdit ? "Save changes" : "Add question"}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            {/* Structural change: only Replace is offered. */}
            <Modal
                opened={confirm?.verdict === "structural"}
                onClose={() => setConfirm(null)}
                title={<Text fw={700}>This creates a new question</Text>}
                centered
                radius="md"
            >
                <Stack gap="md">
                    <Alert
                        icon={<IconAlertTriangle size={16} />}
                        color="orange"
                        variant="light"
                    >
                        Changing the type, or an option&apos;s key, changes what the
                        question means. The current question is retired and its
                        existing answers stay attached to it — nothing is altered or
                        deleted.
                    </Alert>
                    <Group justify="flex-end" gap="sm">
                        <Button variant="default" onClick={() => setConfirm(null)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                onSubmitReplace(confirm.payload);
                                setConfirm(null);
                            }}
                        >
                            Create replacement
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* The judgement the server cannot make. Safe option first. */}
            <Modal
                opened={confirm?.verdict === "judgement"}
                onClose={() => setConfirm(null)}
                title={<Text fw={700}>Does this change what the question means?</Text>}
                centered
                radius="md"
                size="lg"
            >
                <Stack gap="md">
                    <Text size="sm" c="dimmed">
                        You changed some wording. If it is only a fix, edit it in
                        place — past answers are unaffected. If the meaning moved, it
                        is a different question and needs a new one.
                    </Text>
                    <Alert icon={<IconInfoCircle size={16} />} variant="light">
                        “3–5 people” → “3–4 people” is a meaning change. Fixing a typo
                        is not.
                    </Alert>
                    <Group justify="flex-end" gap="sm" wrap="wrap">
                        <Button variant="default" onClick={() => setConfirm(null)}>
                            Cancel
                        </Button>
                        <Button
                            color="red.9"
                            variant="light"
                            onClick={() => {
                                onSubmitReplace(confirm.payload);
                                setConfirm(null);
                            }}
                        >
                            Meaning changed — new question
                        </Button>
                        <Button
                            onClick={() => {
                                onSubmitEdit(confirm.payload);
                                setConfirm(null);
                            }}
                        >
                            Fix wording — edit in place
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}
