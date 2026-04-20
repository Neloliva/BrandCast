import { anthropic } from "@ai-sdk/anthropic";
import type { LanguageModel } from "ai";

const PROVIDER = process.env.LLM_PROVIDER ?? "anthropic";
const ANTHROPIC_MODEL =
  process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";

export function defaultModel(): LanguageModel {
  switch (PROVIDER) {
    case "anthropic":
      return anthropic(ANTHROPIC_MODEL);
    default:
      throw new Error(
        `Unknown LLM_PROVIDER: ${PROVIDER}. Add a case in src/llm/client.ts.`,
      );
  }
}
