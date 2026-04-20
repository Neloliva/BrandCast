import mammoth from "mammoth";
import type { ExtractedContent } from "./types";

const MAX_BYTES = 10 * 1024 * 1024;

export async function extractFromFile(
  file: File | { name: string; type: string; arrayBuffer(): Promise<ArrayBuffer> },
): Promise<ExtractedContent> {
  const buf = Buffer.from(await file.arrayBuffer());

  if (buf.byteLength > MAX_BYTES) {
    throw new Error(`File exceeds ${MAX_BYTES / 1024 / 1024}MB limit.`);
  }

  const mime = file.type || guessMime(file.name);

  if (mime === "application/pdf" || file.name.endsWith(".pdf")) {
    const pdf = await import("pdf-parse");
    const result = await pdf.default(buf);
    return {
      title: stripExt(file.name),
      byline: null,
      bodyMd: cleanText(result.text),
      meta: { sourceKind: "file", sourceRef: file.name, mimeType: "application/pdf" },
    };
  }

  if (
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer: buf });
    return {
      title: stripExt(file.name),
      byline: null,
      bodyMd: cleanText(result.value),
      meta: { sourceKind: "file", sourceRef: file.name, mimeType: mime },
    };
  }

  if (
    mime.startsWith("text/") ||
    file.name.endsWith(".md") ||
    file.name.endsWith(".txt")
  ) {
    return {
      title: stripExt(file.name),
      byline: null,
      bodyMd: cleanText(buf.toString("utf-8")),
      meta: { sourceKind: "file", sourceRef: file.name, mimeType: mime },
    };
  }

  throw new Error(`Unsupported file type: ${mime || file.name}`);
}

function guessMime(name: string): string {
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".docx"))
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (name.endsWith(".md")) return "text/markdown";
  if (name.endsWith(".txt")) return "text/plain";
  return "application/octet-stream";
}

function stripExt(name: string): string {
  return name.replace(/\.[^.]+$/, "");
}

function cleanText(s: string): string {
  return s
    .split("\n")
    .map((l) => l.replace(/\s+$/g, ""))
    .filter((l, i, arr) => !(l === "" && arr[i - 1] === ""))
    .join("\n")
    .trim();
}
