# Adding a project

Projects are content entries. Adding one does not require touching components:
create a folder, write `index.json`, and optionally add images beside it.

## Folder layout

```text
src/content/projects/
  meu-preco-app/
    index.json
    cover.webp
    screenshot-1.webp
  nfse/
    index.json
```

The folder name is the URL slug. It must be kebab-case (`a-z`, `0-9`, single
hyphens) and becomes:

- `/project/<slug>/` in English
- `/pt-br/project/<slug>/` in Portuguese

Renaming a folder changes a public URL, so treat slugs as permanent once
published.

## Required fields

| Field         | Type                        | Notes                                      |
| ------------- | --------------------------- | ------------------------------------------ |
| `name`        | string                      | Shown as the card and page heading         |
| `tagline`     | `{ en, "pt-br" }`           | Card text; 90 characters or fewer per locale |
| `description` | `{ en, "pt-br" }`           | 2–3 sentence summary on the detail page    |
| `details`     | `{ en: string[], "pt-br": string[] }` | 2–4 paragraphs per locale        |
| `year`        | integer (2000–2100)         | Displayed in the project facts             |
| `stack`       | string[]                    | At least one technology                    |
| `repoUrl`     | `https://` URL              | Source code link                           |
| `status`      | `active`, `maintained`, `archived`, `learning` | Status badge            |

## Optional fields

| Field        | Type                         | Notes                                  |
| ------------ | ---------------------------- | -------------------------------------- |
| `order`      | integer                      | Lower numbers appear first (default 0) |
| `liveUrl`    | `https://` URL               | Deployed project or documentation      |
| `liveKind`   | `app`, `demo`, `docs`        | Label for `liveUrl` (default `demo`)   |
| `docsUrl`    | `https://` URL               | Separate documentation link            |
| `featured`   | boolean                      | Shows the project on the home page     |
| `highlights` | `{ en: string[], "pt-br": string[] }` | Short bullet list on the detail page |
| `images`     | array of image objects       | Gallery; omitted when empty            |

## Adding images

1. Put the file in the project folder, next to `index.json`.
2. Reference it with a relative path: `"./cover.webp"`.
3. Give it alt text in both languages. Captions are optional.

```json
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
]
```

Guidelines:

- Use current screenshots, not mockups or stock images.
- Prefer WebP or AVIF, 1600 px wide or less.
- Astro optimises each image at build time, adds width and height, and
  lazy-loads it.
- The first image is not special: the gallery renders every entry in order.
- A project with no `images` array simply has no gallery section.

## Writing copy

- Write both languages; neither may fall back to the other.
- Portuguese should read naturally, not as a literal translation.
- Describe the problem, what was built, and what is technically interesting.
- Do not invent users, metrics, or outcomes.
- `details` is required. Every project needs at least one paragraph per locale.

## Verify

```bash
npm run check:content   # structure, slugs, empty or placeholder text
npm run check           # TypeScript and Astro diagnostics
npm run build           # generates the list, detail, and locale pages
npm run check:links     # internal links across the built site
```

The content check also enforces that every project lives at
`src/content/projects/<slug>/index.json` and that the slug is kebab-case.
