# Pedro Marquetti — portfolio

Bilingual (English / Brazilian Portuguese) portfolio built with
[Astro 7](https://astro.build) and TypeScript.

## Requirements

- Node.js 24 (see `.nvmrc`)
- npm

## Commands

```bash
npm ci          # install exact dependencies
npm run dev     # start the dev server
npm run check   # Astro + TypeScript diagnostics
npm run format  # format with Prettier
npm run build   # build the static site into dist/
npm run preview # preview the production build
```

## Structure

```text
src/pages/      Astro routes
public/         static assets copied as-is
dist/           generated build output
```
