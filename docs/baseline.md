# Baseline — current site before the Astro refactor

Recorded **2026-11-16T16:10Z** from `main` at commit **8f46497**.

| Item                | Value                                             |
| ------------------- | ------------------------------------------------- |
| Rollback tag        | `pre-astro` (annotated, pushed to `origin`)       |
| Refactor branch     | `refactor/astro` (branched from `pre-astro`)      |
| Production build    | branch `gh-pages` at **4212ed7**                  |
| GitHub Pages source | `gh-pages` branch, `/` root, `build_type: legacy` |
| Live URL            | <https://pedromarquetti.github.io/>               |

This file is the reference point for every before/after comparison. If a number
here disagrees with a later measurement, the later measurement wins — update
this file rather than bending the goal.

---

## 1. Payload on `/`

Assets referenced by the server response for `/`, totaled with `curl`:

| Metric                                        | Value                         |
| --------------------------------------------- | ----------------------------- |
| Files referenced (JS + CSS + manifests)       | 11                            |
| Uncompressed bytes                            | **435,652 B**                 |
| Transferred with `Accept-Encoding: gzip`      | **138,846 B**                 |
| HTML document                                 | 1,531 B                       |
| Legacy polyfills (`polyfills-*.js`)           | 91,434 B raw / 31,384 B gzip  |
| Largest single file (`framework-*.js`, React) | 140,930 B raw / 45,751 B gzip |

Breakdown:

```
140930    45751  framework-4556c45dd113b893.js
105176    29009  main-35f06ba0f7da9325.js
 89575    28602  pages/_app-8f2f67c34f59a657.js
  943      556   pages/index-bdff608ebb84d809.js
 91434    31384  polyfills-5cd94c89d3acac5f.js
  3319     1648  webpack-672c3485e8bc6d17.js
  3192     1160  css/0a41ad6fc69344f5.css
  216      216   css/0c835ca23c4458e4.css
   698      351   _buildManifest.js
    92      92    _middlewareManifest.js
    77      77    _ssgManifest.js
```

Command used:

```bash
for a in $(grep -o '/_next/static/[^"]*' live-home.html | sort -u); do
  curl -sS -o /dev/null -w '%{size_download} ' "https://pedromarquetti.github.io$a"
  curl -sS -H 'Accept-Encoding: gzip' -o /dev/null -w '%{size_download}\n' "https://pedromarquetti.github.io$a"
done
```

## 2. What the server actually returns

`docs/baseline/live-home.html` is the complete response for `/`:

- `<body>` contains only `<div id="__next"></div>` plus `__NEXT_DATA__`.
- `<html>` has **no `lang` attribute**.
- No headings, links, images, or text in the document. Everything below is
  rendered by React after ~139 KB (gzip) of JavaScript executes.

## 3. Deep-link behavior (corrects an earlier assumption)

Next.js was exported with `next export` and no `trailingSlash` setting, so the
build writes `about.html`, not `about/index.html`. GitHub Pages therefore serves
some URLs and 404s others:

| URL                   | Status  | Note                               |
| --------------------- | ------- | ---------------------------------- |
| `/`                   | 200     | blank body until hydration         |
| `/index.html`         | 200     | same page                          |
| `/about`              | 200     | GitHub Pages resolves `about.html` |
| `/about.html`         | 200     | real file                          |
| `/about/`             | **404** | no `about/index.html` exists       |
| `/about/dev`          | 200     | resolves `about/dev.html`          |
| `/about/dev/`         | **404** | trailing slash                     |
| `/about/biomedicine`  | 200     | resolves `about/biomedicine.html`  |
| `/about/biomedicine/` | **404** | trailing slash                     |

The old plan listed `/about/dev/` and `/about/biomedicine/` as live URLs; they
were never live with a trailing slash. **The redirects must cover both the
extensionless and `.html` forms**, because those are the URLs that actually
worked and may be linked or indexed.

Client-side `<Link>` navigation hides this in normal browsing: links work
because React Router changes the URL in place, but a reload, a shared link, or a
crawler hit on `/about/` gets a 404.

## 4. Lighthouse and axe

Lighthouse 12, Chromium headless, throttled mobile and desktop presets.

| Page     | Device  | Perf | A11y   | Best practices | SEO |
| -------- | ------- | ---- | ------ | -------------- | --- |
| `/`      | mobile  | 100  | **95** | 100            | 100 |
| `/`      | desktop | 100  | **95** | 100            | 100 |
| `/about` | mobile  | 100  | **95** | 100            | 100 |
| `/about` | desktop | 100  | **95** | 100            | 100 |

The only failing accessibility audit is `html-has-lang` (score 0). Nothing else
failed.

**These scores are not a quality signal.** Performance and SEO score 100 because
the audited document is empty: there is no content to paint, no images, no
layout, and almost nothing for a crawler to read. The scores will drop when real
content lands, and that is expected. Keep them as a floor for the new site, not
as proof the current site is good.

## 5. Screenshots

Captured with Chromium headless at a 900 px viewport, after an 8 s virtual time
budget so React could hydrate. Converted to WebP (quality 82) to keep the repo
small.

| File                          | Viewport | Page     |
| ----------------------------- | -------- | -------- |
| `screenshots/320-home.webp`   | 320 px   | `/`      |
| `screenshots/320-about.webp`  | 320 px   | `/about` |
| `screenshots/768-home.webp`   | 768 px   | `/`      |
| `screenshots/768-about.webp`  | 768 px   | `/about` |
| `screenshots/1440-home.webp`  | 1440 px  | `/`      |
| `screenshots/1440-about.webp` | 1440 px  | `/about` |

Observed problems visible in the captures:

- No mobile layout: the 320 px view is the desktop stack, and the theme switch
  stays pinned at the top.
- The footer becomes a four-column icon strip that is hard to scan.
- There is no active-page indication, no skip link, and no visible focus style.
- The theme toggle's visible label ("Theme Switch") is not localized and not a
  state label.

## 6. Project links (checked 2026-11-16)

| Link                                                  | Status  | Effective URL                           |
| ----------------------------------------------------- | ------- | --------------------------------------- |
| <https://pedromarquetti.github.io/>                   | 200     | —                                       |
| <https://pedromarquetti.github.io/react-notes-app/>   | 200     | —                                       |
| <https://pedromarquetti.github.io/calculator/>        | 200     | —                                       |
| <https://pedromarquetti.github.io/NFSe/>              | 200     | —                                       |
| <https://pedromarquetti.github.io/meu-preco/>         | 200     | API documentation                       |
| <https://pedromarquetti.github.io/meu-preco-flutter/> | **301** | → <https://meupreco.phlm.dev.br/> (200) |

**Correction to the plan:** the Meu Preço Flutter app no longer lives on GitHub
Pages. The Pages URL permanently redirects to the app's own domain
(`https://meupreco.phlm.dev.br/`, which serves 200). The redirect first points
at `http://`, so link the `https://` URL directly to avoid a mixed-content hop.
This needs your approval before it is published as a demo link.

## 7. Rollback

The current site can be restored at any time while `gh-pages` is intact.

**Fastest (restore the exact live files):**

```bash
git push origin 4212ed7:gh-pages --force
```

**Restore the source:**

```bash
git switch main
git reset --hard pre-astro
git push origin main --force-with-lease
```

**Revert the cutover instead of rewriting history (preferred after launch):**

```bash
git switch main
git revert -m 1 <cutover-merge-commit>
git push origin main
```

The `pre-astro` tag is permanent. Keep the `gh-pages` branch for at least 30
days after cutover, per the plan.

**Cutover requirement discovered during this baseline:** GitHub Pages currently
builds from the `gh-pages` branch with `build_type: legacy`. Publishing through
`actions/deploy-pages` requires changing the Pages source to **GitHub Actions**
(Settings → Pages → Build and deployment → Source). That change is manual (or
`gh api -X PUT repos/OWNER/REPO/pages -f build_type=workflow`) and must be done
in the same window as the first Astro deploy, or the new workflow will fail with
a "Pages site is not configured for Actions" error.

## 8. Environment used

| Tool       | Version                  |
| ---------- | ------------------------ |
| Node.js    | 24.9.0                   |
| npm        | 11.6.0                   |
| Lighthouse | 12.x via `npx`           |
| Chromium   | `/usr/bin/chromium`      |
| git        | current `main` = 8f46497 |
