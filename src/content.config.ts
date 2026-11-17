import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const localized = z.object({
  en: z.string().min(1),
  "pt-br": z.string().min(1),
});

const localizedList = z.object({
  en: z.array(z.string().min(1)).min(1),
  "pt-br": z.array(z.string().min(1)).min(1),
});

const httpsUrl = z
  .url()
  .refine((value) => value.startsWith("https://"), "URL must use https://");

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/index.json" }),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(1),
      tagline: localized.refine(
        (value) => value.en.length <= 90 && value["pt-br"].length <= 90,
        "Taglines must be 90 characters or fewer",
      ),
      description: localized,
      details: localizedList,
      images: z
        .array(
          z.object({
            src: image(),
            alt: localized,
            caption: localized.optional(),
          }),
        )
        .default([]),
      year: z.number().int().min(2000).max(2100),
      order: z.number().int().default(0),
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

export const collections = { projects };
