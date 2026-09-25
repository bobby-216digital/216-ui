/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { Reveal } from "./Reveal.tsx";

type FeatureCardProps = {
    icon: string;
    iconAlt?: string;
    heading: string;
    copy: ReactNode;
    /** Soft tint wash behind the icon, for visual variety across a row of
        cards — stays in the warm palette (orange/umber) rather than a cool
        accent (see the note in styles/components.css). Defaults to "none" (today's
        plain look), so existing content renders unchanged. */
    accentColor?: 'none' | 'orange' | 'umber';
    /**
     * Which heading element the card's title is. "h3" is right whenever the
     * row sits inside a section that already has an h2, which is most of
     * them, so it stays the default and no existing content changes.
     *
     * It has to be settable, because a few rows sit directly under the page's
     * h1 with nothing in between — /ppc-marketing/, /216digit-training/ and
     * /ada-title-ii-and-section-508/ all open with one. There the h3 skips a
     * level, which axe reports as a heading-order violation. The card cannot
     * work this out for itself: it depends on what is above it on the page,
     * which only whoever composed the page knows.
     *
     * Visual size is .card-title either way, so this changes the outline and
     * nothing else.
     */
    headingLevel?: 'h2' | 'h3';
    /**
     * What the image actually is, which is the one thing this card can't
     * infer: an "icon" is a small glyph that wants a badge around it (the
     * default, and every existing card), a "portrait" is a photo of a
     * person that wants to BE the shape instead.
     *
     * Added for /about/'s team roster, where nine 3:4 headshots were being
     * forced into the icon treatment: 48x48 with no object-fit, so each one
     * was squashed out of aspect ratio, then centred in a white circular
     * badge that read as a frame around a thumbnail. `accentColor` has no
     * effect in portrait mode — there's no badge left to tint.
     */
    media?: 'icon' | 'portrait';
};

const ACCENT_CLASSNAMES: Record<NonNullable<FeatureCardProps['accentColor']>, string> = {
    none: 'feature-icon',
    orange: 'feature-icon feature-icon-orange',
    umber: 'feature-icon feature-icon-umber',
};

// No padding/box styling of its own — wrap in a Card block (Card.tsx)
// for the live site's card-look instances; used bare where it isn't (see the
// note in puck.config.tsx).
export function FeatureCard({ icon, iconAlt, heading, copy, accentColor = 'none', media = 'icon', headingLevel = 'h3' }: Readonly<FeatureCardProps>) {
    const portrait = media === 'portrait';
    const Heading = headingLevel;

    return (
        // A fixed w-56 for portraits rather than the icon variant's max-w-sm:
        // a row of them is a roster, and roster tiles have to be the same
        // width or the row reads as ragged. The icon variant is content-sized
        // on purpose — its copy is a paragraph, not a job title.
        <Reveal
            className={`flex flex-col items-center gap-3 text-center ${
                portrait ? 'feature-portrait w-56' : 'max-w-sm'
            }`}
        >
            {portrait ? (
                // object-top, not the default centre: every headshot here is
                // framed head-and-shoulders in the upper half, so a centred
                // square crop of a 3:4 photo cuts into the face.
                <img
                    src={icon}
                    alt={iconAlt ?? ''}
                    className="w-32 h-32 rounded-full object-cover object-top shadow-md"
                    loading="lazy"
                />
            ) : (
                <div className={`rounded-full shadow-md p-4 ${ACCENT_CLASSNAMES[accentColor]}`}>
                    <img src={icon} alt={iconAlt ?? ''} className="w-12 h-12" loading="lazy" />
                </div>
            )}
            <Heading className="card-title">{heading}</Heading>
            <div className="text-center">{copy}</div>
        </Reveal>
    );
}
