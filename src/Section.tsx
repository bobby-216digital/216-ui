import type { CSSProperties, ReactNode } from "react";
import { cx } from "./cx.ts";

type SectionProps = {
    children: ReactNode;
    backgroundColor?: "none" | "peach" | "blue" | "warm";
    justify?: "left" | "center" | "right";
    /**
     * Pulls this section up so it overlaps the block above it. The comps use
     * it in both directions, and which element ends up on top is the whole
     * difference between them:
     *
     * - "behind": the tinted band slides up UNDER the block above it, so the
     *   homepage's logo card sits across the top edge of the peach band.
     * - "front": this section slides up ON TOP of the block above it, so
     *   /demand-letter-response/'s reassurance card straddles the bottom
     *   edge of the band behind it.
     */
    overlap?: "none" | "behind" | "front";
    /**
     * How much room the band gives its own content. "slim" is for a band
     * that is a rule across the page rather than a section of it — the
     * ✓ WCAG 2.1 / ADA Title II / Section 508 / Unruh Act divider, which at
     * full --section-spacing stood 175px tall around a single line of text.
     */
    spacing?: "normal" | "slim";
    /**
     * A full-bleed artwork band behind the section's own content, for the
     * comps' designed bands — the peach one on /radar/ carries its
     * illustration on the right and deliberately leaves its left half empty
     * for the heading and copy, so it is the band's background rather than a
     * column image beside the text.
     *
     * Layered over `backgroundColor`, not instead of it: the tint stays as
     * the fallback the artwork sits on, which is what renders below 768px,
     * where `cover` would crop a 4:1 band down to its middle and put the
     * illustration underneath the copy. See .section-bg-image in styles/components.css.
     */
    backgroundImage?: string;
    /**
     * How the artwork sits in the band.
     *
     * "cover" (default) fills it, cropping as needed — right for a texture
     * like the homepage's icon band, where the pattern is meant to bleed off
     * every edge and any crop is invisible.
     *
     * "width" renders it at the proportions it was drawn at, anchored to the
     * bottom, and keeps the band's copy clear of it — for an illustration
     * band like /radar/'s, where `cover` scales a ~4:1 graphic up to fill a
     * shorter band and drags the artwork across the text.
     */
    backgroundImageFit?: "cover" | "width";
};

/**
 * For the outer <section> element — a second (non-slot) wrapper around the
 * `content` slot, so the background can go full-bleed while the slot itself
 * stays clamped to the site's normal content width (see .full-bleed in
 * styles/components.css). Carries no vertical spacing: the global `section` rule in
 * styles/components.css owns the space around every section, and the interior padding
 * a coloured band needs comes from .bg-section-* there too. Returns an empty
 * string for an untinted section, which is a valid className.
 */
export function sectionOuterClassName(
    backgroundColor: SectionProps["backgroundColor"] = "none",
    overlap: SectionProps["overlap"] = "none",
    spacing: SectionProps["spacing"] = "normal",
    backgroundImage: SectionProps["backgroundImage"] = "",
    backgroundImageFit: SectionProps["backgroundImageFit"] = "cover"
): string {
    const tinted = Boolean(backgroundColor && backgroundColor !== "none");
    // Either a tint or an artwork band breaks out to the viewport edge, but
    // `full-bleed` is only wanted once when it has both.
    return cx(
        (tinted || Boolean(backgroundImage)) && 'full-bleed',
        tinted && `bg-section-${backgroundColor}`,
        overlap !== "none" && 'section-overlap',
        overlap === "behind" && 'section-overlap-behind',
        overlap === "front" && 'section-overlap-front',
        spacing === "slim" && 'section-slim',
        backgroundImage && 'section-bg-image',
        backgroundImage && backgroundImageFit === "width" && 'section-bg-image-width'
    );
}

/**
 * The URL travels as a custom property rather than as `background-image`
 * directly, so the media query that decides whether to paint it can live in
 * the stylesheet with every other breakpoint. An inline `background-image`
 * would win over any rule trying to turn it off again.
 */
export function sectionBackgroundStyle(backgroundImage = ""): CSSProperties | undefined {
    if (!backgroundImage) return undefined;
    return { ["--section-bg-image"]: `url("${backgroundImage}")` } as CSSProperties;
}

/**
 * "left" is a no-op (plain block stacking) rather than an explicit
 * items-start flex rule — matching backgroundColor's "none" precedent above,
 * so this stays the default and existing content (block children that
 * stretch full width, like a RichText paragraph) renders exactly as it did
 * before this option existed. "center"/"right" opt into a flex column so
 * children that don't stretch on their own (e.g. a single ButtonLink) can
 * be positioned within the section instead of always sitting at the start.
 */
export function sectionInnerClassName(justify: SectionProps["justify"] = "left"): string {
    const justifyClass =
        justify === "center" ? "flex flex-col items-center" : justify === "right" ? "flex flex-col items-end" : "";
    return cx('max-w-(--gutter) mx-auto px-6', justifyClass);
}

/**
 * A generic wrapper for arbitrary content with an optional background color.
 */
export function Section({
    children,
    backgroundColor = "none",
    justify = "left",
    overlap = "none",
    spacing = "normal",
    backgroundImage = "",
    backgroundImageFit = "cover"
}: Readonly<SectionProps>) {
    return (
        <section
            className={sectionOuterClassName(backgroundColor, overlap, spacing, backgroundImage, backgroundImageFit)}
            style={sectionBackgroundStyle(backgroundImage)}
        >
            <div className={sectionInnerClassName(justify)}>{children}</div>
        </section>
    );
}
