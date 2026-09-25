import type { ReactNode } from "react";
import { Reveal } from "./Reveal.tsx";
import { cx } from "./cx.ts";

type CalloutProps = {
    heading: string;
    content: ReactNode;
    /**
     * Line length, mirroring RichText's own field. "full" is the historical
     * behaviour and stays the default: 24 of the 26 posts carrying a Callout
     * run full-width body copy, so a full-width box is what lines up there.
     * "prose" clamps to the same 800px --measure the RichText blocks use, for
     * the posts written as a readable column — without it the Callout is the
     * one block that breaks out of the measure, which is exactly how this was
     * spotted. Opt-in rather than inherited because a block cannot see the
     * width its neighbours chose; same reasoning as RichText `width`,
     * Badges `variant`, FlexSection `layout` and FeatureCard `media`.
     */
    width?: 'full' | 'prose';
};

/**
 * A boxed callout — added specifically for the blog migration's
 * "key-takeaways"-style sections (found on 24 of the live posts, via the
 * migration reconnaissance script), a real recurring pattern worth a
 * dedicated block rather than degrading to plain paragraphs. Uses the same
 * `.card` surface as Card.tsx (see styles/components.css) for a
 * visually consistent "boxed" look rather than inventing a second one.
 */
export function Callout({ heading, content, width = 'full' }: Readonly<CalloutProps>) {
    return (
        <Reveal
            className={cx('card p-6 border-l-4 border-(--primary-accent-color)', width === 'prose' && 'measure')}
        >
            {heading && <h3 className="subheading">{heading}</h3>}
            <div>{content}</div>
        </Reveal>
    );
}
