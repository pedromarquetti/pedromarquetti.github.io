export type InlineNode = string | { text: string; href: string };

/**
 * One prose entry is one paragraph: a plain string for text, or an array of
 * inline nodes when the paragraph contains links.
 */
export type ProseParagraph = string | InlineNode[];

export const link = (text: string, href: string): InlineNode => ({
  text,
  href,
});
