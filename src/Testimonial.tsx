/* eslint-disable @next/next/no-img-element */
import { Reveal } from "./Reveal.tsx";
import { cx } from "./cx.ts";


type TestimonialProps = {
    /**
     * Where the quotation sits in its container. "center" is right when the
     * block holds the full page width — a 62ch quote pinned to the left of a
     * 1400px band reads as a layout error.
     *
     * "left" is for a quotation already inside a narrow column, where
     * centring only pushes it away from the column's own left edge: on the
     * case study page it left a wide empty gutter between the body copy and
     * the orange rule marking the quote, which is what the rule is there to
     * line up with.
     */
    align?: 'center' | 'left';
    /**
     * The client's own words, verbatim. Deliberately a plain string rather
     * than richtext: every published quote has to be diffable, character for
     * character, against the source email/release kept on file, and a
     * richtext round-trip through Puck's editor would let an editor
     * "tidy" a real client's sentence into one they never wrote. Blank
     * lines separate paragraphs; nothing else is interpreted.
     *
     * Trimming for length is allowed (mark the cut with an ellipsis);
     * paraphrasing, grammar-fixing, or recombining sentences is not — an
     * edit that manufactures a stronger claim than the client made is a
     * deceptive testimonial even when the underlying source is real.
     */
    quote: string;
    name: string;
    role?: string;
    organization?: string;
    /** Which engagement this came from, e.g. "ADA lawsuit remediation". */
    serviceLine?: string;
    date?: string;
    /**
     * Visible disclosure line, for a quote published with less than full
     * attribution — e.g. a client who agreed to share their experience but
     * hasn't approved being named alongside a lawsuit. An anonymized quote
     * must SAY it's anonymized; implying attribution that isn't on file is
     * the thing this field exists to prevent.
     */
    sourceNote?: string;
    linkHref?: string;
    linkLabel?: string;
    logoSrc?: string;
    logoAlt?: string;
};

/**
 * One attributed client quotation. No surface/padding of its own — wrap it
 * in a Card block for the card look, and a row of them in a FlexSection,
 * exactly like FeatureCard (see the note in packages/content/puck.config.tsx
 * about why a `card` boolean isn't a field here).
 *
 * <figure>/<blockquote>/<figcaption> rather than a <cite> nested inside the
 * <blockquote>: per the HTML spec, attribution is not part of the quotation
 * itself, so it belongs outside the quoted element.
 */
export function Testimonial({
    align = 'center',
    quote,
    name,
    role,
    organization,
    serviceLine,
    date,
    sourceNote,
    linkHref,
    linkLabel,
    logoSrc,
    logoAlt,
}: Readonly<TestimonialProps>) {
    const paragraphs = quote.split(/\n\s*\n/).map((para) => para.trim()).filter(Boolean);
    const attribution = [name, role, organization].filter(Boolean).join(", ");
    const meta = [serviceLine, date].filter(Boolean).join(" · ");

    // A quote used inside a case study carries its attribution once, in the
    // page's own prose, rather than repeating it under every pull quote —
    // so with nothing to attribute, the <figcaption> is omitted entirely
    // instead of rendering empty.
    // logoSrc is deliberately not part of this: the logo is no longer rendered
    // inside the caption (see below), so a quote carrying only a logo should
    // still skip the empty <figcaption>.
    const hasCaption = Boolean(attribution || meta || sourceNote || (linkHref && linkLabel));

    return (
        /* The <figure> stays outermost: it is what `.testimonial` clamps and
           centres, and the quote's semantics belong on it rather than on a
           div. None of the .testimonial rules use a child combinator, so the
           Reveal nests inside it safely. */
        <figure
            className={cx(
                'testimonial',
                align === 'left' && 'testimonial-left',
                logoSrc && 'testimonial-with-logo'
            )}
        >
            <Reveal className={logoSrc ? 'testimonial-body' : undefined}>
                {/* The client's mark sits in its own column to the LEFT of the
                    quotation, per the comps — not as a small inline mark above
                    the attribution, which is where it used to render. It is a
                    sibling of the quote rather than a child of the caption so
                    the two can be laid out side by side. */}
                {logoSrc &&
                <img src={logoSrc} alt={logoAlt ?? ''} className="testimonial-logo" loading="lazy" />
                }
                <div className="testimonial-main">
                <blockquote className="testimonial-quote">
                    {paragraphs.map((para, index) => (
                        <p key={index} className="quote">{para}</p>
                    ))}
                </blockquote>
                {hasCaption &&
                <figcaption className="testimonial-attribution">
                    {attribution &&
                    <cite>{attribution}</cite>
                    }
                    {meta &&
                    <p className="secondary">{meta}</p>
                    }
                    {sourceNote &&
                    <p className="secondary testimonial-note">{sourceNote}</p>
                    }
                    {linkHref && linkLabel &&
                    <p>
                        {/* Several testimonials on a page share one link label, so name
                            the link by its subject too — the visible label stays first,
                            and stays the whole of the label when there's no subject. */}
                        <a
                            href={linkHref}
                            aria-label={organization ? `${linkLabel}: ${organization}` : undefined}
                        >
                            {linkLabel}
                        </a>
                    </p>
                    }
                </figcaption>
                }
                </div>
            </Reveal>
        </figure>
    );
}
