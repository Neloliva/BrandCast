"use client";

import { useState } from "react";
import { Copy, Check, Loader2 } from "lucide-react";
import type { PlatformSpec } from "@/src/platforms/registry";
import type { PostState } from "./ComposeRoot";

export default function PostCard({
  platform,
  state,
}: {
  platform: PlatformSpec;
  state: PostState;
}) {
  const post = state.final ?? state.partial;
  const text = post ? renderPost(post) : "";
  const charCount = text.length;
  const overSoft = charCount > platform.softCharTarget;
  const overHard = charCount > platform.hardCharLimit;

  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <article className="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{platform.displayName}</h3>
          {state.status === "streaming" && (
            <Loader2 size={14} className="animate-spin text-muted-foreground" />
          )}
          {state.status === "done" && (
            <Check size={14} className="text-green-600" />
          )}
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span
            className={
              overHard
                ? "font-medium text-destructive"
                : overSoft
                  ? "text-amber-600"
                  : "text-muted-foreground"
            }
          >
            {charCount} / {platform.hardCharLimit}
          </span>
          <button
            onClick={copy}
            disabled={!text}
            className="inline-flex items-center gap-1 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
            aria-label="Copy"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </header>
      <div className="px-4 py-3">
        {!post && state.status === "idle" && (
          <p className="text-sm italic text-muted-foreground">
            Waiting to generate…
          </p>
        )}
        {post && (
          <div className="space-y-3 text-sm leading-relaxed">
            {post.hook && (
              <p className="font-semibold">{post.hook}</p>
            )}
            {post.body && (
              <p className="whitespace-pre-wrap">{post.body}</p>
            )}
            {post.cta && (
              <p className="text-muted-foreground">{post.cta}</p>
            )}
            {post.hashtags && post.hashtags.length > 0 && (
              <p className="text-muted-foreground">
                {post.hashtags.map(formatHashtag).join(" ")}
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function renderPost(p: { hook?: string; body?: string; cta?: string; hashtags?: string[] }): string {
  const parts: string[] = [];
  if (p.hook) parts.push(p.hook);
  if (p.body) parts.push(p.body);
  if (p.cta) parts.push(p.cta);
  if (p.hashtags?.length) parts.push(p.hashtags.map(formatHashtag).join(" "));
  return parts.join("\n\n");
}

function formatHashtag(t: string): string {
  return t.startsWith("#") ? t : `#${t}`;
}
