# Pedro Marquetti — portfolio

Bilingual (English / Brazilian Portuguese) portfolio for Pedro Marquetti. Built
with [Astro 7](https://astro.build) and TypeScript, prerendered to static HTML
with no client framework, no hydration, and no analytics.

**Live:** <https://phlm.dev.br> — `www.phlm.dev.br` is an alias; canonical URLs
always point at the apex.

## Stack

- Astro 7 (static output, file-based routing)
- TypeScript (strict) with typed content collections and Zod schemas
- Typed JSON dictionaries for UI strings (`en`, `pt-br`)
- Plain CSS with design tokens; system fonts
- About 2 KB of inline JavaScript total, only for the theme toggle
- GitHub Actions for CI and GitHub Pages deployment

## Requirements

- Node.js 24 (see `.nvmrc`)
- npm

## Getting started

```bash
npm ci
npm run dev        # http://localhost:4321
npm run build      # writes dist/
npm run preview    # serves dist/
```

To run the dev server in the background (useful in scripts), use
`npm run dev -- --background`; manage it with `npx astro dev status`,
`npx astro dev logs`, and `npx astro dev stop`.

## Scripts

| Script                  | What it does                                                    |
| ----------------------- | --------------------------------------------------------------- |
| `npm run dev`           | Start the dev server                                            |
| `npm run build`         | Build the static site into `dist/`                              |
| `npm run preview`       | Preview the production build                                    |
| `npm run check`         | Astro + TypeScript diagnostics                                  |
| `npm run check:content` | Translation parity, project schema, placeholder scan            |
| `npm run check:redirects` | Legacy redirect files, canonical, `noindex`, targets          |
| `npm run check:seo`     | Canonicals, `hreflang`, OG, JSON-LD, sitemap, `CNAME`, robots   |
| `npm run check:links`   | Every internal `href`/`src` in `dist/`                          |
| `npm run check:lighthouse` | Lighthouse CI budgets (`.lighthouserc.json`)                 |
| `npm run format`        | Format with Prettier                                            |

Most `check:*` scripts read `dist/`, so run `npm run build` first.

## Structure

```text
.github/workflows/   ci.yml (checks) and deploy.yml (Pages)
public/              files copied as-is: CNAME, robots.txt, OG images,
                     legacy .html redirects
scripts/             content, link, redirect, and SEO validators
src/
  components/        Nav, cards, gallery, contact links, SEO head
  content/projects/  one folder per project: <slug>/index.json + images
  i18n/              typed dictionaries and locale helpers
  layouts/           BaseLayout (head, theme script, header, footer)
  lib/               project queries, journey and about copy, site constants
  pages/             route entry points for both locales
  styles/            tokens and the single global stylesheet
  views/             page components (Home, Projects, Journey, About, ...)
```

## Content

- **Projects:** `docs/projects.md` — folder layout, schema, images, and how the
  card and detail page are built.
- **Project details refactor:** `docs/project-details-refactor.md` — rationale
  and layout.
- **Journey:** copy lives in `src/lib/journey.ts` as typed steps; paragraphs are
  strings or arrays of inline nodes when they contain links.
- **About:** copy lives in `src/lib/about.ts`; contact links live in
  `src/lib/site.ts`.
- **UI strings:** `src/i18n/en.json` and `src/i18n/pt-br.json` must have the same
  keys (`npm run check:content` enforces it). See `docs/i18n.md`.
- **Legacy URLs:** `docs/redirects.md` lists the old Next.js routes and how they
  redirect.

## Quality gates

CI runs on every push and pull request: formatting, Astro/TypeScript checks,
content parity, build, redirects, SEO, internal links, and Lighthouse budgets
(≥ 0.98 in every category, CLS ≤ 0.05, TBT ≤ 200 ms). A failing check blocks the
merge and therefore the deploy.

See `docs/performance.md` for the measured budgets and the accessibility audit.

## Deployment

Publishing is artifact-based: CI runs first, then `deploy.yml` builds with
`withastro/action` and publishes through `actions/deploy-pages`. The custom
domain ships in `public/CNAME`.

Full details — Pages settings, DNS records, certificate provisioning, post-deploy
checks, and rollback — are in `docs/deployment.md`.

## Documentation

| File                             | Contents                                  |
| -------------------------------- | ----------------------------------------- |
| `docs/baseline.md`               | Pre-Astro site baseline (historical)      |
| `docs/i18n.md`                   | Locale routing, dictionaries, adding a language |
| `docs/projects.md`               | Adding projects and images                |
| `docs/project-details-refactor.md` | Project card and detail page design     |
| `docs/redirects.md`              | Legacy URL mapping and static redirects   |
| `docs/performance.md`            | Budgets, accessibility, Lighthouse CI     |
| `docs/deployment.md`             | GitHub Pages, DNS, verification, rollback |
