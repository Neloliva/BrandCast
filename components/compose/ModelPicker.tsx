"use client";

import { MODEL_OPTIONS, type LlmProvider } from "@/src/llm/models";

const PROVIDER_LABEL: Record<LlmProvider, string> = {
  anthropic: "Anthropic",
  google: "Google",
  perplexity: "Perplexity",
};

export default function ModelPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const grouped = MODEL_OPTIONS.reduce<Record<LlmProvider, typeof MODEL_OPTIONS>>(
    (acc, m) => {
      (acc[m.provider] ||= []).push(m);
      return acc;
    },
    { anthropic: [], google: [], perplexity: [] },
  );

  return (
    <div>
      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Model
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {(Object.keys(grouped) as LlmProvider[]).map((provider) => (
          <optgroup key={provider} label={PROVIDER_LABEL[provider]}>
            {grouped[provider].map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
