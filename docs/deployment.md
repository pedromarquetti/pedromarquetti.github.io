# Deployment

The site is a fully static Astro build published to GitHub Pages by a GitHub
Actions workflow. There is no server, no runtime, and no analytics.

## Live URLs

| URL                       | Role                                        |
| ------------------------- | ------------------------------------------- |
| <https://phlm.dev.br>     | Primary. Canonical, sitemap, and OG use it. |
| <https://www.phlm.dev.br> | Alias. Serves the same content.             |

`public/CNAME` contains `phlm.dev.br`, so the domain travels with the artifact
instead of living only in repository settings.

## How a deploy happens

1. A push to `main` runs **CI** (`.github/workflows/ci.yml`): format, `astro
check`, content parity, build, redirects, SEO, internal links, Lighthouse
   budgets.
2. When that run succeeds, **Deploy to GitHub Pages**
   (`.github/workflows/deploy.yml`) starts. It can also be started manually with
   `workflow_dispatch`.
3. `withastro/action@v6` installs dependencies with `npm ci`, runs
   `npm run build`, and uploads `dist/` as the Pages artifact.
4. `actions/deploy-pages@v5` publishes the artifact to the `github-pages`
   environment.

A failed CI run does not deploy. Deploys run one at a time (`concurrency: pages`)
and are not cancelled mid-flight.

## One-time repository settings

In **Settings → Pages**:

- **Source:** GitHub Actions (not “Deploy from a branch”).
- **Custom domain:** `phlm.dev.br`.
- **Enforce HTTPS:** on.

The old setup published the `gh-pages` branch; that branch is kept only for
rollback.

## DNS

Already configured for this domain. For reference, GitHub Pages needs:

| Name                    | Type  | Value                                                    |
| ----------------------- | ----- | -------------------------------------------------------- |
| `phlm.dev.br`           | A     | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| `phlm.dev.br`           | AAAA  | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
| `www.phlm.dev.br`       | CNAME | `pedromarquetti.github.io`                               |

Verify with `dig +short A phlm.dev.br` and
`dig +short www.phlm.dev.br`. Do not use a wildcard record, and do not leave
extra A/AAAA records: they break certificate provisioning and cause intermittent
404s.

GitHub issues the certificate for the custom domain after DNS resolves and the
domain is saved in settings. Until then, `https://phlm.dev.br` fails while
`http://` may already answer.

## Canonical host

`astro.config.ts` sets `site: "https://phlm.dev.br"`. Every canonical link,
`hreflang` alternate, Open Graph URL, JSON-LD `url`, sitemap entry, and
`robots.txt` sitemap reference derives from it, so the apex is the only URL
search engines index. `www` is an alias and is not canonicalized separately.

`npm run check:seo` fails the build if `dist/CNAME`, the canonical URLs, or the
sitemap disagree with `https://phlm.dev.br`.

## Project demos

The project detail pages link to demos hosted by other repositories
(`https://pedromarquetti.github.io/<repo>/`). Those repos deploy independently
and keep working: once the custom domain is set on the user site, GitHub serves
project sites at `https://phlm.dev.br/<repo>/` and redirects the old
`pedromarquetti.github.io/<repo>/` URLs there. Leave those links alone unless a
demo moves to its own domain. No project repo name collides with a route this
site owns (`/`, `/about/`, `/projects/`, `/journey/`, `/project/<slug>/`,
`/pt-br/...`).

## Verifying a deploy

```bash
for path in / /pt-br/ /projects/ /pt-br/projects/ /journey/ /pt-br/journey/ \
  /about/ /pt-br/about/ /project/send-rs/; do
  curl -s -o /dev/null -w "%{http_code} %{url_effective}\n" "https://phlm.dev.br$path"
done

# Legacy redirects (meta refresh pages, so follow them)
curl -sL -o /dev/null -w "%{http_code} %{url_effective}\n" https://phlm.dev.br/about/dev/
curl -sL -o /dev/null -w "%{http_code} %{url_effective}\n" https://phlm.dev.br/about/biomedicine.html

# Asset and 404 sanity
curl -s -o /dev/null -w "%{http_code}\n" https://phlm.dev.br/sitemap-index.xml
curl -s -o /dev/null -w "%{http_code}\n" https://phlm.dev.br/robots.txt
curl -s -o /dev/null -w "%{http_code}\n" https://phlm.dev.br/does-not-exist/
```

All pages should return 200 (404 for the last one), both hosts should serve the
site, and no request should be blocked as mixed content.

## Rollback

1. Revert the merge commit on `main`, or restore the `pre-astro` tag to a branch
   and merge it.
2. If the artifact deploy itself is broken, set **Pages → Source** back to
   “Deploy from a branch” → `gh-pages`. That branch still holds the previous
   production build.
3. Re-run CI before merging the fix forward.

The `gh-pages` branch and the `pre-astro` tag are kept for 30 days after the
cutover, then the branch can be deleted.
