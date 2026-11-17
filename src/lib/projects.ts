import { getCollection, type CollectionEntry } from "astro:content";
import type { Locale } from "../i18n/locales";
import { localeLink } from "../i18n/utils";
import type { UIKey } from "../i18n/ui";

export type Project = CollectionEntry<"projects">;

export async function getProjects(): Promise<Project[]> {
  const projects = await getCollection("projects");

  return projects.sort(
    (a, b) =>
      a.data.order - b.data.order || a.data.name.localeCompare(b.data.name),
  );
}

export async function getFeaturedProjects(limit = 6): Promise<Project[]> {
  return (await getProjects())
    .filter((project) => project.data.featured)
    .slice(0, limit);
}

export function statusKey(status: Project["data"]["status"]): UIKey {
  return `status.${status}`;
}

export function liveKey(kind: Project["data"]["liveKind"]): UIKey {
  if (kind === "docs") return "link.docs";
  if (kind === "app") return "link.app";
  return "link.live";
}

export function projectHref(locale: Locale, project: Project): string {
  return localeLink(locale, `project/${project.id}`);
}
