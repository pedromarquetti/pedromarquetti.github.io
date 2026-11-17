/**
 * Public contact details. Keep these in one place so the footer, the home
 * contact section, and the about page never drift apart.
 */
export const site = {
  github: "https://github.com/pedromarquetti",
  linkedin: "https://www.linkedin.com/in/pedro-h-l-m/",
  // Published on the previous site. The spelling is kept as-is until confirmed.
  email: "pedro.marquettti@gmail.com",
} as const;

export const mailto = `mailto:${site.email}`;
