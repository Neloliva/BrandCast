"use server";

import { eq, and, desc } from "drizzle-orm";
import { db } from "@/src/db/client";
import { brandProfiles, clients } from "@/src/db/schema";
import { getOrCreateWorkspaceForCurrentUser } from "@/src/auth/workspace";

export async function listClients() {
  const workspaceId = await getOrCreateWorkspaceForCurrentUser();
  return db
    .select()
    .from(clients)
    .where(eq(clients.workspaceId, workspaceId))
    .orderBy(clients.name);
}

export async function createClient(name: string) {
  const workspaceId = await getOrCreateWorkspaceForCurrentUser();
  const [created] = await db
    .insert(clients)
    .values({ workspaceId, name })
    .returning();

  await db.insert(brandProfiles).values({
    clientId: created.id,
    version: 1,
  });

  return created;
}

export async function getActiveBrandProfile(clientId: string) {
  const workspaceId = await getOrCreateWorkspaceForCurrentUser();

  const client = await db.query.clients.findFirst({
    where: and(
      eq(clients.id, clientId),
      eq(clients.workspaceId, workspaceId),
    ),
  });
  if (!client) throw new Error("Client not found");

  return db.query.brandProfiles.findFirst({
    where: eq(brandProfiles.clientId, clientId),
    orderBy: [desc(brandProfiles.version)],
  });
}
