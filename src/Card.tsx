import type { ReactNode } from "react";
import { cx } from "./cx.ts";

type CardProps = {
    children: ReactNode;
    /** Slightly scaled up and raised above its siblings. */
    featured?: boolean;
    /**
     * The surface's own fill. "white" is the .card default everywhere on the
     * site; "peach" is the tinted box the XD comps use where a card sits on
     * a white section and needs to read as a pulled-out aside rather than as
     * one more white panel (a11y.Radar's "Fewer than 5%" figure).
     *
     * This is on Card, rather than a `tint` boolean added to each component
     * that might want one — that's the mistake the card/featured booleans on
     * FeatureCard/FlexSection/Columns/Badges made before Card existed at all
     * (see the note in CLAUDE.md). One surface component owns the surface.
     */
    background?: 'white' | 'peach';
};

export function cardClassName(featured = false, background: 'white' | 'peach' = 'white'): string {
    return cx('card p-6', featured && 'scale-110 z-2', background === 'peach' && 'card-peach');
}

/** A rounded, drop-shadowed surface (see .card in styles/components.css) wrapping arbitrary content. */
export function Card({ children, featured = false, background = 'white' }: Readonly<CardProps>) {
    return (
        <div className={cardClassName(featured, background)}>
            {children}
        </div>
    );
}
