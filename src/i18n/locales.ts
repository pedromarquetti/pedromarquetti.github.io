export const LOCALES = ["en", "pt-br"] as const;
export const DEFAULT_LOCALE = "en";

export type Locale = (typeof LOCALES)[number];

export const LANG_TAGS: Record<Locale, string> = {
  en: "en",
  "pt-br": "pt-BR",
};

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  "pt-br": "Português",
};

export function isLocale(value: string | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function resolveLocale(value: string | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
