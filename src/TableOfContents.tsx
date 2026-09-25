import Link from "next/link";

export type TocEntry = { text: string; anchor: string };

type TableOfContentsProps = {
    items: Array<TocEntry>;
};

/**
 * Renders a table of contents computed once, at migration time, by walking
 * a post's original heading structure — not authored/edited directly, and
 * not derived live from RichText content on every render. Puck resolves a
 * `richtext` field into an already-rendered element before any component
 * (including this one, if it tried) ever sees the raw HTML, so extracting
 * headings from the *rendered* content isn't practical; computing it once
 * up front and storing the result as plain data avoids that entirely, and
 * is always in sync since nothing regenerates it separately.
 */
export function TableOfContents({ items }: Readonly<TableOfContentsProps>) {
    if (items.length === 0) return null;

    return (
        <nav aria-label="Table of contents" className="card p-6 h-fit">
            <p className="subheading">On this page</p>
            <ul className="flex flex-col gap-2">
                {items.map((item) => (
                    <li key={item.anchor}>
                        <Link href={`#${item.anchor}`}>{item.text}</Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
