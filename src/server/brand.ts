"use server";

import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/src/db/client";
import { brandProfiles, clients } from "@/src/db/schema";
import { getOrCreateWorkspaceForCurrentUser } from "@/src/auth/workspace";

type BrandProfileInput = Omit<
  typeof brandProfiles.$inferInsert,
  "id" | "clientId" | "version" | "createdAt"
>;

export async function saveBrandProfile(
  clientId: string,
  input: BrandProfileInput,
) {
  const workspaceId = await getOrCreateWorkspaceForCurrentUser();

  const client = await db.query.clients.findFirst({
    where: and(
      eq(clients.id, clientId),
      eq(clients.workspaceId, workspaceId),
    ),
  });
  if (!client) throw new Error("Client not found");

  const latest = await db.query.brandProfiles.findFirst({
    where: eq(brandProfiles.clientId, clientId),
    orderBy: [desc(brandProfiles.version)],
  });

  const nextVersion = (latest?.version ?? 0) + 1;

  const [inserted] = await db
    .insert(brandProfiles)
    .values({ clientId, version: nextVersion, ...input })
    .returning();

  revalidatePath(`/clients/${clientId}/brand`);
  return inserted;
}
