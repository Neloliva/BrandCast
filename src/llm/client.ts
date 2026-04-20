import { anthropic } from "@ai-sdk/anthropic";
import type { LanguageModel } from "ai";

const PROVIDER = process.env.LLM_PROVIDER ?? "anthropic";

export function defaultModel(): LanguageModel {
  switch (PROVIDER) {
    case "anthropic":
      return anthropic("claude-sonnet-4-6");
    default:
      throw new Error(
        `Unknown LLM_PROVIDER: ${PROVIDER}. Add a case in src/llm/client.ts.`,
      );
  }
}
