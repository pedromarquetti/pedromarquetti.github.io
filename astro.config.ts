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
});
