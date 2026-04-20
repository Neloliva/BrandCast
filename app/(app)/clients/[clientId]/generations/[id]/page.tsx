import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/src/db/client";
import { generations, posts } from "@/src/db/schema";
import { getOrCreateWorkspaceForCurrentUser } from "@/src/auth/workspace";
import { getPlatform, type PlatformId } from "@/src/platforms/registry";

export default async function GenerationReviewPage({
  params,
}: {
  params: Promise<{ clientId: string; id: string }>;
}) {
  const { clientId, id } = await params;
  const workspaceId = await getOrCreateWorkspaceForCurrentUser();

  const gen = await db.query.generations.findFirst({
    where: and(
      eq(generations.id, id),
      eq(generations.workspaceId, workspaceId),
      eq(generations.clientId, clientId),
    ),
  });
  if (!gen) notFound();

  const postRows = await db.query.posts.findMany({
    where: eq(posts.generationId, id),
  });

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        {gen.extractedTitle ?? "Untitled cast"}
      </h1>
      <p className="mt-1 text-xs text-muted-foreground">
        {gen.sourceKind === "url" && gen.sourceRef ? (
          <a href={gen.sourceRef} className="underline" target="_blank" rel="noreferrer">
            {gen.sourceRef}
          </a>
        ) : (
          gen.sourceKind
        )}
        {" · "}
        {new Date(gen.createdAt).toLocaleString()}
      </p>

      {postRows.length === 0 && (
        <div className="mt-8 rounded-md border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">No posts were generated.</p>
          <p className="mt-1">
            The source was ingested but the model did not return any posts.
            Try casting again, and if it keeps happening check the server
            logs — if the error mentions the model alias, set{" "}
            <code className="font-mono text-xs">ANTHROPIC_MODEL</code> in
            your env to one your account has access to.
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-4">
        {postRows.map((p) => {
          const platform = getPlatform(p.platform as PlatformId);
          const text = renderPost(p.content);
          return (
            <article
              key={p.id}
              className="rounded-lg border border-border bg-card text-card-foreground shadow-sm"
            >
              <header className="flex items-center justify-between border-b border-border px-4 py-3">
                <h3 className="text-sm font-semibold">{platform.displayName}</h3>
                <span className="text-xs text-muted-foreground">
                  {text.length} / {platform.hardCharLimit} · {p.status}
                </span>
              </header>
              <div className="space-y-3 px-4 py-3 text-sm leading-relaxed">
                {p.content.hook && <p className="font-semibold">{p.content.hook}</p>}
                {p.content.body && <p className="whitespace-pre-wrap">{p.content.body}</p>}
                {p.content.cta && <p className="text-muted-foreground">{p.content.cta}</p>}
                {p.content.hashtags?.length ? (
                  <p className="text-muted-foreground">
                    {p.content.hashtags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ")}
                  </p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}

function renderPost(p: {
  hook?: string;
  body?: string;
  cta?: string;
  hashtags?: string[];
}): string {
  return [
    p.hook,
    p.body,
    p.cta,
    p.hashtags?.length
      ? p.hashtags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ")
      : null,
  ]
    .filter(Boolean)
    .join("\n\n");
}
