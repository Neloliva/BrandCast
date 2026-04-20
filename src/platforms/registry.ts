export type PlatformId =
  | "linkedin"
  | "twitter"
  | "instagram"
  | "facebook"
  | "threads";

export type PlatformSpec = {
  id: PlatformId;
  displayName: string;
  hardCharLimit: number;
  softCharTarget: number;
  hashtagConvention: "inline" | "trailing" | "none";
  hashtagMax: number;
  supportsThreads: boolean;
  linkBehavior: "inline_ok" | "first_comment_preferred" | "no_links";
  guidance: string;
};

export const PLATFORMS: Record<PlatformId, PlatformSpec> = {
  linkedin: {
    id: "linkedin",
    displayName: "LinkedIn",
    hardCharLimit: 3000,
    softCharTarget: 1300,
    hashtagConvention: "trailing",
    hashtagMax: 5,
    supportsThreads: false,
    linkBehavior: "first_comment_preferred",
    guidance: [
      "Open with a sharp hook on the first line — it is the only line shown before 'see more'.",
      "Use short paragraphs (1–2 sentences) with white space between them.",
      "Avoid hard sells. Reflect, teach, or share a learning.",
      "If a link is essential, mention 'link in comments' rather than inlining it.",
    ].join(" "),
  },
  twitter: {
    id: "twitter",
    displayName: "X (Twitter)",
    hardCharLimit: 280,
    softCharTarget: 240,
    hashtagConvention: "inline",
    hashtagMax: 2,
    supportsThreads: true,
    linkBehavior: "inline_ok",
    guidance: [
      "Single tweet under 280 chars unless the brand voice clearly favors threads.",
      "No filler. Cut 'I think', 'just', 'really'.",
      "At most 1–2 hashtags, only if they're industry terms (not decoration).",
    ].join(" "),
  },
  instagram: {
    id: "instagram",
    displayName: "Instagram",
    hardCharLimit: 2200,
    softCharTarget: 150,
    hashtagConvention: "trailing",
    hashtagMax: 15,
    supportsThreads: false,
    linkBehavior: "no_links",
    guidance: [
      "Visual-first platform — caption supports an implied image.",
      "Front-load the hook; the rest is hidden behind 'more'.",
      "Hashtags grouped at the end on a separate line.",
      "Links don't render — refer to 'link in bio' if needed.",
    ].join(" "),
  },
  facebook: {
    id: "facebook",
    displayName: "Facebook",
    hardCharLimit: 5000,
    softCharTarget: 400,
    hashtagConvention: "none",
    hashtagMax: 0,
    supportsThreads: false,
    linkBehavior: "inline_ok",
    guidance: [
      "Conversational tone. Short posts outperform long ones.",
      "Hashtags are not a Facebook convention — omit unless brand-mandated.",
      "Links render as previews — inline placement is fine.",
    ].join(" "),
  },
  threads: {
    id: "threads",
    displayName: "Threads",
    hardCharLimit: 500,
    softCharTarget: 280,
    hashtagConvention: "inline",
    hashtagMax: 1,
    supportsThreads: true,
    linkBehavior: "inline_ok",
    guidance: [
      "Conversational, low-stakes tone. More casual than LinkedIn, more reflective than X.",
      "One hashtag max. Threads downplays them.",
    ].join(" "),
  },
};

export function getPlatform(id: PlatformId): PlatformSpec {
  return PLATFORMS[id];
}

export function platformSection(spec: PlatformSpec): string {
  return [
    `## Platform: ${spec.displayName}`,
    `- Hard character limit: ${spec.hardCharLimit}`,
    `- Aim for: ~${spec.softCharTarget} characters`,
    `- Hashtags: ${spec.hashtagConvention === "none" ? "none" : `${spec.hashtagConvention}, max ${spec.hashtagMax}`}`,
    `- Links: ${spec.linkBehavior.replace(/_/g, " ")}`,
    "",
    spec.guidance,
  ].join("\n");
}
