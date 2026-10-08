// The LAYERED build is deliberate: everything it ships sits inside
// `@layer mantine`, which loses to the unlayered index.css / App.css this app
// already has. That is what lets these screens use Mantine while the 12
// existing MUI pages render exactly as they did before.
import "@mantine/core/styles.layer.css";
import "mantine-datatable/styles.layer.css";
// ...and this undoes the specific Vite-template rules that would otherwise beat
// Mantine's layered styles. Must be imported LAST. See the file for detail.
import "./mantine-overrides.css";

import {
    MantineProvider,
    createTheme,
    defaultVariantColorsResolver,
    parseThemeColor,
} from "@mantine/core";

/** Brand ramp built around the existing #0080ff primary (index 6). */
const brand = [
    "#e6f2ff",
    "#cce5ff",
    "#99ccff",
    "#66b2ff",
    "#3399ff",
    "#1a8cff",
    "#0080ff",
    "#0066cc",
    "#004d99",
    "#003366",
];

const danger = [
    "#fdeeeb",
    "#fbddd7",
    "#f9bbaf",
    "#f79987",
    "#f5775f",
    "#f4653f",
    "#f45536",
    "#d93d1f",
    "#b32f17",
    "#8f2512",
];

const theme = createTheme({
    primaryColor: "brand",
    primaryShade: 6,
    colors: { brand, danger },
    fontFamily: '"Montserrat", "Helvetica", sans-serif',
    headings: {
        fontFamily: '"Montserrat", "Helvetica", sans-serif',
        fontWeight: "700",
    },
    defaultRadius: "md",
    cursorType: "pointer",
    /**
     * Mantine clamps `light`-variant TEXT to shade 6 — its default resolver
     * does `Math.min(shade, 6)` — so asking for "red.9" silently renders red.6.
     * Red.6 is 3.28:1 on white, below the 4.5:1 AA minimum for text, and there
     * is no prop-level way around it (Menu.Item routes through here too).
     *
     * This only honours a darker shade when one is EXPLICITLY requested, so
     * default rendering is unchanged everywhere else.
     */
    variantColorResolver: (input) => {
        const resolved = defaultVariantColorsResolver(input);
        if (input.variant !== "light") return resolved;
        const parsed = parseThemeColor({
            color: input.color || input.theme.primaryColor,
            theme: input.theme,
        });
        if (parsed.isThemeColor && parsed.shade !== undefined && parsed.shade > 6) {
            return {
                ...resolved,
                color: `var(--mantine-color-${parsed.color}-${parsed.shade})`,
            };
        }
        return resolved;
    },
    components: {
        Button: { defaultProps: { fw: 600 } },
        // A tick box is a square with slightly rounded corners in the
        // design. Left to `defaultRadius` it comes out nearly round.
        Checkbox: { defaultProps: { radius: "sm" } },
        // The design draws every field label bold, in the panels and in the
        // small dialogs alike.
        InputWrapper: { styles: { label: { fontWeight: 700 } } },
        TextInput: { defaultProps: { size: "sm" } },
        Select: { defaultProps: { size: "sm", checkIconPosition: "right" } },
        Textarea: { defaultProps: { size: "sm" } },
    },
});

/**
 * Wraps a questionnaire screen.
 *
 * CSS variables are deliberately left on :root (Mantine's default) rather than
 * scoped to this subtree: Modal, Tooltip, Select dropdowns and Menu all render
 * through portals attached to document.body, so a scoped selector starves them
 * of every --mantine-* variable and they render unstyled. The variables are
 * inert custom properties that nothing in the MUI pages reads.
 */
export default function MantineShell({ children }) {
    return (
        <MantineProvider theme={theme} defaultColorScheme="light">
            <div className="questionnaire-root">{children}</div>
        </MantineProvider>
    );
}
