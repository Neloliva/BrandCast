"use client";

import { getPlatform, type PlatformId } from "@/src/platforms/registry";
import PostCard from "./PostCard";
import type { PostState } from "./ComposeRoot";

export default function PreviewPanel({
  platforms,
  posts,
}: {
  platforms: PlatformId[];
  posts: Record<PlatformId, PostState>;
}) {
  if (!platforms.length) {
    return (
      <section className="flex items-center justify-center p-6 text-sm text-muted-foreground">
        Pick at least one platform to see live previews here.
      </section>
    );
  }

  return (
    <section className="overflow-y-auto bg-muted/20 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          Live preview
        </h2>
      </div>
      <div className="grid gap-4">
        {platforms.map((id) => (
          <PostCard
            key={id}
            platform={getPlatform(id)}
            state={posts[id] ?? { status: "idle" }}
          />
        ))}
      </div>
    </section>
  );
}
