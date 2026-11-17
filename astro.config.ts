import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://pedromarquetti.github.io",
  output: "static",
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
