import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const SITE = "https://phlm.dev.br";
const LOCALES = ["en", "pt-br"];
const LANG_TAGS = { en: "en", "pt-br": "pt-BR" };

const errors = [];

if (!existsSync(dist)) {
  console.error("dist/ not found. Run `npm run build` first.");
  process.exit(1);
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function tagWith(html, tagName, needle) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*>`, "gi");
  for (const match of html.matchAll(pattern)) {
    if (match[0].includes(needle)) return match[0];
  }
  return null;
}

function attrValue(tagSource, name) {
  if (!tagSource) return null;
  const match = new RegExp(`${name}="([^"]*)"`).exec(tagSource);
  return match ? match[1] : null;
}

function stripLocale(route) {
  const segments = route.split("/").filter(Boolean);
  if (
    segments.length > 0 &&
    segments[0] !== "en" &&
    LOCALES.includes(segments[0])
  ) {
    segments.shift();
  }
  return segments.length > 0 ? `/${segments.join("/")}/` : "/";
}

function localePath(locale, route) {
  const path = stripLocale(route);
  const prefix = locale === "en" ? "" : `/${locale}`;
  return path === "/" ? `${prefix}/` : `${prefix}${path}`;
}

function routeOf(htmlFile) {
  const rel = relative(dist, htmlFile).split(sep).join("/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html"))
    return `/${rel.slice(0, -"index.html".length)}`;
  return `/${rel}`;
}

// Keep only real redirect stubs; every other HTML file is a page.
const htmlFiles = walk(dist).filter((file) => file.endsWith(".html"));
const redirects = [];
const pages = [];

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const route = routeOf(file);

  if (/<meta\s+http-equiv="refresh"/i.test(html)) {
    redirects.push({ route, file });
  } else {
    pages.push({ route, file, html });
  }
}

const titles = new Map();
const indexable = [];

for (const { route, html } of pages) {
  const title = new RegExp("<title>([^<]*)</title>").exec(html)?.[1] ?? "";
  const description = attrValue(
    tagWith(html, "meta", 'name="description"'),
    "content",
  );
  const lang = attrValue(tagWith(html, "html", "<html"), "lang");
  const noindex = /<meta\s+name="robots"\s+content="noindex/i.test(html);
  const locale = route.startsWith("/pt-br/") ? "pt-br" : "en";

  if (!title.trim()) {
    errors.push(`${route}: missing <title>`);
  } else if (titles.has(`${locale}:${title}`)) {
    errors.push(
      `${route}: title duplicates ${titles.get(`${locale}:${title}`)} ("${title}")`,
    );
  } else {
    titles.set(`${locale}:${title}`, route);
  }

  if (!description?.trim()) {
    errors.push(`${route}: missing meta description`);
  }

  const expectedLang = route.startsWith("/pt-br/") ? "pt-BR" : "en";
  if (lang !== expectedLang) {
    errors.push(
      `${route}: <html lang> is "${lang}", expected "${expectedLang}"`,
    );
  }

  if (noindex) {
    continue;
  }

  indexable.push(route);

  const canonical = attrValue(tagWith(html, "link", 'rel="canonical"'), "href");
  const expectedCanonical = `${SITE}${route}`;

  if (canonical !== expectedCanonical) {
    errors.push(
      `${route}: canonical is "${canonical}", expected "${expectedCanonical}"`,
    );
  }

  for (const locale of LOCALES) {
    const tag = tagWith(html, "link", `hreflang="${LANG_TAGS[locale]}"`);
    const href = attrValue(tag, "href");
    const expected = `${SITE}${localePath(locale, route)}`;

    if (href !== expected) {
      errors.push(
        `${route}: hreflang ${LANG_TAGS[locale]} is "${href}", expected "${expected}"`,
      );
    }
  }

  const xDefault = attrValue(
    tagWith(html, "link", 'hreflang="x-default"'),
    "href",
  );
  if (xDefault !== `${SITE}${localePath("en", route)}`) {
    errors.push(`${route}: x-default is "${xDefault}"`);
  }

  const ogUrl = attrValue(
    tagWith(html, "meta", 'property="og:url"'),
    "content",
  );
  if (ogUrl !== canonical) {
    errors.push(`${route}: og:url "${ogUrl}" does not match canonical`);
  }

  const ogImage = attrValue(
    tagWith(html, "meta", 'property="og:image"'),
    "content",
  );
  if (ogImage !== `${SITE}/og/${locale}.png`) {
    errors.push(`${route}: og:image "${ogImage}" is not the ${locale} image`);
  } else if (!existsSync(join(dist, "og", `${locale}.png`))) {
    errors.push(`${route}: og/${locale}.png was not copied to dist/`);
  }

  const ogWidth = attrValue(
    tagWith(html, "meta", 'property="og:image:width"'),
    "content",
  );
  const ogHeight = attrValue(
    tagWith(html, "meta", 'property="og:image:height"'),
    "content",
  );
  if (ogWidth !== "1200" || ogHeight !== "630") {
    errors.push(`${route}: og:image dimensions are ${ogWidth}x${ogHeight}`);
  }

  const jsonLdMatch =
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html);
  if (!jsonLdMatch) {
    errors.push(`${route}: missing JSON-LD`);
  } else {
    try {
      const data = JSON.parse(jsonLdMatch[1]);
      if (data["@type"] !== "Person") {
        errors.push(`${route}: JSON-LD type is "${data["@type"]}"`);
      }
      if (!data.name || !data.jobTitle || !data.url) {
        errors.push(`${route}: JSON-LD is missing name, jobTitle, or url`);
      }
      if (!Array.isArray(data.sameAs) || data.sameAs.length < 2) {
        errors.push(`${route}: JSON-LD sameAs needs GitHub and LinkedIn`);
      }
      if (data.url !== `${SITE}${localePath(locale, "/")}`) {
        errors.push(
          `${route}: JSON-LD url "${data.url}" is not the ${locale} home`,
        );
      }
    } catch (error) {
      errors.push(`${route}: JSON-LD does not parse (${error.message})`);
    }
  }
}

const sitemapFiles = readdirSync(dist).filter((file) =>
  /^sitemap-\d+\.xml$/.test(file),
);

if (sitemapFiles.length === 0) {
  errors.push("dist/: no sitemap-<n>.xml found");
} else {
  const locations = new Set();
  for (const file of sitemapFiles) {
    const xml = readFileSync(join(dist, file), "utf8");
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      locations.add(match[1]);
    }
  }

  for (const locale of LOCALES) {
    if (!locations.has(`${SITE}${localePath(locale, "/")}`)) {
      errors.push(`sitemap: missing the ${locale} home`);
    }
  }

  for (const { route } of redirects) {
    if (locations.has(`${SITE}${route}`)) {
      errors.push(`sitemap: contains redirect page ${SITE}${route}`);
    }
  }

  for (const route of indexable) {
    if (!locations.has(`${SITE}${route}`)) {
      errors.push(`sitemap: missing indexable page ${route}`);
    }
  }
}

if (!existsSync(join(dist, "sitemap-index.xml"))) {
  errors.push("dist/: sitemap-index.xml is missing");
}

// const cnamePath = join(dist, "CNAME");
// if (!existsSync(cnamePath)) {
//   errors.push("dist/: CNAME is missing (GitHub Pages custom domain)");
// } else {
//   const domain = readFileSync(cnamePath, "utf8").trim();
//   const expectedDomain = new URL(SITE).hostname;
//   if (domain !== expectedDomain) {
//     errors.push(`CNAME is "${domain}", expected "${expectedDomain}"`);
//   }
// }

const robotsPath = join(dist, "robots.txt");
if (!existsSync(robotsPath)) {
  errors.push("dist/: robots.txt is missing");
} else {
  const robots = readFileSync(robotsPath, "utf8");
  if (!/^Allow:\s*\/\s*$/m.test(robots)) {
    errors.push('robots.txt: expected "Allow: /"');
  }
  if (!robots.includes(`Sitemap: ${SITE}/sitemap-index.xml`)) {
    errors.push("robots.txt: missing the sitemap reference");
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(error);
  }
  console.error(`\n${errors.length} SEO issue(s) found.`);
  process.exit(1);
}

console.log(
  `SEO check passed: ${pages.length} page(s), ${redirects.length} redirect(s), ${sitemapFiles.length} sitemap file(s).`,
);
