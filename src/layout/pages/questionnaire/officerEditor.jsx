import EditorPage from "./editor";

/**
 * The page at /officer/questionnaire: the editor, on the questionnaire field
 * officers answer about each village assigned to them.
 */
export default function OfficerEditor() {
    return <EditorPage audience="officer" />;
}
