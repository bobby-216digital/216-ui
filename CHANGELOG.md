# Changelog

Every change is semver from the site's point of view: a changed prop, class
name or default is a breaking change for 216-mono. Stay on 0.x until the site
has run on the package for a while and the sister brand has consumed it (in
0.x, a breaking change bumps the minor version).

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
