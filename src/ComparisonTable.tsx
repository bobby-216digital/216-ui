/* eslint-disable @next/next/no-img-element */
import { Fragment } from "react";
import { Reveal } from "./Reveal.tsx";
import { cx } from "./cx.ts";

type ComparisonRow = {
    /** The row's own label, e.g. "Cost". Rendered as <th scope="row">. */
    label: string;
    lowerValue: string;
    lowerNote?: string;
    oursValue: string;
    oursNote?: string;
    higherValue: string;
    higherNote?: string;
};

type ComparisonTableProps = {
    /**
     * Puck's block id, used to give the <caption> an id the scroll region's
     * aria-labelledby can point at. Passed through from the config rather
     * than generated, since this renders on the server (no useId).
     */
    idBase?: string;
    /**
     * Visible <caption>. Not in the source comp, which relies on the Hero
     * above it for context — but a table with no accessible name is a table
     * a screen reader user lands on with no idea what it compares, and the
     * same string names the scroll region below. Keep it short.
     */
    caption: string;
    lowerLabel: string;
    higherLabel: string;
    /**
     * The middle column's head. A logo if one is set (this chart exists to
     * say "here is where we sit"), otherwise the text label.
     */
    oursLabel: string;
    oursLogoSrc?: string;
    oursLogoAlt?: string;
    rows: Array<ComparisonRow>;
};

/**
 * A three-column market-position chart: a cheaper/lighter alternative, us,
 * and a heavier/costlier one, compared row by row.
 *
 * The three columns are fixed rather than a `columns` array with a
 * `highlight` flag, and each row carries six named cell fields rather than a
 * nested array of cells. That's deliberate: a variable column count makes
 * the number of cells per row editor-maintained state that can silently
 * desync from the header (Puck gives no way to enforce "this inner array is
 * the same length as that outer one"), and nested array fields in the editor
 * present as unlabelled "Item 1/2/3" with nothing to say which column an
 * editor is filling in. The shape this block draws is inherently three-way —
 * below us, us, above us — so the columns are part of the block, not data.
 *
 * TWO RENDERINGS, one of which is always display:none (see the breakpoint in
 * styles/components.css). On a wide screen it's a real <table>, because every cell is
 * only meaningful against both its row and column headers and that is
 * exactly what table semantics announce. Narrow, the same data is a stack of
 * one card per offering, each a <dl> of label/value pairs.
 *
 * Why not just scroll the table sideways on a phone: at 390px two of the
 * three columns sit off-screen, and what goes with them is the qualifier
 * under each figure — the conditions that make an outcome claim honest are
 * the first thing a horizontal scroll hides, which is exactly backwards.
 *
 * And why a second rendering rather than restyling the table to stack:
 * giving table elements `display: block` strips their table semantics in
 * real screen readers, so a stacked table has to rebuild every one of them
 * through ARIA roles and repeat each row label as CSS generated content.
 * `display: none` on the rendering that isn't in use takes it out of the
 * accessibility tree entirely, so exactly one honest, native structure is
 * ever exposed. The duplicated markup is four rows by three columns.
 */
export function ComparisonTable({
    idBase,
    caption,
    lowerLabel,
    higherLabel,
    oursLabel,
    oursLogoSrc,
    oursLogoAlt,
    rows,
}: Readonly<ComparisonTableProps>) {
    const captionId = `${idBase || "comparison"}-caption`;

    // Both renderings walk this, so a column can't say one thing in the
    // table and another in the stack. Order is left-to-right cheapest to
    // costliest, which is itself part of the argument — we're the middle
    // one — so the stack keeps it rather than promoting ours to the top.
    const columns = [
        { key: "lower", label: lowerLabel, ours: false, cells: rows.map((r) => ({ value: r.lowerValue, note: r.lowerNote })) },
        { key: "ours", label: oursLabel, ours: true, cells: rows.map((r) => ({ value: r.oursValue, note: r.oursNote })) },
        { key: "higher", label: higherLabel, ours: false, cells: rows.map((r) => ({ value: r.higherValue, note: r.higherNote })) },
    ];

    const oursHead = oursLogoSrc
        ? <img className="comparison-logo" src={oursLogoSrc} alt={oursLogoAlt || oursLabel} loading="lazy" />
        : oursLabel;

    return (
        <section>
            <Reveal>
                {/*
                    The table keeps a min-width so three columns of real copy
                    don't crush to slivers, which means it can still overflow
                    just above the breakpoint (large text, or a zoomed page
                    whose CSS width lands between the two). That makes this a
                    scrollable region, and so something a keyboard user has to
                    be able to reach and scroll — hence role + tabIndex + a
                    name.
                */}
                <div
                    className="comparison-table-scroll"
                    role="region"
                    tabIndex={0}
                    aria-labelledby={captionId}
                >
                    <table className="comparison-table">
                        <caption id={captionId}><span>{caption}</span></caption>
                        <thead>
                            <tr>
                                {/* Empty corner: heads the row-label column, which
                                    labels rather than being labelled. */}
                                <td />
                                <th scope="col">{lowerLabel}</th>
                                <th scope="col" className="comparison-ours">{oursHead}</th>
                                <th scope="col">{higherLabel}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <tr key={index}>
                                    <th scope="row">{row.label}</th>
                                    <Cell value={row.lowerValue} note={row.lowerNote} />
                                    <Cell value={row.oursValue} note={row.oursNote} ours />
                                    <Cell value={row.higherValue} note={row.higherNote} />
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="comparison-stack">
                    <p className="comparison-stack-caption">{caption}</p>
                    {columns.map((column) => (
                        <div
                            key={column.key}
                            className={cx("comparison-stack-card", column.ours && "comparison-stack-ours")}
                        >
                            <h3 className="comparison-stack-head">
                                {column.ours ? oursHead : column.label}
                            </h3>
                            <dl>
                                {column.cells.map((cell, index) => (
                                    <Fragment key={index}>
                                        <dt>{rows[index].label}</dt>
                                        <dd>
                                            <span className="comparison-value">{cell.value}</span>
                                            {cell.note && <span className="comparison-note">{cell.note}</span>}
                                        </dd>
                                    </Fragment>
                                ))}
                            </dl>
                        </div>
                    ))}
                </div>
            </Reveal>
        </section>
    );
}

/** One table cell: a headline value, and an optional qualifier under it. */
function Cell({ value, note, ours = false }: Readonly<{ value: string; note?: string; ours?: boolean }>) {
    return (
        <td className={cx(ours && "comparison-ours") || undefined}>
            <span className="comparison-value">{value}</span>
            {note && <span className="comparison-note">{note}</span>}
        </td>
    );
}
