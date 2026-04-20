import { streamObject } from "ai";
import { defaultModel } from "./client";
import { PostOutputSchema, type PostOutput } from "./schemas";
import { brandVoiceSection } from "./prompts/brand-voice";
import { platformSection, type PlatformSpec } from "@/src/platforms/registry";
import type { brandProfiles } from "@/src/db/schema";
import type { ExtractedContent } from "@/src/ingest/types";

type BrandProfile = typeof brandProfiles.$inferSelect;

type StreamArgs = {
  source: ExtractedContent;
  brandProfile: BrandProfile;
  platform: PlatformSpec;
};

export function streamPostForPlatform({
  source,
  brandProfile,
  platform,
}: StreamArgs) {
  const system = [
    "You are a senior social copywriter adapting source content into a single on-brand post.",
    "Follow the brand voice exactly. When brand rules conflict with the source's tone, the brand voice wins.",
    "Respect the platform's hard character limits. Count characters before emitting.",
    "",
    brandVoiceSection(brandProfile),
    "",
    platformSection(platform),
  ].join("\n");

  const prompt = [
    "## Source content",
    source.title ? `**Title:** ${source.title}` : null,
    source.byline ? `**Byline:** ${source.byline}` : null,
    "",
    source.bodyMd,
    "",
    `## Task`,
    `Adapt the source above into a single ${platform.displayName} post.`,
    `Return the structured post only — do not narrate your reasoning.`,
  ]
    .filter(Boolean)
    .join("\n");

  return streamObject<PostOutput>({
    model: defaultModel(),
    schema: PostOutputSchema,
    system,
    prompt,
  });
}
