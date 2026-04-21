export type LlmProvider = "anthropic" | "google" | "perplexity";

export type ModelOption = {
  id: string;
  provider: LlmProvider;
  modelId: string;
  label: string;
};

export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: "anthropic:claude-opus-4-7",
    provider: "anthropic",
    modelId: "claude-opus-4-7",
    label: "Claude Opus 4.7",
  },
  {
    id: "anthropic:claude-sonnet-4-6",
    provider: "anthropic",
    modelId: "claude-sonnet-4-6",
    label: "Claude Sonnet 4.6",
  },
  {
    id: "anthropic:claude-sonnet-4-5",
    provider: "anthropic",
    modelId: "claude-sonnet-4-5",
    label: "Claude Sonnet 4.5",
  },
  {
    id: "anthropic:claude-haiku-4-5",
    provider: "anthropic",
    modelId: "claude-haiku-4-5",
    label: "Claude Haiku 4.5",
  },
  {
    id: "anthropic:claude-3-5-sonnet-latest",
    provider: "anthropic",
    modelId: "claude-3-5-sonnet-latest",
    label: "Claude 3.5 Sonnet",
  },

  {
    id: "google:gemini-2.5-pro",
    provider: "google",
    modelId: "gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
  },
  {
    id: "google:gemini-2.5-flash",
    provider: "google",
    modelId: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
  },
  {
    id: "google:gemini-2.0-flash",
    provider: "google",
    modelId: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
  },

  {
    id: "perplexity:sonar-pro",
    provider: "perplexity",
    modelId: "sonar-pro",
    label: "Perplexity Sonar Pro",
  },
  {
    id: "perplexity:sonar",
    provider: "perplexity",
    modelId: "sonar",
    label: "Perplexity Sonar",
  },
  {
    id: "perplexity:sonar-reasoning-pro",
    provider: "perplexity",
    modelId: "sonar-reasoning-pro",
    label: "Perplexity Sonar Reasoning Pro",
  },
];

export const DEFAULT_MODEL_ID = "anthropic:claude-sonnet-4-5";

export function getModelOption(id: string): ModelOption | undefined {
  return MODEL_OPTIONS.find((m) => m.id === id);
}
