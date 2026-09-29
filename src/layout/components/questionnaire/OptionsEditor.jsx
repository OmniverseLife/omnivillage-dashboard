import OptionsList from "./OptionsList";

/** Top-level question options. The list itself lives in OptionsList. */
export default function OptionsEditor({ control, register, watch, setValue, isEdit, languages }) {
    return (
        <OptionsList
            control={control}
            register={register}
            watch={watch}
            setValue={setValue}
            languages={languages}
            name="options"
            lockSaved={isEdit}
        />
    );
}
