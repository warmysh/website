import { defineConfig } from "astro/config";

function hasHeadingAnchor(node) {
  if (!Array.isArray(node.children)) return false;
  return node.children.some((child) => {
    if (child?.type !== "element" || child.tagName !== "a") return false;
    const className = child.properties?.className;
    if (Array.isArray(className)) return className.includes("heading-anchor");
    if (typeof className === "string") return className.split(/\s+/).includes("heading-anchor");
    return false;
  });
}

function extractText(node) {
  if (!node || typeof node !== "object") return "";
  if (node.type === "text") return node.value ?? "";
  if (!Array.isArray(node.children)) return "";
  return node.children.map((child) => extractText(child)).join("");
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function addHeadingAnchors() {
  return (tree) => {
    const slugCounts = new Map();

    const visit = (node) => {
      if (!node || typeof node !== "object") return;

      if (node.type === "element" && /^h[1-6]$/.test(node.tagName)) {
        let id = node.properties?.id;
        if (typeof id !== "string" || id.length === 0) {
          const baseSlug = slugify(extractText(node)) || "section";
          const count = slugCounts.get(baseSlug) ?? 0;
          slugCounts.set(baseSlug, count + 1);
          id = count > 0 ? `${baseSlug}-${count}` : baseSlug;
          node.properties = {
            ...(node.properties ?? {}),
            id
          };
        }

        if (!hasHeadingAnchor(node)) {
          node.children = [
            ...(node.children ?? []),
            {
              type: "element",
              tagName: "a",
              properties: {
                href: `#${id}`,
                className: ["heading-anchor"],
                "aria-label": "Ссылка на раздел"
              },
              children: [{ type: "text", value: "#" }]
            }
          ];
        }
      }

      if (Array.isArray(node.children)) {
        node.children.forEach(visit);
      }
    };

    visit(tree);
  };
}

export default defineConfig({
  output: "static",
  markdown: {
    rehypePlugins: [addHeadingAnchors]
  }
});
