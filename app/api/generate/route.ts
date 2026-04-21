import { NextResponse, type NextRequest } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/src/db/client";
import { brandProfiles, clients, generations, posts } from "@/src/db/schema";
import { requireUser } from "@/src/auth/server";
import { getOrCreateWorkspaceForCurrentUser } from "@/src/auth/workspace";
import { ingest, type IngestInput } from "@/src/ingest";
import { streamPostForPlatform } from "@/src/llm/generate";
import { getPlatform, type PlatformId } from "@/src/platforms/registry";

export const runtime = "nodejs";
export const maxDuration = 120;

type Body = {
  clientId: string;
  source: IngestInput;
  platforms: PlatformId[];
  model?: string;
};

export async function POST(request: NextRequest) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = await getOrCreateWorkspaceForCurrentUser();
  const body = (await request.json()) as Body;

  if (!body.clientId || !body.source || !body.platforms?.length) {
    return NextResponse.json(
      { error: "clientId, source, and platforms are required" },
      { status: 400 },
    );
  }

  const client = await db.query.clients.findFirst({
    where: and(
      eq(clients.id, body.clientId),
      eq(clients.workspaceId, workspaceId),
    ),
  });
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const profile = await db.query.brandProfiles.findFirst({
    where: eq(brandProfiles.clientId, body.clientId),
    orderBy: [desc(brandProfiles.version)],
  });
  if (!profile) {
    return NextResponse.json(
      { error: "Client has no brand profile yet" },
      { status: 400 },
    );
  }

  const source = await ingest(body.source);

  const generation = await db
    .insert(generations)
    .values({
      workspaceId,
      clientId: body.clientId,
      brandProfileId: profile.id,
      sourceKind: source.meta.sourceKind,
      sourceRef: source.meta.sourceRef ?? null,
      extractedTitle: source.title,
      extractedByline: source.byline,
      extractedBodyMd: source.bodyMd,
      extractedMeta: source.meta,
      requestedPlatforms: body.platforms,
    })
    .returning({ id: generations.id });

  const generationId = generation[0].id;

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (event: object) =>
        controller.enqueue(enc.encode(JSON.stringify(event) + "\n"));

      send({ type: "generation.created", generationId });

      await Promise.all(
        body.platforms.map(async (platformId) => {
          const platform = getPlatform(platformId);
          send({ type: "post.started", platform: platformId });

          try {
            const { partialObjectStream, object } = streamPostForPlatform({
              source,
              brandProfile: profile,
              platform,
              modelId: body.model,
            });

            for await (const partial of partialObjectStream) {
              send({ type: "post.delta", platform: platformId, partial });
            }

            const finalObj = await object;
            await db.insert(posts).values({
              generationId,
              platform: platformId,
              content: finalObj,
            });

            send({ type: "post.completed", platform: platformId, post: finalObj });
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "Generation failed";
            console.error(`[generate] ${platformId} failed:`, err);
            send({ type: "post.error", platform: platformId, error: message });
          }
        }),
      );

      send({ type: "generation.completed" });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
