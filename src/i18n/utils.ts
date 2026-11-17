import { getRelativeLocaleUrl } from "astro:i18n";
import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from "./locales";
import { ui, type UIKey } from "./ui";

type Vars = Record<string, string | number>;

export function t(locale: Locale, key: UIKey, vars?: Vars): string {
  return ui[locale][key].replace(/\{(\w+)\}/g, (_, name: string) => {
    if (!vars || !(name in vars)) {
      throw new Error(
        `Missing value for "{${name}}" in translation key "${key}"`,
      );
    }
    return String(vars[name]);
  });
}

export function stripLocale(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);

  if (
    segments.length > 0 &&
    segments[0] !== DEFAULT_LOCALE &&
    isLocale(segments[0])
  ) {
    segments.shift();
  }

  return segments.length > 0 ? `/${segments.join("/")}/` : "/";
}

export function localeLink(locale: Locale, path = ""): string {
  const href = getRelativeLocaleUrl(locale, path);
  return href.endsWith("/") ? href : `${href}/`;
}

export function localePath(locale: Locale, pathname: string): string {
  const path = stripLocale(pathname);
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;

  return path === "/" ? `${prefix}/` : `${prefix}${path}`;
}

export function getAlternates(pathname: string) {
  return LOCALES.map((locale) => ({
    locale,
    path: localePath(locale, pathname),
  }));
}
