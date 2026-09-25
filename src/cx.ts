/**
 * Joins class names, dropping anything falsy.
 *
 * Exists because of a trap this codebase has now hit three times: a Tailwind
 * class written flush against a `${` in a template literal is silently
 * dropped. The scanner tokenises `min-w-[220px]${` as `min-w-[220px]$`,
 * matches no utility, and generates nothing — so the class is in the HTML,
 * the stylesheet has no rule for it, and nothing anywhere reports an error.
 *
 * The three:
 *   - `overflow-x-clip${` on Hero, which put a horizontal scrollbar on
 *     every page (recorded in CLAUDE.md).
 *   - `border-b${` on the tab strip, which removed its underline.
 *   - `min-w-[220px]${` on Columns, which is why a two-column row never
 *     wrapped on a phone — it overflowed the viewport instead, on every
 *     page using the block, for as long as the block has existed.
 *
 * Passing the classes as separate arguments means no class is ever adjacent
 * to an interpolation, so the scanner always sees whole tokens. Prefer this
 * over a template literal anywhere a class list is conditional.
 */
export function cx(...parts: Array<string | false | null | undefined>): string {
    return parts.filter(Boolean).join(' ');
}
