# Changelog

Every change is semver from the site's point of view: a changed prop, class
name or default is a breaking change for 216-mono. Stay on 0.x until the site
has run on the package for a while and the sister brand has consumed it (in
0.x, a breaking change bumps the minor version).

## 0.2.0

Themeable colors. Renders the same as 0.1.0 at the default palette.

- **Tokens moved from `*` to `:root`.** Breaking for any consumer that set a
  token on a nested element and relied on descendants not inheriting it
  (216-mono does not).
- **Brand palette:** eight base colors (`--brand-accent`, `--brand-accent-light`,
  `--brand-accent-deep`, `--brand-accent-text`, `--brand-text`,
  `--brand-text-muted`, `--brand-text-subtle`, `--brand-tint`). Every other
  color token now derives from them. Override these on `:root` to theme.
- **`@216digital/ui/palette`:** the palette as data (`PALETTE`, with labels,
  usage and defaults), `paletteOverrideCss()` to emit an override rule for
  changed values only, and `checkContrast()` / `CONTRAST_PAIRS` /
  `contrastRatio()` for the WCAG AA pairings the components render.
- The button hover shadow and the hero glow now derive from the palette
  instead of literal `rgba()` oranges, and the Footer's copyright bar uses
  `var(--dark-grey)` instead of a literal `#231f20`.
- `npm run check-palette` (in CI and before publish) fails if `palette.ts` and
  `tokens.css` disagree.

Known: at the defaults, the secondary button's label on its hover fill
(`--brand-accent-text` on `--brand-tint`) measures 4.14:1, below AA's 4.5:1.
It was the same in 0.1.0; `checkContrast()` reports it.

## 0.1.0

First release: a parity copy of 216-mono's `packages/ui` and the design-system
half of `app/globals.css`, as of 216-mono 6980c3e. Renders the same markup the
site renders today, given the props below.

Values a package can't know became props (the consumer passes today's values;
see `docs/site-cutover.md`):

- `ContactForm`: `endpoint` (was `NEXT_PUBLIC_CONTACT_API_URL` with a
  hardcoded fallback), `contactEmail`, `contactPhone` (optional),
  `organizationName`.
- `Header`: `logo: { src, alt }`.
- `Footer`: `logo: { src, alt }`, `trustSeal?: { href, src, alt, title? }`.
- `CategoryCloud`: `basePath` (was `/ideas/category/`).
- `ScanCta`: `formAction` no longer defaults to `/contact/`.

The skip-link, Puck-RichText (`.rich-text`) and WordPress-compat
(`.has-medium-font-size`) rules stay in the site.
