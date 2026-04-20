export type ExtractedContent = {
  title: string | null;
  byline: string | null;
  bodyMd: string;
  meta: {
    sourceKind: "url" | "file" | "text";
    sourceRef?: string;
    siteName?: string;
    excerpt?: string;
    wordCount?: number;
    mimeType?: string;
  };
};
