import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
// TODO: fix this, the GH pages will be hosted at https://phlm.dev.br
const site = "https://pedromarquetti.github.io";

const redirects = [
  { from: "/about.html", to: "/about/" },
  { from: "/about/dev", to: "/journey/" },
  { from: "/about/dev.html", to: "/journey/" },
  { from: "/about/biomedicine", to: "/journey/" },
  { from: "/about/biomedicine.html", to: "/journey/" },
];

const errors = [];

if (!existsSync(dist)) {
  console.error("dist/ not found. Run `npm run build` first.");
  process.exit(1);
}

function fileFor(pathname) {
  return pathname.endsWith(".html")
    ? join(dist, pathname)
    : join(dist, pathname, "index.html");
}

for (const { from, to } of redirects) {
  const file = fileFor(from);

  if (!existsSync(file)) {
    errors.push(`${from}: missing redirect file (expected ${file})`);
    continue;
  }

  const html = readFileSync(file, "utf8");
  const refresh =
    /<meta\s+http-equiv="refresh"\s+content="0;\s*url=([^"]+)"/i.exec(html);

  if (!refresh) {
    errors.push(`${from}: missing meta refresh`);
  } else if (refresh[1] !== to) {
    errors.push(`${from}: redirects to ${refresh[1]}, expected ${to}`);
  }

  if (
    !new RegExp(`<link\\s+rel="canonical"\\s+href="${site}${to}"\\s*/?>`).test(
      html,
    )
  ) {
    errors.push(`${from}: canonical does not point to ${site}${to}`);
  }

  if (!/<meta\s+name="robots"\s+content="noindex"/i.test(html)) {
    errors.push(`${from}: missing noindex`);
  }

  if (!html.includes(`href="${to}"`)) {
    errors.push(`${from}: missing fallback link to ${to}`);
  }

  if (!existsSync(fileFor(to))) {
    errors.push(`${from}: redirect target ${to} was not built`);
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(error);
  }
  console.error(`\n${errors.length} redirect issue(s) found.`);
  process.exit(1);
}

console.log(`Redirect check passed: ${redirects.length} legacy route(s).`);
