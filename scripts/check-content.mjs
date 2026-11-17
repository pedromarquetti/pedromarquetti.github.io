import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const errors = [];

function readJson(relativePath) {
  try {
    return JSON.parse(readFileSync(join(root, relativePath), "utf8"));
  } catch (error) {
    errors.push(`${relativePath}: ${error.message}`);
    return null;
  }
}

function walk(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function checkStrings(value, file, path = []) {
  if (typeof value === "string") {
    const location = path.join(".") || "value";
    if (!value.trim()) {
      errors.push(`${file}: empty string at ${location}`);
    }
    if (/\b(?:TODO|TBD|FIXME|XXX)\b|\[CONFIRM\]|lorem ipsum/i.test(value)) {
      errors.push(`${file}: placeholder text at ${location}`);
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      checkStrings(item, file, [...path, String(index)]);
    });
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      checkStrings(item, file, [...path, key]);
    }
  }
}

const en = readJson("src/i18n/en.json");
const ptBR = readJson("src/i18n/pt-br.json");

let keyCount = 0;

if (en && ptBR) {
  const enKeys = Object.keys(en).sort();
  const ptBRKeys = Object.keys(ptBR).sort();
  keyCount = enKeys.length;

  for (const key of enKeys) {
    if (!(key in ptBR)) {
      errors.push(`src/i18n/pt-br.json: missing key "${key}"`);
    }
  }

  for (const key of ptBRKeys) {
    if (!(key in en)) {
      errors.push(`src/i18n/pt-br.json: unexpected key "${key}"`);
    }
  }

  for (const [file, dictionary] of [
    ["src/i18n/en.json", en],
    ["src/i18n/pt-br.json", ptBR],
  ]) {
    for (const [key, value] of Object.entries(dictionary)) {
      if (typeof value !== "string" || !value.trim()) {
        errors.push(`${file}: empty value for "${key}"`);
      }
    }
  }
}

const contentDirectory = join(root, "src/content");
const contentFiles = walk(contentDirectory).filter((file) =>
  file.endsWith(".json"),
);

for (const file of contentFiles) {
  const relativePath = file.slice(root.length + 1);
  const content = readJson(relativePath);
  if (content) {
    checkStrings(content, relativePath);
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(error);
  }
  console.error(`\n${errors.length} content issue(s) found.`);
  process.exit(1);
}

console.log(
  `Content check passed: ${keyCount} UI keys in 2 locales and ${contentFiles.length} content file(s).`,
);
