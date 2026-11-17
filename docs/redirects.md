# Legacy redirects

The previous site was a Next.js export without trailing slashes. Its pages were
reachable at both the extensionless and `.html` forms, so old links and search
results may use either. The Astro site keeps those URLs working.

## Mapping

| Legacy URL                | Destination | Handling               |
| ------------------------- | ----------- | ---------------------- |
| `/about`                  | `/about/`   | Resolves directly      |
| `/about/`                 | `/about/`   | Real page              |
| `/about.html`             | `/about/`   | `public/about.html`    |
| `/about/dev`              | `/journey/` | Astro `redirects`      |
| `/about/dev.html`         | `/journey/` | `public/about/dev.html` |
| `/about/biomedicine`      | `/journey/` | Astro `redirects`      |
| `/about/biomedicine.html` | `/journey/` | `public/about/biomedicine.html` |

`/about` needs no redirect: GitHub Pages resolves `about/index.html` for it.
The old `/about/dev` and `/about/biomedicine` sections now live in the journey
timeline.

## How it works

GitHub Pages cannot send server-side 301s. Each redirect is a static HTML page
with:

- a `<meta http-equiv="refresh">` pointing at the new URL;
- a canonical link to the destination;
- `noindex`, so the redirect page is not indexed;
- a visible fallback link for clients that ignore meta refresh.

Extensionless routes are declared in `astro.config.ts`; Astro generates the
redirect pages at build time. The `.html` routes are files in `public/`, because
Astro would otherwise emit a `<path>.html/` directory that does not answer the
legacy URL.

## Verifying

```bash
npm run build
npm run check:redirects
```

`check:redirects` fails if a redirect file is missing, points at the wrong
destination, loses its canonical/noindex tags, or targets a page that was not
built. CI runs it after `build`.
