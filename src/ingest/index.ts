import type { ExtractedContent } from "./types";
import { extractFromUrl } from "./url";
import { extractFromFile } from "./file";

export type IngestInput =
  | { kind: "url"; url: string }
  | { kind: "file"; file: File }
  | { kind: "text"; title?: string; text: string };

export async function ingest(input: IngestInput): Promise<ExtractedContent> {
  switch (input.kind) {
    case "url":
      return extractFromUrl(input.url);
    case "file":
      return extractFromFile(input.file);
    case "text":
      return {
        title: input.title ?? null,
        byline: null,
        bodyMd: input.text,
        meta: { sourceKind: "text" },
      };
  }
}

export type { ExtractedContent };
