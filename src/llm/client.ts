import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { perplexity } from "@ai-sdk/perplexity";
import type { LanguageModel } from "ai";
import {
  DEFAULT_MODEL_ID,
  getModelOption,
  type ModelOption,
} from "./models";

const ANTHROPIC_DEFAULT =
  process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";

export function defaultModel(): LanguageModel {
  return anthropic(ANTHROPIC_DEFAULT);
}

export function modelFor(id: string | undefined | null): LanguageModel {
  const option = (id && getModelOption(id)) || getModelOption(DEFAULT_MODEL_ID);
  if (!option) {
    return anthropic(ANTHROPIC_DEFAULT);
  }
  return providerModel(option);
}

function providerModel(option: ModelOption): LanguageModel {
  switch (option.provider) {
    case "anthropic":
      return anthropic(option.modelId);
    case "google":
      return google(option.modelId);
    case "perplexity":
      return perplexity(option.modelId);
  }
}
