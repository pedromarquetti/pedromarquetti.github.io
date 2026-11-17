# Changelog

All notable changes to this site. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[semantic versioning](https://semver.org/).

## [2.0.0] — 2026-11-17

Full rewrite of the portfolio from Next.js (static export on the `gh-pages`
branch) to Astro, plus a new domain and an artifact-based deploy.

### Added

- Astro 7 + TypeScript project with static output, file-based routing, and no
  client framework or hydration.
- Bilingual routing (`en` at `/`, `pt-br` at `/pt-br/`) driven by typed JSON
  dictionaries in `src/i18n/`, with per-page `hreflang` and `x-default`.
- Projects showcase backed by a folder-per-project content collection
  (`src/content/projects/<slug>/index.json`), Zod-validated, with catalog,
  detail pages, responsive gallery images, and typed `InlineNode` prose.
- Journey timeline, About page, and rebuilt home page with contact section.
- Light / dark / system theme toggle as the only JavaScript (~2 KB inline).
- Legacy Next.js URLs preserved as static redirects; `scripts/check-redirects.mjs`
  validates them.
- Sitemap (`sitemap-index.xml`), `robots.txt`, per-locale Open Graph images, and
  `Person` JSON-LD.
- Validators for content parity (`check:content`), SEO (`check:seo`), internal
  links (`check:links`), and Lighthouse budgets (`check:lighthouse`).
- GitHub Actions deploy workflow publishing `dist/` as a Pages artifact on
  `phlm.dev.br`.
- `public/CNAME` so the custom domain ships with the artifact.
- Documentation: `docs/deployment.md`, `docs/performance.md`, plus the existing
  i18n, projects, redirects, and project-detail notes.

### Changed

- Site URL moved from `https://pedromarquetti.github.io` to
  `https://phlm.dev.br`; canonicals, Open Graph, JSON-LD, sitemap, and
  `robots.txt` all derive from `site` in `astro.config.ts`.
- GitHub Pages publishing switched from the `gh-pages` branch to GitHub Actions,
  gated on a successful CI run.
- README rewritten around Astro, the check scripts, content authoring, and
  deployment.
- Accessibility and performance verified: axe 0 violations, Lighthouse
  100/100/100/100 on sampled pages, no external JS, 3.6 KB gzip CSS.

### Removed

- Next.js, React, and the old build/export configuration.
- Vercel configuration and the `.vercel` ignore entry.
- Placeholder views and copy from the pre-release scaffold.

### Rollback

The `pre-astro` tag and the `gh-pages` branch still hold the previous
production build. See `docs/deployment.md` for the procedure.
