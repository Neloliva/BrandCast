import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import type { ExtractedContent } from "./types";

const USER_AGENT =
  "Mozilla/5.0 (compatible; BrandCastBot/1.0; +https://brandcast.app)";

export async function extractFromUrl(url: string): Promise<ExtractedContent> {
  const parsed = new URL(url);

  const res = await fetch(parsed.toString(), {
    headers: { "user-agent": USER_AGENT, accept: "text/html,*/*" },
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();
  const dom = new JSDOM(html, { url: parsed.toString() });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article || !article.textContent) {
    throw new Error(`Could not extract readable content from ${url}`);
  }

  const bodyMd = htmlToMarkdown(article.content ?? "");

  return {
    title: article.title ?? null,
    byline: article.byline ?? null,
    bodyMd,
    meta: {
      sourceKind: "url",
      sourceRef: parsed.toString(),
      siteName: article.siteName ?? parsed.hostname,
      excerpt: article.excerpt ?? undefined,
      wordCount: article.length ?? undefined,
    },
  };
}

function htmlToMarkdown(html: string): string {
  const dom = new JSDOM(`<body>${html}</body>`);
  const text = dom.window.document.body.textContent ?? "";
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n\n");
}
