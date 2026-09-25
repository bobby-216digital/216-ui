import type { ReactNode } from "react";
import { Reveal } from "./Reveal.tsx";
import { cx } from "./cx.ts";

type RichTextProps = {
    /**
     * Puck stores this as an HTML string, but resolves it into an
     * already-rendered element before this component ever sees it — see the
     * note in packages/content/puck.config.tsx. Typed loosely so this still
     * works if ever rendered directly with a plain string.
     */
    content: ReactNode;
    /**
     * Optional jump-link target, e.g. for a blog post's table of contents
     * (TableOfContents.tsx). Puck's richtext doesn't preserve a
     * heading's own `id` attribute through its Tiptap-based round-trip
     * (verified directly — it's stripped), so a TOC anchor can't point at
     * the heading itself; this wraps the whole block instead, which lands a
     * jump link at the top of that section. Blank by default — pages never
     * set this, only the blog migration does, for posts that had an
     * authored table of contents worth preserving.
     */
    anchorId?: string;
    /**
     * Line length. "full" is the historical behaviour — content stretches to
     * the site's --gutter (1400px), which is ~167 characters per line at the
     * 16px body size and roughly twice what is readable. Fine for a short
     * centred heading, bad for prose.
     *
     * "prose" clamps to the 800px --measure (see .measure in styles/components.css) and
     * centres the column. Opt-in rather than the default so the existing
     * short/centred blocks render exactly as they did; every long-form block
     * sets it explicitly.
     */
    width?: 'full' | 'prose';
    /**
     * "note" renders the whole block as small print — the sourcing lines and
     * "results vary" qualifiers that sit under a stat row or an outcome
     * claim.
     *
     * This has to be a block-level prop rather than a class on the paragraph
     * because Puck's richtext resolves its stored HTML through its own editor
     * schema before this component sees it, and that schema keeps only what
     * it can represent: `text-align` survives, `font-style: italic` comes
     * back as <em>, and `class`, `font-size`, `color` and `line-height` are
     * dropped outright. Ten paragraphs across nine pages carried
     * `class="secondary"` and had been rendering at full body size and full
     * body contrast the whole time — indistinguishable from the claim each
     * one qualifies. Verified in the served DOM, not assumed.
     */
    tone?: 'normal' | 'note';
    /**
     * The short lead-in above the block's first heading.
     *
     * A real prop rather than a `<p class="eyebrow">` inside the content,
     * because Puck's richtext schema drops `class` on the way through (see
     * `tone`). The one route that did work — a centred <p> before a centred
     * <h2>, which styles/components.css matches structurally — also forces the heading
     * to be centred, so it was no use for the comps' left-aligned eyebrows.
     */
    eyebrow?: string;
    /**
     * "check" turns the block's bulleted lists into the comps' orange
     * check-marked rows ("Why Choose a11y.Radar?").
     *
     * A block-level prop, and the mark comes from `::marker`, because
     * neither of the obvious alternatives works here: a class on the <ul>
     * is stripped by Puck's richtext schema (see `tone`), and a literal ✓
     * typed into the content cannot be coloured separately from the text
     * it precedes — and would also be read out by a screen reader as a word
     * before every item. A list marker is presentation, and assistive
     * technology announces the list semantics instead.
     */
    list?: 'default' | 'check';
};

/** Generic WYSIWYG content that doesn't map to one of the other custom blocks. */
export function RichText({ content, anchorId, width = 'full', tone = 'normal', eyebrow, list = 'default' }: Readonly<RichTextProps>) {
    // pb-3 on the block itself, not on .rich-text: Puck resolves every
    // richtext field through that same wrapper classname, so padding there
    // would also pad each Badges label and each Accordion answer.
    //
    // Bottom only, deliberately. This started as py-3 to give a paragraph
    // some air inside a Section/Card/Columns slot, where .page-blocks'
    // sibling rhythm doesn't reach. Once every page-level block became a
    // <section> owning its own vertical margin (see the rhythm note in
    // styles/components.css), the top half was landing on top of that margin and
    // reading as too much — whatever sits above a RichText now supplies the
    // space above it, and this just keeps the next thing off its last line.
    const className = cx(
        'pb-3',
        width === 'prose' && 'measure',
        tone === 'note' && 'rich-text-note',
        // Marks the block so the accent dash above its first heading can be
        // suppressed — one marker per heading, not an eyebrow AND a bar. The
        // existing rule for that only matches an eyebrow written INSIDE the
        // richtext, which this prop deliberately isn't.
        eyebrow && 'has-eyebrow',
        list === 'check' && 'rich-text-checks'
    );

    // Reveal renders exactly the one div this block used to render itself, so
    // the scroll animation costs no extra DOM — it is the same element with a
    // ref on it. This is the site's most common block by a wide margin (37 at
    // page top level, plus every one nested in a Section or Card), so without
    // it most of a page's prose arrived with no animation while the Heroes,
    // stat rows and cards around it faded in.
    return (
        <Reveal id={anchorId || undefined} className={className}>
            {eyebrow &&
            <p className="eyebrow">{eyebrow}</p>
            }
            {content}
        </Reveal>
    );
}
