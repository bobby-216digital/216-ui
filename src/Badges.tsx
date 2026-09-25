import type { ReactNode } from "react";
import { cardClassName } from "./Card.tsx";
import { Reveal } from "./Reveal.tsx";

type Badge = {
    label: ReactNode;
};

type BadgesProps = {
    items: Array<Badge>;
    /**
     * "chip" is the historical look — body-size bold text, used for the
     * checkmark rows ("✓ WCAG 2.1") on /ada-title-ii-and-section-508/ and
     * /radar/.
     *
     * "stat" is for the `<strong>46%</strong><br>label` rows that appear on
     * seven pages, where the number was rendering at body size and the whole
     * row read as small print inside a mostly-empty card. It scales the
     * number up and quietens the label (see .badge-stat in styles/components.css).
     * Opt-in so the chip rows are untouched.
     */
    variant?: 'chip' | 'stat';
    /**
     * How the row is presented as a surface, which is separate from how the
     * items themselves are typeset (`variant` above) — the XD comps use both
     * stat treatments on the same page shape:
     *
     * - "none" (default): a bare row. What every existing usage renders as,
     *   usually with the page's own Card block wrapped around the whole row.
     * - "divided": still one surface, but with hairline rules between the
     *   items. /ada/'s five-stat row, where a single undivided box read as
     *   one paragraph of numbers rather than five separate figures.
     * - "cards": each item gets its own card surface, for the comps that
     *   show discrete tiles side by side (/demand-letter-response/'s three).
     *   Wrapping the row in a page-level Card block as well would nest a
     *   card in a card — use one or the other.
     */
    surface?: 'none' | 'divided' | 'cards';
};

/** A centered row of short standalone items — checkmark badges, stat callouts, etc. */
export function Badges({ items, variant = 'chip', surface = 'none' }: Readonly<BadgesProps>) {
    // py-2 rather than py-6: these rows are almost always wrapped in a Card
    // (which already brings p-6), and the doubled padding left a single-stat
    // row sitting in ~140px of mostly-empty card.
    const rowClasses = [
        'flex flex-wrap justify-center items-center gap-8 gap-y-6 text-center py-2',
        variant === 'stat' ? 'badge-stat' : 'badge-chip',
        surface === 'divided' ? 'badge-divided' : '',
        surface === 'cards' ? 'badge-cards' : ''
    ].filter(Boolean).join(' ');

    return (
        <div className={rowClasses}>
            {items.map((item, index) => (
                <Reveal
                    key={index}
                    delay={index * 80}
                    className={surface === 'cards' ? cardClassName() : undefined}
                >
                    {item.label}
                </Reveal>
            ))}
        </div>
    );
}
