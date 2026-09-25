/* eslint-disable @next/next/no-img-element */
import { Reveal } from "./Reveal.tsx";
import { renderHeading } from "./Hero.tsx";

type HeroBannerProps = {
    as?: 'h1' | 'h2';
    heading: string;
    subheading?: string;
    copy?: string;
    cta1Label?: string;
    cta1Href?: string;
    cta2Label?: string;
    cta2Href?: string;
    /** The photograph behind the text. Full-bleed and object-fit: cover. */
    imageSrc: string;
    /**
     * Empty by default, and it should usually stay empty. The picture here is
     * atmosphere behind copy that already says what the page is about; giving
     * it alt text makes a screen reader announce a description of scenery
     * immediately before the heading that matters. Fill it only when the
     * photograph carries information the copy doesn't.
     */
    imageAlt?: string;
    accentLastWord?: boolean;
    accentWord?: string;
};

/**
 * A full-bleed photographic banner with the page's heading over it — distinct
 * from Hero, which puts its image in a column BESIDE the text.
 *
 * The scrim is not decoration. A photograph has no contrast guarantee: any
 * given pixel behind the text can be any luminance, so the text's contrast
 * ratio is whatever the photo happens to be that day. The white wash fixes a
 * floor under it, which is what makes dark text on a photo a legitimate thing
 * to ship rather than a gamble. It is strongest across the text column and
 * falls away to the right, so the picture is still a picture.
 */
export function HeroBanner({
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
    accentLastWord = false,
    accentWord
}: Readonly<HeroBannerProps>) {
    return (
        <section className="hero-banner full-bleed">
            {imageSrc &&
            /* Deliberately an <img>, not a CSS background: this is the LCP
               element on any page that opens with one, and a background-image
               is discovered only after the stylesheet has been parsed. No
               loading="lazy" for the same reason. */
            <img className="hero-banner-image" src={imageSrc} alt={imageAlt ?? ''} />
            }
            <div className="hero-banner-scrim" aria-hidden="true" />
            <div className="hero-banner-inner">
                <Reveal className="hero-banner-content">
                    {subheading &&
                    <p className="eyebrow">{subheading}</p>
                    }
                    <Heading>{renderHeading(heading, accentLastWord, accentWord)}</Heading>
                    {copy &&
                    <p>{copy}</p>
                    }
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
            </div>
        </section>
    );
}
