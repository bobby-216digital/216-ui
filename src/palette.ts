/**
 * The brand palette: the handful of base colors every other color token in
 * styles/tokens.css derives from. A consumer themes the design system by
 * overriding these custom properties (and only these) on `:root`.
 *
 * `defaultValue` must match tokens.css exactly; scripts/check-palette.mjs
 * fails the build if they drift.
 *
 * Plain data and pure functions, no React, so a consumer can use it on the
 * server (to emit overrides) and in an editor UI (to pick and check them).
 */

export type PaletteKey =
    | 'accent'
    | 'accentLight'
    | 'accentDeep'
    | 'accentText'
    | 'text'
    | 'textMuted'
    | 'textSubtle'
    | 'tint';

export type PaletteColor = {
    key: PaletteKey;
    cssVar: `--brand-${string}`;
    label: string;
    /** What it paints, in words a content editor recognises. */
    usage: string;
    defaultValue: string;
};

export const PALETTE: ReadonlyArray<PaletteColor> = [
    {
        key: 'accent',
        cssVar: '--brand-accent',
        label: 'Accent',
        usage: 'Decorative accent: rules, dashes, display numerals, focus rings, the gradient\'s end.',
        defaultValue: '#e1740e',
    },
    {
        key: 'accentLight',
        cssVar: '--brand-accent-light',
        label: 'Accent light',
        usage: 'Primary button fill, the gradient\'s start, icon washes.',
        defaultValue: '#f79420',
    },
    {
        key: 'accentDeep',
        cssVar: '--brand-accent-deep',
        label: 'Accent deep',
        usage: 'Deep accent fills and strokes that carry white icons or text.',
        defaultValue: '#7a4419',
    },
    {
        key: 'accentText',
        cssVar: '--brand-accent-text',
        label: 'Accent text',
        usage: 'The accent at text size: secondary button label and outline. Needs AA contrast on white and tint.',
        defaultValue: '#b85c0a',
    },
    {
        key: 'text',
        cssVar: '--brand-text',
        label: 'Text',
        usage: 'Body copy, headings, links, button labels, the footer\'s copyright bar.',
        defaultValue: '#231f20',
    },
    {
        key: 'textMuted',
        cssVar: '--brand-text-muted',
        label: 'Muted text',
        usage: 'Large body copy, subheadings, input borders and placeholders.',
        defaultValue: '#685e5e',
    },
    {
        key: 'textSubtle',
        cssVar: '--brand-text-subtle',
        label: 'Subtle text',
        usage: 'Small print, captions, quotes.',
        defaultValue: '#746d6b',
    },
    {
        key: 'tint',
        cssVar: '--brand-tint',
        label: 'Tint',
        usage: 'Tinted section backgrounds and the secondary button\'s hover fill.',
        defaultValue: '#fff1e2',
    },
];

export type PaletteValues = Partial<Record<PaletteKey, string>>;

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/** Only `#rrggbb` is accepted anywhere a palette value is emitted, so a value can never break out of a CSS declaration. */
export function isHexColor(value: unknown): value is string {
    return typeof value === 'string' && HEX_COLOR.test(value);
}

/** The palette with `values` laid over the defaults; invalid values fall back to the default. */
export function resolvePalette(values: PaletteValues = {}): Record<PaletteKey, string> {
    return Object.fromEntries(
        PALETTE.map((color) => {
            const value = values[color.key];
            return [color.key, isHexColor(value) ? value.toLowerCase() : color.defaultValue];
        }),
    ) as Record<PaletteKey, string>;
}

/**
 * A CSS rule overriding only the palette values that differ from the
 * defaults, or '' when none do. Scoped `html:root` rather than `:root` so it
 * outranks tokens.css on specificity, wherever in the document it lands.
 */
export function paletteOverrideCss(values: PaletteValues = {}): string {
    const resolved = resolvePalette(values);
    const declarations = PALETTE
        .filter((color) => resolved[color.key] !== color.defaultValue)
        .map((color) => `${color.cssVar}:${resolved[color.key]}`);
    return declarations.length ? `html:root{${declarations.join(';')}}` : '';
}

// ---- Contrast ------------------------------------------------------------

const WHITE = '#ffffff';

type ColorRef = PaletteKey | typeof WHITE;

export type ContrastPair = {
    foreground: ColorRef;
    background: ColorRef;
    /** WCAG 2.x AA threshold: 4.5 for text, 3 for large text and non-text UI. */
    minimum: 4.5 | 3;
    /** Where the pairing appears, so a failure can say what it breaks. */
    where: string;
};

/**
 * Every foreground/background pairing the components actually render. Adding
 * a component that puts a palette color on another one means adding its
 * pairing here.
 */
export const CONTRAST_PAIRS: ReadonlyArray<ContrastPair> = [
    { foreground: 'text', background: WHITE, minimum: 4.5, where: 'Body copy and headings on white' },
    { foreground: 'text', background: 'tint', minimum: 4.5, where: 'Body copy on tinted sections' },
    { foreground: 'textMuted', background: WHITE, minimum: 4.5, where: 'Large body copy and subheadings on white' },
    { foreground: 'textMuted', background: 'tint', minimum: 4.5, where: 'Large body copy on tinted sections' },
    { foreground: 'textSubtle', background: WHITE, minimum: 4.5, where: 'Small print and quotes on white' },
    { foreground: 'textSubtle', background: 'tint', minimum: 4.5, where: 'Small print on tinted sections' },
    { foreground: 'accentText', background: WHITE, minimum: 4.5, where: 'Secondary button label on white' },
    { foreground: 'accentText', background: 'tint', minimum: 4.5, where: 'Secondary button label on hover' },
    { foreground: 'text', background: 'accentLight', minimum: 4.5, where: 'Primary button label; text on the gradient\'s start' },
    { foreground: 'text', background: 'accent', minimum: 4.5, where: 'Text on the gradient\'s end' },
    { foreground: WHITE, background: 'accentDeep', minimum: 4.5, where: 'White icons and text on deep accent fills' },
    { foreground: 'accentDeep', background: WHITE, minimum: 4.5, where: 'Deep accent text and strokes on white' },
    { foreground: WHITE, background: 'text', minimum: 4.5, where: 'Footer copyright bar' },
    { foreground: 'accent', background: WHITE, minimum: 3, where: 'Focus rings and accent strokes on white' },
];

function channel(value: number): number {
    const c = value / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
    const n = Number.parseInt(hex.slice(1), 16);
    return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

/** WCAG 2.x contrast ratio between two `#rrggbb` colors, 1 to 21. */
export function contrastRatio(a: string, b: string): number {
    const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (light + 0.05) / (dark + 0.05);
}

export type ContrastResult = ContrastPair & {
    foregroundHex: string;
    backgroundHex: string;
    ratio: number;
    passes: boolean;
};

/** Every pairing in CONTRAST_PAIRS, measured against `values` laid over the defaults. */
export function checkContrast(values: PaletteValues = {}): ContrastResult[] {
    const resolved = resolvePalette(values);
    const hex = (ref: ColorRef) => (ref === WHITE ? WHITE : resolved[ref]);
    return CONTRAST_PAIRS.map((pair) => {
        const ratio = contrastRatio(hex(pair.foreground), hex(pair.background));
        return {
            ...pair,
            foregroundHex: hex(pair.foreground),
            backgroundHex: hex(pair.background),
            ratio,
            passes: ratio >= pair.minimum,
        };
    });
}
