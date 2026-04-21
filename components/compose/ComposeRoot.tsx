"use client";

import { useState } from "react";
import InputPanel from "./InputPanel";
import PreviewPanel from "./PreviewPanel";
import PlatformPicker from "./PlatformPicker";
import ModelPicker from "./ModelPicker";
import { type PlatformId } from "@/src/platforms/registry";
import type { PostOutput } from "@/src/llm/schemas";
import { DEFAULT_MODEL_ID } from "@/src/llm/models";

type Client = { id: string; name: string };

export type ComposeSource =
  | { kind: "url"; url: string }
  | { kind: "text"; text: string }
  | { kind: "file"; file: File };

export type PostState = {
  status: "idle" | "streaming" | "done" | "error";
  partial?: Partial<PostOutput>;
  final?: PostOutput;
  error?: string;
};

export default function ComposeRoot({ clients }: { clients: Client[] }) {
  const [clientId, setClientId] = useState<string>(clients[0]?.id ?? "");
  const [source, setSource] = useState<ComposeSource | null>(null);
  const [platforms, setPlatforms] = useState<PlatformId[]>([
    "linkedin",
    "twitter",
  ]);
  const [model, setModel] = useState<string>(DEFAULT_MODEL_ID);
  const [postsByPlatform, setPostsByPlatform] = useState<
    Record<PlatformId, PostState>
  >({} as Record<PlatformId, PostState>);
  const [isGenerating, setIsGenerating] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);

  async function generate() {
    if (!source || !clientId || !platforms.length) return;
    setIsGenerating(true);
    setTopError(null);
    setPostsByPlatform(
      Object.fromEntries(
        platforms.map((p) => [p, { status: "idle" } as PostState]),
      ) as Record<PlatformId, PostState>,
    );

    let body: BodyInit;
    let headers: HeadersInit;
    if (source.kind === "file") {
      const fd = new FormData();
      fd.append("file", source.file);
      fd.append(
        "_meta",
        JSON.stringify({ clientId, platforms, sourceKind: "file" }),
      );
      const ingest = await fetch("/api/ingest", { method: "POST", body: fd });
      if (!ingest.ok) {
        const j = await ingest.json().catch(() => ({}));
        setTopError(j.error ?? "Ingest failed");
        setIsGenerating(false);
        return;
      }
      const extracted = await ingest.json();
      body = JSON.stringify({
        clientId,
        platforms,
        model,
        source: { kind: "text", title: extracted.title, text: extracted.bodyMd },
      });
      headers = { "Content-Type": "application/json" };
    } else {
      body = JSON.stringify({ clientId, platforms, model, source });
      headers = { "Content-Type": "application/json" };
    }

    const res = await fetch("/api/generate", { method: "POST", body, headers });
    if (!res.ok || !res.body) {
      const j = await res.json().catch(() => ({}));
      setTopError(j.error ?? `Generation failed (${res.status})`);
      setIsGenerating(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) continue;
        let evt: {
          type: string;
          platform?: PlatformId;
          partial?: Partial<PostOutput>;
          post?: PostOutput;
          error?: string;
        };
        try {
          evt = JSON.parse(line);
        } catch {
          continue;
        }
        if (evt.type === "post.started" && evt.platform) {
          updatePost(evt.platform, { status: "streaming" });
        } else if (evt.type === "post.delta" && evt.platform) {
          updatePost(evt.platform, {
            status: "streaming",
            partial: evt.partial,
          });
        } else if (evt.type === "post.completed" && evt.platform && evt.post) {
          updatePost(evt.platform, { status: "done", final: evt.post });
        } else if (evt.type === "post.error" && evt.platform) {
          updatePost(evt.platform, {
            status: "error",
            error: evt.error ?? "Generation failed",
          });
        }
      }
    }

    setPostsByPlatform((prev) => {
      const next = { ...prev };
      for (const p of platforms) {
        const s = next[p];
        if (s && s.status === "streaming") {
          next[p] = {
            ...s,
            status: "error",
            error: s.error ?? "Stream ended before completion",
          };
        }
      }
      return next;
    });
    setIsGenerating(false);
  }

  function updatePost(platform: PlatformId, patch: Partial<PostState>) {
    setPostsByPlatform((prev) => ({
      ...prev,
      [platform]: { ...(prev[platform] ?? { status: "idle" }), ...patch },
    }));
  }

  return (
    <div className="grid h-[calc(100vh-3.5rem)] grid-cols-1 lg:grid-cols-2">
      <section className="flex flex-col gap-6 overflow-y-auto border-r border-border p-6">
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Client
          </label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <InputPanel value={source} onChange={setSource} />

        <ModelPicker value={model} onChange={setModel} />

        <PlatformPicker value={platforms} onChange={setPlatforms} />

        <button
          onClick={generate}
          disabled={!source || !platforms.length || isGenerating}
          className="mt-2 h-11 rounded-md bg-primary text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
        >
          {isGenerating ? "Generating…" : "Generate posts"}
        </button>

        {topError && (
          <p className="text-sm text-destructive">{topError}</p>
        )}
      </section>

      <PreviewPanel platforms={platforms} posts={postsByPlatform} />
    </div>
  );
}
