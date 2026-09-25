import type { ReactNode } from "react";
import { Reveal } from "./Reveal.tsx";
import { cx } from "./cx.ts";

type Column = {
    /** Relative width, like WordPress's column-width ratio (e.g. 2 next to 1 for a 2:1 split). */
    weight?: number;
    /** Left border + vertical centering. */
    divider?: boolean;
    content: ReactNode;
};

type ColumnsProps = {
    items: Array<Column>;
    /** Tinted background box wrapping the whole row. */
    background?: "none" | "tint";
};

/**
 * A row of freeform side-by-side columns (WordPress's core/columns block), stacking on mobile.
 * Wrap a column's content in a Card block for the live site's card-look columns.
 * Each column's own slot content is expected to stack vertically within that column, not flex
 * against its own siblings — unlike FlexSection's slot (see the note in puck.config.tsx), this
 * one's wrapper div is intentional. If a column ever needs multiple blocks laid out in a row
 * inside itself, that wrapper would need the same fix FlexSection got.
 */
export function Columns({ items, background = "none" }: Readonly<ColumnsProps>) {
    return (
        <section className={background === "tint" ? 'bg-(--secondary-bg-color) p-6' : undefined}>
            <Reveal className="flex flex-wrap gap-8">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={cx(
                            'columns-column min-w-[220px]',
                            item.divider && 'border-l-[3px] border-(--secondary-accent-color) pl-6 self-center'
                        )}
                        style={{ flex: item.weight ?? 1 }}
                    >
                        {item.content}
                    </div>
                ))}
            </Reveal>
        </section>
    );
}
