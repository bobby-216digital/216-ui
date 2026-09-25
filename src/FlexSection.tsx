import type { ReactNode } from "react";

type FlexSectionProps = {
    children: ReactNode;
    layout?: 'auto' | 'cards';
};

/**
 * Shared with puck.config.tsx, which applies this directly to the `content`
 * slot's own wrapper element (via its `className` prop) instead of nesting
 * that slot inside a second wrapping div here — Puck's slot always renders
 * as its own DOM element, so a second wrapper just becomes the flex
 * container's one and only child, and the FeatureCards inside it stack
 * instead of flexing next to each other. That config passes `as="section"`
 * alongside it so the one element is a <section>, matching the component
 * below — every page-level block is one (see the rhythm note in
 * styles/components.css).
 */
/**
 * `layout`:
 *   "auto"  — historical behaviour. Cards are `flex: 1` from a zero basis,
 *             so as many pack onto a row as will fit.
 *   "cards" — puts a floor under the basis so a long row wraps instead of
 *             squeezing. Five parallel cards at 1440px were laying out as
 *             five ~250px columns, tall and thin and very uneven; with this
 *             they go 3 + 2. Opt-in, because applying the floor to every
 *             FlexSection nudged /'s mobile layout wider.
 */
export function flexSectionClassName(layout: FlexSectionProps['layout'] = 'auto'): string {
    const mode = layout === 'cards' ? ' flex-section-cards' : '';
    return `flex-section${mode} flex flex-wrap justify-center gap-6`;
}

/** Generic flex row wrapper — e.g. for laying out a row of FeatureCards. Wrap the whole row in a Card block for the live site's card-look instances. */
export function FlexSection({ children, layout = 'auto' }: Readonly<FlexSectionProps>) {
    return (
        <section className={flexSectionClassName(layout)}>
            {children}
        </section>
    );
}
