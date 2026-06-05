import fs from "node:fs";

const navFile = new URL("../../content/_nav.md", import.meta.url);

function markdownHrefToPath(markdownHref) {
  const normalized = markdownHref.trim().replace(/^\.\/+/, "");
  const pageName = normalized.replace(/\.md$/i, "");
  if (pageName === "index") return "/";
  return `/${pageName}/`;
}

function parseRoutes(markdown) {
  const routes = new Set(["/"]);
  markdown.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*-\s+\[[^\]]+\]\(([^)]+)\)\s*$/);
    if (!match) return;
    routes.add(markdownHrefToPath(match[1]));
  });
  return [...routes];
}

export async function GET({ site }) {
  const origin = (site ? site.origin : "https://oem.proforge.ru").replace(/\/$/, "");
  const navSource = fs.readFileSync(navFile, "utf-8");
  const routes = parseRoutes(navSource);

  const urls = routes
    .map((route) => {
      const priority = route === "/" ? "1.0" : "0.7";
      return `  <url>\n    <loc>${origin}${route}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" }
  });
}
