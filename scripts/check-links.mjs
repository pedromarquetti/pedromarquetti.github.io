import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, normalize, resolve, sep } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const errors = [];
let linkCount = 0;

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

function isIgnored(url) {
  return (
    url === "" ||
    url.startsWith("#") ||
    url.startsWith("//") ||
    /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(url)
  );
}

function targetExists(path) {
  if (existsSync(path)) {
    return statSync(path).isDirectory()
      ? existsSync(join(path, "index.html"))
      : true;
  }

  return existsSync(`${path}.html`);
}

const htmlFiles = walk(dist).filter((file) => file.endsWith(".html"));

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const relativeFile = file.slice(root.length + 1);
  const urls = [...html.matchAll(/\b(?:href|src)\s*=\s*"([^"]*)"/gi)].map(
    (match) => match[1],
  );

  for (const rawUrl of urls) {
    const url = rawUrl.replaceAll("&amp;", "&");

    if (isIgnored(url)) {
      continue;
    }

    linkCount++;

    const [pathPart] = url.split(/[?#]/);
    if (!pathPart) {
      continue;
    }

    let decodedPath;
    try {
      decodedPath = decodeURIComponent(pathPart);
    } catch {
      errors.push(`${relativeFile}: invalid URL encoding in "${rawUrl}"`);
      continue;
    }

    const base = pathPart.startsWith("/") ? dist : dirname(file);
    const target = normalize(
      resolve(base, pathPart.startsWith("/") ? `.${decodedPath}` : decodedPath),
    );

    if (!target.startsWith(dist + sep) && target !== dist) {
      errors.push(`${relativeFile}: link escapes dist/: "${rawUrl}"`);
      continue;
    }

    if (!targetExists(target)) {
      errors.push(`${relativeFile}: broken link "${rawUrl}"`);
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(error);
  }
  console.error(`\n${errors.length} broken link(s) found.`);
  process.exit(1);
}

console.log(
  `Link check passed: ${linkCount} internal links across ${htmlFiles.length} HTML file(s).`,
);
