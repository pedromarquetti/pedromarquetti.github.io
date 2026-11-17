import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://phlm.dev.br",
  output: "static",
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "en",
        locales: { en: "en", "pt-br": "pt-BR" },
      },
      // The legacy redirect routes are `noindex` pages, not destinations.
      filter: (page) =>
        !page.includes("/about/dev/") && !page.includes("/about/biomedicine/"),
    }),
  ],
  i18n: {
    locales: ["en", "pt-br"],
    defaultLocale: "en",
    routing: { prefixDefaultLocale: false },
  },
  build: { format: "directory" },
  trailingSlash: "always",
  // The old Next.js site was exported without trailing slashes. These
  // extensionless routes were reachable and may still be linked. The `.html`
  // forms are static files in public/ because Astro would otherwise emit them
  // as `<path>.html/` directories.
  redirects: {
    "/about/dev": "/journey/",
    "/about/biomedicine": "/journey/",
  },
});
