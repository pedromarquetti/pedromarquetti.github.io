import en from "./en.json";
import ptBR from "./pt-br.json";
import type { Locale } from "./locales";

export type UIKey = keyof typeof en;
export type { Locale } from "./locales";

export const ui: Record<Locale, Record<UIKey, string>> = {
  en,
  "pt-br": ptBR,
};
