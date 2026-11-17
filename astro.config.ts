import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://pedromarquetti.github.io",
  output: "static",
  build: { format: "directory" },
  trailingSlash: "always",
});
