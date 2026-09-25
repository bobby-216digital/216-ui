/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { Reveal } from "./Reveal.tsx";
import { cx } from "./cx.ts";

type HeroProps = {
    as?: 'h1' | 'h2';
    heading: string;
    subheading?: string;
    copy?: string;
    cta1Label?: string;
    cta1Href?: string;
    cta2Label?: string;
    cta2Href?: string;
    imageSrc: string;
    imageAlt?: string;
    /** Mirrors text/image sides — text is normally first (left), image second (right). */
    flip?: boolean;
    /** Highlights the heading's last word with the .accent-mark treatment
        (styles/components.css) — opt-in and meant for a page's one primary H1 hero,
        not every Hero block on a page (some pages have 5-6; marking every
        one would read as noisy rather than special). */
    accentLastWord?: boolean;
    /**
     * One word of the heading to set in the h2-strong treatment (the quieter
     * tone styles/components.css gives `h2 strong`) — the comps mark one word in
     * several headings this way, e.g. "Covering ALL of Your Web Accessibility
     * Needs".
     *
     * A word to match rather than markup in the heading string: `heading` is
     * a plain text prop rendered as a text node, and letting HTML in would
     * mean either dangerouslySetInnerHTML on every page heading or a parser.
     * Matched case-insensitively on whole words only, first occurrence, so
     * "All" doesn't also light up the "all" inside "Finally".
     */
    accentWord?: string;
    /** Extra content rendered between the copy and the CTA row (e.g. a checklist). */
    children?: ReactNode;
};

/** Exported so HeroBanner renders a heading identically — the accent-mark and
    h2-strong treatments are one decision, not one per hero component. */
export function renderHeading(heading: string, accentLastWord?: boolean, accentWord?: string) {
    if (accentWord) {
        const words = heading.split(/(\s+)/);
        const index = words.findIndex(
            (word) => word.toLowerCase() === accentWord.trim().toLowerCase()
        );
        if (index !== -1) {
            return (
                <>
                    {words.slice(0, index).join('')}
                    <strong>{words[index]}</strong>
                    {words.slice(index + 1).join('')}
                </>
            );
        }
    }
    if (!accentLastWord) return heading;
    const words = heading.trim().split(' ');
    if (words.length < 2) return heading;
    const last = words.pop();
    return (
        <>
            {words.join(' ')} <span className="accent-mark">{last}</span>
        </>
    );
}

export function Hero({
    as: Heading = 'h1',
    heading,
    subheading,
    copy,
    cta1Label,
    cta1Href,
    cta2Label,
    cta2Href,
    imageSrc,
    imageAlt,
    flip = false,
    accentLastWord = false,
    accentWord,
    children
}: Readonly<HeroProps>) {
    // An empty imageSrc used to render `<img src="">`, which browsers treat as
    // a request for the page itself — and it forced every Hero to carry an
    // image whether the page had a real one or not. A text-only Hero now
    // collapses to a single column and takes a readable measure instead of
    // stretching its copy across the full --gutter.
    const hasImage = Boolean(imageSrc);

    // py-6, with no horizontal padding: <main> owns the page gutter at every
    // width now (see the note on it in app/layout.tsx), and adding to it here
    // only pushed hero copy inboard of every heading around it — which is not
    // what the comps show.
    //
    // overflow-x-clip, not hidden: .hero-glow is deliberately inset -10% so it
    // bleeds past this section for a soft halo, which was pushing every page
    // with a Hero ~28px wider than the viewport and putting a horizontal
    // scrollbar on the whole site. `clip` contains that without creating a
    // scroll container (which `hidden` would) and without touching the
    // vertical bleed.
    return (
        <section
            className={`grid grid-cols-1 items-center gap-6 hero${
                hasImage ? ' md:grid-cols-[4fr_5fr]' : ''
            }`}
        >
            <Reveal
                className={cx(
                    'grid grid-cols-1 gap-3 py-6',
                    hasImage ? (flip ? 'md:order-2' : '') : 'measure'
                )}
            >
                {subheading &&
                <p className="eyebrow">{subheading}</p>
                }
                <Heading>{renderHeading(heading, accentLastWord, accentWord)}</Heading>
                {copy &&
                <p>{copy}</p>
                }
                {children}
                {(cta1Href || cta2Href) &&
                <div>
                    {cta1Href &&
                    <a href={cta1Href} className="button">{cta1Label}</a>
                    }
                    {cta2Href &&
                    <a href={cta2Href} className="button secondary">{cta2Label}</a>
                    }
                </div>
                }
            </Reveal>
            {hasImage &&
            <div className={`relative ${flip ? 'md:order-1' : ''}`}>
                {/* Static (no animation/parallax), decorative-only glow behind
                    the image — aria-hidden + pointer-events:none since it
                    carries no content, and suppressed below --mobile so it
                    can't crop oddly on small viewports (see .hero-glow). */}
                <div className="hero-glow" aria-hidden="true" />
                <div className="img-wrapper relative">
                    <img decoding="async" src={imageSrc} alt={imageAlt ?? ''} />
                </div>
            </div>
            }
        </section>
    );
}
