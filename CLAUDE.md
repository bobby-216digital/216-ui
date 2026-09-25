# @216digital/ui

The 216digital design system: hand-written React components (`src/*.tsx`), design tokens
(`src/styles/tokens.css`) and component CSS (`src/styles/components.css`). Published to public npm
as `@216digital/ui` and consumed by the 216-mono marketing site; a sister brand will follow.

## Layout

```
src/                  one file per component, plus cx.ts; imported by deep path, no barrel
  styles/             tokens.css, components.css, index.css (= both); copied to dist/ as-is
playground/           dev-only Next app that renders src/ directly; never published
scripts/              build, pack check, and the parity scripts run against a 216-mono copy
docs/site-cutover.md  how 216-mono switches to this package, and what it must pass
```

## Hard rules

- **Every change is semver.** The site renders whatever these components output, so a changed
  prop, default, class name or DOM structure is a breaking change for it, even when it looks
  cosmetic. Record each release in `CHANGELOG.md`.
- **No component libraries** (MUI, shadcn, Radix wrappers, …), **no Storybook** (the playground
  is the place to iterate), **no `next/image`** (the site is a static export with no image
  optimizer).
- **No Puck dependency.** The package knows nothing about the editor; Puck configs live in the
  site. Anything brand- or site-specific (a logo, an email address, a URL path, an env var) is a
  prop, never a literal here.
- **React, React DOM and Next are peer dependencies only.** As regular dependencies the consumer
  would load a second copy of React and break at runtime.
- **No barrel `index.ts`.** It would pull every `'use client'` component into every import.
- **Build with plain `tsc`, no bundler.** tsc keeps each file's `'use client'` directive in
  place; bundlers strip or hoist it unless configured, which turns a client component into a
  server one in the consumer.

## Components and styling

- **The palette is meant to be complete and opinionated.** Add a component only when something
  can't be expressed with the existing ones. Lesson learned: per-component `card`/`featured`
  booleans pushed design decisions onto content editors, so they were replaced by one `Card`
  container. A surface belongs to `Card`, not to a boolean on each component that wants one.
- **Colors, type and spacing go through the tokens** in `tokens.css`, never raw Tailwind values,
  so a brand theme can override them. Tailwind utilities are for layout and one-off tweaks. If a
  cluster of utilities repeats, make it a real class.
- **Vertical rhythm belongs to the stylesheet, not the components.** Every page-level block
  renders as a `<section>` with no vertical margin or padding of its own; the "vertical rhythm"
  rules in `components.css` (keyed off `.page-blocks`) set all spacing between blocks. A new
  block does the same. Interior padding (a card's `p-6`, a coloured band) is fine.
- **`Badges variant: "stat"` is for big-numeral stat rows.** Don't restyle `Badges strong`
  globally: the chip rows use the same markup.
- **Component CSS lives in `@layer site`**, which outranks Tailwind only because the consumer
  imports it after `@import "tailwindcss"`. The consequence: a Tailwind utility on an element
  that a layered rule already styles is inert (margin on a `.control-button`, line-height on an
  `h2`). Put that styling in the class instead. The reduced-motion block at the top stays
  unlayered on purpose (see its comment).

## Traps, all hit before

- **A Tailwind class written flush against `${` is silently dropped.** The scanner reads
  `foo${` as `foo$`, matches nothing and generates nothing, so the class is in the HTML with no
  rule behind it. Use `cx()` (`src/cx.ts`, which lists the three times this happened) for
  conditional class lists, or leave a space before the interpolation.
- **`min-width: 0` on a flex child is not the fix for an overflowing `FlexSection`.** It makes
  cards shrink to ~100px columns instead of wrapping. See the comment on `.flex-section-cards`.
- **Class names must survive into `dist/` as literal strings.** The consumer's Tailwind scans
  `dist/` to generate the utilities. Don't compute class names from fragments.
- **Relative imports use the `.tsx`/`.ts` extension** (`./Reveal.tsx`). The playground's
  Turbopack resolves them from `src/`; `rewriteRelativeImportExtensions` turns them into `.js`
  in the emitted JS, and `scripts/build.mjs` does the same in the `.d.ts` files, which tsc
  leaves alone. The `.js` is required: the package is `"type": "module"`.
- **Text next to a `{value}` in JSX server-renders with a `<!-- -->` between the two text
  nodes.** Turning a literal into a prop can change the markup that way. Build the string with a
  template literal (see ContactForm's consent line).

## Checking a change against the site

The playground shows a component; only the site shows what a change does to real pages. Before
a release that touches markup or CSS, run the parity check in `docs/site-cutover.md`
(`scripts/parity/`) against a scratch copy of 216-mono. Never run it in a real 216-mono checkout.

## Commands

```bash
npm run playground         # dev playground, localhost:3000
npm run typecheck
npm run lint
npm run build              # dist/
npm run playground:build
npm run check-pack         # tarball holds only dist/, package.json, README.md, CHANGELOG.md
```
