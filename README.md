# @216digital/ui

The 216digital design system: hand-written React components, design tokens
and component CSS, extracted from the 216digital marketing site (216-mono).

## Use

```bash
npm install --save-exact @216digital/ui
```

Peer dependencies: `react` and `react-dom` ^19.2, `next` >=16.3 <17 (the
components use `next/link`).

Import each component from its own path. There is deliberately no barrel
index, which would pull every client component into every import:

```tsx
import { Header } from "@216digital/ui/Header";
import { cx } from "@216digital/ui/cx";
```

### Styles

The package ships class names, not compiled Tailwind utilities. Your
Tailwind build has to scan the package to generate them, and the component
CSS has to load after Tailwind:

```css
@import "tailwindcss";

/* Tailwind skips node_modules unless told otherwise. Without this line the
   page renders PARTIALLY styled, which is easy to miss. */
@source "../node_modules/@216digital/ui/dist";

/* After the Tailwind import: the package's rules sit in `@layer site`, which
   outranks Tailwind's layers only when declared after them. */
@import "@216digital/ui/styles.css";
```

`styles.css` is `tokens.css` plus the component CSS. `@216digital/ui/tokens.css`
is available on its own.

The tokens alias `--font-sen` and `--font-roboto`, which you set on `<html>`
(for example with `next/font`). Page-level blocks get their vertical rhythm
from `.page-blocks`, so put that class on the element that holds them (216-mono
uses its `<main>`).

## Develop

```bash
npm install
npm run playground         # component playground at localhost:3000
npm run typecheck
npm run lint
npm run build              # tsc → dist/, CSS copied as-is
npm run check-pack         # the tarball holds only dist/ and the root docs
```

The playground (`playground/`) is a small Next app that renders the sources
directly. It's dev-only and never published. See `CLAUDE.md` for the rules
and traps, and `docs/site-cutover.md` for how 216-mono consumes this package.
