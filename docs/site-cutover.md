# Site cutover: `216-mono` consumes `@216digital/ui`

This is the plan for switching the `216-mono` marketing site from its in-repo `packages/ui` to
the published `@216digital/ui` package. It's one PR in `216-mono`, opened only once the
preconditions below hold. Until then, nothing in `216-mono` changes.

Inventory as of `216-mono` `origin/main` 6980c3e. Re-check the counts before starting, because
the site keeps changing in the meantime.

## Preconditions

- [ ] `@216digital/ui@0.1.x` is published publicly on npm
- [ ] The parity diff in `216-ui`'s HANDOFF.md passed against a current copy of `216-mono`
- [ ] `216-ui`'s `packages/ui` matches `216-mono`'s: no component changes landed in the site
      after the extraction without being ported. Check with
      `git log 6980c3e..origin/main -- packages/ui app/globals.css` in `216-mono`
- [x] Every prop added during extraction is listed below with the value the site passes

## What stays true

- **Still a single npm project.** `@216digital/ui` is an ordinary dependency from the registry,
  not a workspace. React, React DOM and Next are peer dependencies, so the site's own copies
  are the only ones installed.
- **Zero-setup local dev still holds.** The package is public, so `npm install` needs no
  credentials.
- **Puck configs stay in the site** (`packages/content/*.config.tsx`). Only their import paths
  change.

## Steps

### 1. Add the dependency

```bash
npm install --save-exact @216digital/ui@0.1.x
```

Pin exactly. Upgrades should be deliberate, reviewed PRs, because a class name change in the
package changes the live site.

### 2. Rewrite imports (47 imports in 10 files)

Mechanical: `../ui/X`, `@/packages/ui/X` and `@repo/packages/ui/X` all become
`@216digital/ui/X`.

| File | Imports |
| --- | --- |
| `packages/content/puck.config.tsx` | 20 |
| `app/dev/components/page.tsx` | 8 (the file is deleted in step 6) |
| `packages/content/blog.config.tsx` | 5 |
| `app/layout.tsx` | 2 |
| `packages/content/site.config.tsx` | 2 |
| `app/ideas/page.tsx` | 2 |
| `app/ideas/page/[page]/page.tsx` | 2 |
| `app/ideas/category/[category]/page.tsx` | 2 |
| `app/ideas/category/[category]/page/[page]/page.tsx` | 2 |
| `services/editor/app/preview/[[...slug]]/page.tsx` | 2 |

Then confirm nothing is left: `grep -rnE "(\.\./ui/|packages/ui/)" app packages services scripts`
should print only comments. Update the comments that point at `packages/ui/<File>.tsx` (in
`scripts/`, `services/editor/lib/mail.ts`, the contact route and `globals.css`) to point at the
package.

### 3. Pass the new props

The package can't read the site's env or know its brand, so these values move into the site.
Each one must reproduce today's output exactly. This is the complete list from the extraction.

| Component | Prop | Value | Rendered at |
| --- | --- | --- | --- |
| ContactForm | `endpoint` | `process.env.NEXT_PUBLIC_CONTACT_API_URL \|\| "https://api.216digital.com/api/contact"` (keep the build-time var and its fallback) | `puck.config.tsx`, ContactForm `render` |
| ContactForm | `contactEmail` | `"info@216digital.com"` | same |
| ContactForm | `contactPhone` | `{ label: "216.505.4400", href: "tel:2165054400" }` (the error message's phone line; also hardcoded before) | same |
| ContactForm | `organizationName` | `"216digital"` | same |
| Header | `logo` | `{ src: "/brand/logo.png", alt: "216digital homepage" }` | `app/layout.tsx`, `site.config.tsx` root `render`, `services/editor/app/preview/[[...slug]]/page.tsx` |
| Footer | `logo` | `{ src: "/brand/logo.png", alt: "216digital" }` (a different alt from the Header's: it isn't a link) | wherever `toFooterProps` is spread (same three places) |
| Footer | `trustSeal` | `{ title: "216 Digital Accredited Business", href: "https://www.bbb.org/akron/business-reviews/web-design/216-digital-inc-in-twinsburg-oh-39000398/#sealclick", src: "https://seal-akron.bbb.org/seals/blue-seal-200-65-bbb-39000398.png", alt: "216 Digital, Inc. BBB Business Review" }` (deliberately hotlinked) | same |
| CategoryCloud | `basePath` | `"/ideas/category/"` (renders `${basePath}${slug}/`) | the four `app/ideas/**/page.tsx` files |
| ScanCta | `formAction` | no longer defaults to `"/contact/"`. Render as `<ScanCta {...props} formAction={props.formAction ?? "/contact/"} />`; `??`, not `\|\|`, to match the old default parameter exactly | `puck.config.tsx`, ScanCta `render` |

What the parity run did, and what the PR should do: put all of these in one new module,
`packages/content/brand.ts`, so the three Header/Footer call sites can't drift apart. Add
`logo` and `trustSeal` to what `toFooterProps` returns, which covers every Footer at once, and
pass `logo={HEADER_LOGO}` at the three Header call sites.

ContactForm's `render` keeps picking its fields explicitly rather than spreading `props`:
`<ContactForm heading={heading} {...CONTACT_FORM} />`. The props are plain data, so they cross
the client boundary fine.

### 4. Replace the stylesheet

`app/globals.css` shrinks to the Tailwind wiring plus the rules that stayed in the site:

```css
@import "tailwindcss";

/* The package ships class names, not compiled utilities: Tailwind has to scan its dist/ to
   generate them. Tailwind skips node_modules unless told otherwise, and the result is a
   PARTIALLY styled page that's easy to miss. */
@source "../node_modules/@216digital/ui/dist";
@source "../packages/content";

@theme inline { /* unchanged */ }

/* Must come after the tailwindcss import: its @layer site has to follow Tailwind's layers. */
@import "@216digital/ui/styles.css";

/* Site-only rules, in the package's layer so they merge in after its rules. */
@layer site {
  /* paste the contents of 216-ui's docs/site-only.css */
}
```

What stays behind, verbatim in `216-ui/docs/site-only.css` (22 rules). The parity run confirmed
that appending them to the end of the layer changes no cascade outcome:

- **Skip links** (`app/layout.tsx`): `.skip-link`, `.skip-link:focus`, and the
  `#main-content` / `#site-footer` scroll-margin and focus-outline rules. Footer still renders
  `id="site-footer" tabIndex={-1}` so the link has a target.
- **Puck's RichText wrapper** (`.rich-text`): the list styles, the `list: "check"` markers
  (`.rich-text-checks .rich-text …`), the prose rhythm (`.rich-text > h2` etc.), the centred
  structural eyebrow, the `.measure` accent bar, the portrait-card role text
  (`.feature-portrait .rich-text p`) and the small-print paragraphs
  (`.rich-text-note .rich-text p`).
- **WordPress compat:** `.has-medium-font-size`, which the Footer's column headings carry.

- Remove `@source "../packages/ui"`. Keep `@source "../packages/content"`: the Puck configs
  have Tailwind classes of their own.
- Keep the fonts in `app/fonts.ts`. The package expects `--font-sen` / `--font-roboto` on
  `<html>`, as today.
- `services/editor/app/layout.tsx` already imports `app/globals.css`, so the editor preview
  picks all of this up. The `@source` path is resolved relative to `app/globals.css`, so it
  works from both apps.

### 5. Editor tsconfig

In `services/editor/tsconfig.json`, the `include` entries for `../../packages/**` stay, since
`packages/content` is still there. There's nothing to add; types come from the package.

### 6. Delete what moved

- `packages/ui/`
- `app/dev/components/` (the playground now lives in `216-ui`)

### 7. Update `216-mono/CLAUDE.md`

- **Layout:** remove `packages/ui/`, and note that components come from `@216digital/ui`
  (repo `bobby-216digital/216-ui`).
- **Hard rules:** keep "single npm project". Add that component, token or component-CSS changes
  go in `216-ui` and arrive here as a version bump, never as an edit in `node_modules` or a
  local fork.
- **Components and styling:** keep the palette list and the content-facing guidance (which
  block to use when). Point to `216-ui`'s CLAUDE.md for the `cx()` trap, the `min-width: 0` trap
  and the vertical-rhythm rule. Replace "iterate at `/dev/components`" with the `216-ui`
  playground.
- **Easy-to-break plumbing:** replace the `@source "../packages/ui"` note with the
  `node_modules/@216digital/ui/dist` one.
- **"After touching any component… run smoke-test"** still applies to package upgrades.

## Verification

Run everything in the PR before merging. The HTML comparison can't be a plain `diff -r`: two
builds of the same commit already differ, because Next embeds a random build ID and streams
`<head>` metadata and RSC rows in nondeterministic order. `216-ui/scripts/parity/` normalizes
that away. Run both scripts from inside the 216-mono checkout, which has their dependencies
(cheerio, postcss):

```bash
git stash && npm run build && cp -r out /tmp/out-before && git stash pop
npm run build && cp -r out /tmp/out-after
node ../216-ui/scripts/parity/compare-html.mjs /tmp/out-before /tmp/out-after
node ../216-ui/scripts/parity/compare-css.mjs /tmp/out-before/_next/static/chunks/*.css -- /tmp/out-after/_next/static/chunks/*.css
npm run lint
npm run smoke-test
npm run check-links
npm run editor:build                             # and editor:dev → /edit/home: the preview must be fully styled
```

What passing looks like, from the extraction's run against 6980c3e:

- **`compare-html`: `DOM differences: 0`** across every page. Only `dev/components.html` is
  gone. The RSC payload shows exactly three edits: Header's `logo` prop (every page),
  ContactForm's new props (`/contact/`) and the deleted `dev` route in the route tree. Anything
  else in the payload, or any DOM difference, is a regression.
- **`compare-css`**: nothing missing except the utilities only `app/dev/components` used
  (`gap-16`, `pb-24`, `list-disc`). `.rich-text-note, .rich-text-note .rich-text p` shows as
  split into two rules, and the 22 site-only rules show as moved within `@layer site`. A
  missing utility means Tailwind isn't scanning the package's `dist/` (check the `@source`
  path). That's the partially-styled trap.

A DOM difference means a prop default or a class string changed. Fix it in `216-ui` and
re-release; don't patch around it in the site.

## Follow-ups this leaves for 216-ui

None of these block the cutover; parity holds as it stands. They're what the sister brand would
trip over:

- The Footer's headings carry `has-medium-font-size`, whose rule stays in the site. On any other
  consumer they render as plain `h2`s. Give them a package class of their own.
- RichText's `tone: "note"`, `list: "check"` and `eyebrow` props, plus FeatureCard's portrait
  role text, only look right with the `.rich-text` rules the site keeps, because those rules
  target Puck's wrapper. Decide whether the package should style its own content wrapper.
- `.card-logo`, `.card-logo-beside` and `.card-logo-main` are in the package's CSS, but the
  markup is built in the site's `puck.config.tsx` Card `render`. Moving the logo into `Card`
  would make the package own both halves.

## Rollback

Revert the cutover commit. Nothing about content, deployment or the editor service depends on
where the components come from.

## Iterating across both repos later

To try an unreleased `216-ui` change in the site locally:

```bash
cd ../216-ui && npm run build && npm pack
cd ../216-mono && npm install ../216-ui/216digital-ui-<version>.tgz
```

Never commit that `file:` dependency, and **don't use `npm link`**. A linked package resolves
React from its own `node_modules`, which loads two copies of React and breaks at runtime:
the failure the single-npm-project rule exists to prevent.
