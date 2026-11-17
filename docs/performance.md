# Performance, accessibility, and SEO

Phase 7 turns the budgets in the plan into numbers the build and CI enforce.

## Budgets and measured values

| Budget         | Limit      | Measured                                             |
| -------------- | ---------- | ---------------------------------------------------- |
| First-load JS  | ≤ 5 KB gz  | **0 KB** — no external script ships                  |
| Inline JS      | ≤ 1 KB gz  | **0.9 KB gz** (theme init + toggle, 2.0 KB raw)      |
| CSS            | ≤ 10 KB gz | **3.6 KB gz** (16.5 KB raw)                          |
| HTML           | ≤ 30 KB    | **26.3 KB** max (PT projects, 3.9 KB gz)             |
| Card image     | ≤ 60 KB    | not applicable — cards are text-only                 |
| Gallery image  | sane size  | **6.3–31.5 KB** per WebP variant                     |
| Lighthouse     | ≥ 98       | **100/100/100/100** on all sampled pages             |

The only JavaScript is the inline theme script in `BaseLayout.astro` (applies the
stored theme before paint) and the toggle handler in `ThemeToggle.astro`. There
are no `.js` files in `dist/`, no hydration directives, and no icon runtime.

## Images

- Project images live beside their content entry
  (`src/content/projects/<slug>/`) and are resolved through the content
  collection schema, so Astro can optimize them at build time.
- `ProjectGallery.astro` renders them with `<Image>`: explicit `width`/`height`
  from the source, `loading="lazy"`, `decoding="async"`, translated `alt`, and a
  responsive `srcset` (`480/768/1024/1600w`) with
  `sizes="(min-width: 72rem) 1100px, 100vw"`.
- Source files keep their full resolution; the build emits WebP variants and
  the browser downloads the one it needs.
- Cards do not carry images today. If one is added, keep the emitted file under
  60 KB and set translated `alt` text.

## CSS

`src/styles/global.css` plus `tokens.css` compile to one stylesheet. An audit of
every class selector in `global.css` against the built HTML found one selector
with no current match: `.project-highlights li`. It styles the optional
`highlights` list that `ProjectDetail.astro` renders when a project defines that
field, so it stays. Delete it only if the schema field is removed too.

## Accessibility

`axe-core` (4.14) reports **0 violations** on `/`, `/about/`, `/projects/`,
`/journey/`, `/project/send-rs/`, and the four `/pt-br/` equivalents, plus
`/404.html`.

```bash
npm run build
python3 -m http.server 4327 --bind 127.0.0.1 -d dist
npx @axe-core/cli --chromedriver-path "$(command -v chromedriver)" \
  http://127.0.0.1:4327/about/
```

The manual matrix from the plan:

| Check          | Result                                                                 |
| -------------- | ---------------------------------------------------------------------- |
| Keyboard only  | Skip link first, then header, mobile `<details>` nav, content, footer   |
| No JS          | All content and navigation are static HTML; only the theme toggle stops |
| 320 px         | Single column, no horizontal scroll, 44 px controls                     |
| Zoom 200%      | Reflow confirmed at 320 CSS px                                          |
| Themes         | Light/dark/system; contrast holds in both                               |
| Reduced motion | `prefers-reduced-motion` disables transitions and smooth scrolling      |
| Forced colors  | Borders and focus outlines fall back to system colors                   |

## SEO

- `@astrojs/sitemap` is configured with the `en` / `pt-BR` i18n mapping and a
  filter that drops the legacy redirect routes. The build writes
  `sitemap-index.xml` and `sitemap-0.xml` (32 URLs: 16 per locale).
- `public/robots.txt` allows everything and points to the sitemap index.
- `Seo.astro` emits, per locale: canonical URL, `hreflang` alternates plus
  `x-default`, Open Graph and Twitter tags with the locale's 1200×630 image, and
  a `Person` JSON-LD block (`name`, localized `jobTitle`, `url`, `sameAs`,
  `knowsLanguage`).

`npm run check:seo` verifies the built output: unique titles per locale,
descriptions, canonical vs. route, all three alternates, OG URL/image/size,
parseable JSON-LD, sitemap coverage, redirect exclusion, and `robots.txt`.

## Lighthouse CI

`.lighthouserc.json` runs Lighthouse against `dist/` for seven representative
URLs (both locales, all page types, one project detail). It fails the build if
any category drops below **0.98**, CLS exceeds **0.05**, or total blocking time
exceeds **200 ms**.

```bash
npm run build
npm run check:lighthouse   # lhci autorun
```

CI runs `build`, `check:redirects`, `check:seo`, `check:links`, and
`check:lighthouse` in that order, so budgets are enforced on every push.
Reports land in `.lighthouseci/` (git-ignored).
