/* eslint-disable @next/next/no-img-element */
import { ButtonLink } from "./ButtonLink.tsx";
import { Reveal } from "./Reveal.tsx";
import { cx } from "./cx.ts";

type ScanCtaProps = {
    heading: string;
    copy?: string;
    /**
     * The "www.website.com" field the XD comps show on /ada/ and the case
     * study page. Optional because the same band appears in the comps
     * without it (heading + buttons only), and because a field that has
     * nowhere useful to go is worse than no field.
     */
    showInput?: boolean;
    inputLabel?: string;
    inputPlaceholder?: string;
    /**
     * Where the field submits. A plain GET form, so the value arrives as
     * `?website=...` on the target page and ContactForm prefills its own
     * website field from it — no JS, no API, and it survives static export,
     * which an onSubmit handler posting somewhere would not.
     *
     * There is deliberately no scan endpoint behind this: the site has no
     * server that could run one (see "Deployment" in CLAUDE.md), and a field
     * that appeared to start a scan and silently did nothing would be a
     * worse answer than handing the address to the briefing request the
     * button already asks for.
     *
     * No default: it's the consumer's contact page, which a package can't
     * know. Required whenever `showInput` is on. 216-mono: "/contact/".
     */
    formAction?: string;
    cta1Label?: string;
    cta1Href?: string;
    cta2Label?: string;
    cta2Href?: string;
    background?: 'peach' | 'warm';
    /** Mirrors the copy/form sides — copy is normally first (left). */
    flip?: boolean;
    imageSrc?: string;
    imageAlt?: string;
};

/**
 * The "put your website to the test" band — a mid-page conversion prompt,
 * distinct from the site-wide one above the footer (Footer.tsx's own CTA,
 * edited at /edit/site-settings). This one is a page block, so it carries
 * that page's own copy and can take the address field the footer band
 * doesn't have.
 */
export function ScanCta({
    heading,
    copy,
    showInput = false,
    inputLabel = "Your website address",
    inputPlaceholder = "www.website.com",
    formAction,
    cta1Label,
    cta1Href,
    cta2Label,
    cta2Href,
    background = 'peach',
    flip = false,
    imageSrc,
    imageAlt
}: Readonly<ScanCtaProps>) {
    const hasButtons = Boolean(cta1Href || cta2Href);
    const hasAside = showInput || hasButtons || Boolean(imageSrc);

    return (
        <section className={`full-bleed ${background === 'warm' ? 'bg-section-warm' : 'bg-section-peach'}`}>
            <div
                className={cx(
                    'max-w-(--gutter) mx-auto px-6 grid grid-cols-1 gap-8 items-center',
                    hasAside && 'md:grid-cols-2'
                )}
            >
                <Reveal className={flip ? 'md:order-2' : undefined}>
                    <h2>{heading}</h2>
                    {copy &&
                    <p>{copy}</p>
                    }
                </Reveal>

                {hasAside &&
                <Reveal className={flip ? 'md:order-1' : undefined}>
                    {imageSrc &&
                    <img src={imageSrc} alt={imageAlt ?? ''} loading="lazy" />
                    }
                    {showInput &&
                    /* method="get" and no onSubmit: this has to work on a
                       statically exported page with no JS of its own. */
                    <form action={formAction} method="get" className="scan-cta-form">
                        <label className="scan-cta-field">
                            {/* Visible to screen readers only — the comps show a
                                bare field with a placeholder, and a placeholder
                                is not an accessible name (it disappears on
                                input, and several AT/browser pairs never expose
                                it at all). WCAG 3.3.2. */}
                            <span className="visually-hidden">{inputLabel}</span>
                            <input
                                type="text"
                                name="website"
                                inputMode="url"
                                autoComplete="url"
                                placeholder={inputPlaceholder}
                                required
                            />
                        </label>
                        {/* The label, not the href, decides what this says —
                            with the field on, cta1 IS the submit button, so
                            it has no href to key off. Keying off the href
                            silently ignored a label that was set. */}
                        <button type="submit">{cta1Label || 'Get Started'}</button>
                    </form>
                    }
                    {hasButtons && !showInput &&
                    <div>
                        {cta1Href &&
                        <ButtonLink href={cta1Href} label={cta1Label ?? ''} />
                        }
                        {cta2Href &&
                        <ButtonLink href={cta2Href} label={cta2Label ?? ''} variant="secondary" />
                        }
                    </div>
                    }
                    {/* With the field present, cta1 became the submit button
                        above, so only the secondary link is left to render. */}
                    {showInput && cta2Href &&
                    <div>
                        <ButtonLink href={cta2Href} label={cta2Label ?? ''} variant="secondary" />
                    </div>
                    }
                </Reveal>
                }
            </div>
        </section>
    );
}
