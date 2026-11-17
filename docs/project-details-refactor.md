# Project detail pages — refactor plan

**Status:** Implemented · **Date:** 2026-11-17
**Scope:** clickable project cards, dynamic detail pages, per-project image galleries
**Starting point:** the current projects showcase (staged, not yet committed)

## Goal

Turn the projects section into a browse → detail flow:

- A project card is one large link.
- The card shows only the project name, tagline, and a subtle “open” affordance.
- The detail page lives at `/project/<slug>/` and `/pt-br/project/<slug>/`.
- The detail page carries the full description, metadata, external links, and an
  optional image gallery.
- Adding a project or an image requires content changes only; no component edits.

No client-side JavaScript is added.

## Decisions

1. **Card content:** project name, tagline, and an arrow to the detail page.
   Status, year, stack, and description stay on the detail page.
2. **External links:** “Live app”, “Live demo”, “API docs”, and “Source code”
   stay on the card (user decision). The title link is stretched over the card
   with a pseudo-element, so the card is clickable without nesting an anchor
   around the external links.
3. **Slug:** the project folder name is the URL slug. Existing entry names stay
   unchanged (`meu-preco-app`, `nfse`, …), so no public detail URL breaks later.
4. **Images:** one optional `images` array per project. The first image is not a
   separate “cover”; the gallery renders all images. No placeholder images ship.
5. **Long copy:** structured paragraphs, not Markdown/MDX. This keeps the
   bilingual JSON model and avoids another dependency.

## Target structure

```text
src/content/projects/
  meu-preco-app/
    index.json          # entry id / slug = "meu-preco-app"
    cover.webp          # optional
    screenshot-1.webp
  meu-preco-api/
    index.json
  ...
src/components/
  ProjectCard.astro     # title link + tagline + arrow + external links
  ProjectGallery.astro  # images, alt, captions
  ProjectLinks.astro    # live / docs / source links
  StatusBadge.astro     # shared by the detail page
src/lib/
  projects.ts           # projectHref(), getProjects(), path helpers
src/views/
  ProjectDetail.astro
src/pages/
  project/[slug].astro
  pt-br/project/[slug].astro
docs/
  projects.md           # how to add a project or image
```

## Data model

`src/content.config.ts` moves to the schema-function form so Astro can import
images:

```ts
const localizedParagraphs = z.object({
  en: z.array(z.string().min(1)).min(1),
  "pt-br": z.array(z.string().min(1)).min(1),
});

const projects = defineCollection({
  loader: glob({
    base: "./src/content/projects",
    pattern: "**/index.json",
  }),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(1),
      tagline: localized,
      description: localized, // 2–3 sentence summary
      details: localizedParagraphs, // 2–4 detail paragraphs
      images: z
        .array(
          z.object({
            src: image(), // relative to index.json, e.g. "./cover.webp"
            alt: localized,
            caption: localized.optional(),
          }),
        )
        .default([]),
      year: z.number().int(),
      order: z.number().int(),
      stack: z.array(z.string().min(1)).min(1),
      repoUrl: httpsUrl,
      liveUrl: httpsUrl.optional(),
      liveKind: z.enum(["app", "demo", "docs"]).default("demo"),
      docsUrl: httpsUrl.optional(),
      status: z.enum(["active", "maintained", "archived", "learning"]),
      featured: z.boolean().default(false),
      highlights: localizedList.optional(),
    }),
});
```

Notes:

- Astro 7 resolves `image()` paths relative to the entry file. A file at
  `src/content/projects/<slug>/cover.webp` is referenced as `"./cover.webp"`.
- The glob loader derives the entry id from the folder name for
  `<slug>/index.json`; this was verified against the installed Astro 7.4.12 in a
  scratch build.
- Remove the unused `image` and `imageAlt` fields. The new `images` array
  replaces them.
- `details` is required. All 12 entries receive English and Portuguese
  paragraphs before the detail route ships.

### Entry example

```json
{
  "name": "Meu Preço",
  "tagline": {
    "en": "Flutter app for checking supermarket prices from your own receipt history.",
    "pt-br": "Aplicativo Flutter para consultar preços de supermercado pelo seu histórico."
  },
  "description": {
    "en": "A mobile front end for the Meu Preço API, built with Flutter for Android.",
    "pt-br": "Um aplicativo móvel para a API Meu Preço, feito com Flutter para Android."
  },
  "details": {
    "en": [
      "The app receives a supermarket receipt and stores each line item.",
      "Product prices can then be compared over time before the next shopping trip."
    ],
    "pt-br": [
      "O aplicativo recebe uma nota fiscal de supermercado e guarda cada item.",
      "Depois, os preços podem ser comparados ao longo do tempo antes da próxima compra."
    ]
  },
  "images": [
    {
      "src": "./cover.webp",
      "alt": {
        "en": "Meu Preço app showing a product price history.",
        "pt-br": "Aplicativo Meu Preço mostrando o histórico de preços de um produto."
      },
      "caption": {
        "en": "Price history for a single product.",
        "pt-br": "Histórico de preços de um produto."
      }
    }
  ],
  "year": 2026,
  "order": 1,
  "stack": ["Dart", "Flutter"],
  "repoUrl": "https://github.com/pedromarquetti/meu-preco-flutter",
  "liveUrl": "https://meupreco.phlm.dev.br/",
  "liveKind": "app",
  "status": "active",
  "featured": true
}
```

## Routes

Two thin wrappers share one view:

```text
src/pages/project/[slug].astro
src/pages/pt-br/project/[slug].astro
```

```astro
---
export async function getStaticPaths() {
  const projects = await getProjects();

  return projects.map((project) => ({
    params: { slug: project.id },
    props: { project },
  }));
}

const { project } = Astro.props;
const locale = resolveLocale(Astro.currentLocale);
---

<ProjectDetail locale={locale} project={project} />
```

Add to `src/lib/projects.ts`:

```ts
export function projectHref(locale: Locale, project: Project): string {
  return localeLink(locale, `project/${project.id}`);
}
```

Both locales use the same slug, so the language switcher and `hreflang`
alternates work without special cases. `trailingSlash: "always"` already
produces `/project/<slug>/`.

### Navigation

`NavLinks.astro` currently marks “Projects” active only on `/projects/`. Extend
the check so `/project/<slug>/` also marks Projects as the current section:

```ts
const isProjects = path === "/projects/";
const active =
  currentPath === path ||
  (isProjects && currentPath.startsWith("/project/"));
```

## Card behaviour

`ProjectCard.astro` keeps the external links and adds a stretched title link to
the detail page. Nothing is nested.

```astro
<article class="project-card">
  <header class="project-card-header">
    <Heading class="project-card-title">
      <a href={projectHref(locale, project)}>
        {data.name}
        <span class="visually-hidden">
          &nbsp;— {t(locale, "projects.viewDetails")}
        </span>
      </a>
    </Heading>
    <span class="project-card-arrow" aria-hidden="true">
      <Icon name="arrow-right" class="icon" />
    </span>
  </header>

  <p class="project-card-tagline">{data.tagline[locale]}</p>

  <ProjectLinks project={project} locale={locale} />
</article>
```

Rules:

- `a::after` covers the card, so clicking anywhere outside the external links
  opens the detail page.
- `.project-links` gets `position: relative; z-index: 2` so its links stay
  clickable above the stretched overlay.
- The accessible name contains the project name and “view project details”; no
  `aria-label` overrides the visible text.
- The focus ring wraps the whole card; `:focus-within` mirrors the hover state.
- `prefers-reduced-motion` already disables transitions globally.
- Keyboard: the title opens the detail page; each external link keeps its own
  Tab stop.
- At 320 px the grid stays one column and the card has no horizontal overflow.

Remove these from the card: description, status badge, year, and stack. They
move to the detail page.

## Detail page

`src/views/ProjectDetail.astro` renders:

1. **Back link** to `/projects/` (localized).
2. **Hero**
   - `<h1>` project name
   - tagline as the lead paragraph
   - status badge, year, stack
   - `ProjectLinks`: live app/demo/API docs (primary) and source code
3. **Overview**
   - `description`
   - `details` paragraphs
   - `highlights` list when present
4. **Gallery**
   - rendered only when `images.length > 0`
   - `<figure>` per image, localized `alt`, optional `<figcaption>`
5. **Back link** to all projects at the end.

Suggested copy keys:

| Key                 | English              | Portuguese             |
| ------------------- | -------------------- | ---------------------- |
| `projects.viewDetails` | View project details | Ver detalhes do projeto |
| `project.back`      | Back to projects     | Voltar aos projetos    |
| `project.overview`  | Overview             | Visão geral            |
| `project.highlights`| Highlights           | Destaques              |
| `project.gallery`   | Screenshots          | Capturas de tela       |
| `project.links`     | Project links        | Links do projeto       |
| `page.project.title`| `{name} — Pedro Marquetti` | `{name} — Pedro Marquetti` |

`page.project.title` is interpolated with the project name. The meta
description is the localized tagline (short and already 90 characters or less).

### Image rendering

```astro
<Image
  src={image.src}
  alt={image.alt[locale]}
  loading="lazy"
  decoding="async"
/>
```

- Astro emits optimized WebP output and infers width/height, preventing layout
  shift.
- The gallery uses a responsive grid:
  `repeat(auto-fit, minmax(min(100%, 20rem), 1fr))`.
- Recommended source size: 1600 px wide or less; WebP/AVIF preferred.
- Every image requires localized alt text in the schema; captions are optional.
- Adding an image means dropping a file next to `index.json` and adding one
  object to `images`. No component changes.

## Content migration

Use `git mv` so file history follows the move:

```text
src/content/projects/calculator.json
→ src/content/projects/calculator/index.json
```

Do this for all 12 projects. The slug stays the same, so `order`, links, and
featured state are unaffected.

Then write `details` for each project in both locales:

- 2–4 paragraphs per language.
- Problem → what was built → what is technically interesting.
- No invented users, metrics, or outcomes.
- Natural Brazilian Portuguese, not a literal translation.
- Review checkpoint before the detail page is considered complete.

Add images only where a real, current screenshot exists. If no image exists, the
gallery is omitted; no empty boxes or stock images.

## Validation and scripts

- `scripts/check-content.mjs`
  - still scans every `index.json`;
  - add a rule that project files live at
    `src/content/projects/<slug>/index.json`;
  - enforce a kebab-case slug (`^[a-z0-9]+(?:-[a-z0-9]+)*$`);
  - keep the existing empty/placeholder check for the new paragraphs and
    captions.
- `npm run check:links` automatically covers the 24 new internal detail links.
- Build expectation: **33 pages** (9 existing + 12 × 2 locales).

## Phases

| Phase | Work | Files | Done when |
| ----- | ---- | ----- | --------- |
| 0 | Freeze the current showcase | — | Current projects work is committed; working tree is clean |
| 1 | Content schema and folder migration | `content.config.ts`, `src/content/projects/**/index.json`, `check-content.mjs` | 12 entries load, list/projects pages still build, no detail routes yet |
| 2 | Detail routes and view skeleton | `ProjectDetail.astro`, `lib/projects.ts`, both `[slug].astro` wrappers, `StatusBadge.astro`, `ProjectLinks.astro`, i18n keys, `NavLinks.astro` | 33 pages build; canonical/hreflang and language switching work; Projects nav stays active on detail pages |
| 3 | Clickable minimal card | `ProjectCard.astro`, `global.css`, `Icon.astro` | Title link covers the card; name + tagline + arrow; external links stay usable; keyboard and 320 px pass |
| 4 | Gallery and real images | `ProjectGallery.astro`, `global.css`, project image files, `docs/projects.md` | Gallery renders real screenshots with localized alt/captions; omitted when empty; adding an image needs content changes only |
| 5 | Content review and QA | all changed files | Copy approved in both locales; all checks and Lighthouse pass |

Phase 2 depends on Phase 1 because `details` is required. The card link can be
enabled in Phase 3, once the routes exist.

## Acceptance criteria

- [x] Each card title links to `/project/<slug>/` or
      `/pt-br/project/<slug>/`, and external links stay clickable above the
      stretched overlay.
- [x] Cards display only project name, tagline, arrow, and external links.
- [x] No nested interactive elements anywhere in a card.
- [x] 24 detail pages exist, with correct titles, descriptions, canonical URLs,
      and `hreflang` alternates.
- [x] Detail pages show status, year, stack, live/docs/source links, description,
      and details; highlights and the gallery render when data is present.
- [x] Portuguese detail pages contain no untranslated interface text.
- [x] Every image has localized alt text; captions are localized when present
      (enforced by the schema and verified with a temporary image).
- [x] Images are optimized, lazy-loaded, and have inferred dimensions.
- [x] Cards and detail pages are keyboard accessible and reflow to one column at
      320 px, with no horizontal scroll.
- [x] `npm run check`, `check:content`, `format:check`, `build`, and `check:links`
      pass.
- [x] Lighthouse on a detail page: 100 performance, 100 accessibility,
      100 best practices, 100 SEO. The projects list and a pt-BR detail page
      also score 100 across all four categories.
- [x] Unknown project slugs fall through to the static 404 page.
- [x] No client JavaScript is added.

## Risks and mitigations

| Risk | Mitigation |
| ---- | ---------- |
| `image()` with JSON entries | Validated with a scratch Astro 7 build: folder entry, image import, optimized WebP, and dynamic route all worked |
| Nested links in clickable cards | The stretched title link covers the card; external links sit above it in their own stacking layer |
| Folder move loses Git history | Use `git mv` for every entry |
| Slug drift breaks URLs | Keep folder names equal to the current entry ids; `check-content` enforces the slug format |
| Large images slow the build | Prefer WebP/AVIF under 1600 px; keep screenshots purposeful |
| Copy becomes padded or invented | Require the review checkpoint; prohibit metrics and user claims that cannot be verified |
| Card loses useful metadata | All metadata remains visible on the detail page, one click away |

## Out of scope

- Markdown/MDX long-form content.
- A CMS, database, or runtime GitHub API.
- Filtering, search, tags, or sorting controls.
- Previous/next project navigation.
- Per-project Open Graph images (can be added later from `images[0]`).
- Deployment or publishing.
