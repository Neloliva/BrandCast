import { eq } from "drizzle-orm";
import { db } from "@/src/db/client";
import { memberships, workspaces } from "@/src/db/schema";
import { requireUser } from "./server";

export async function getOrCreateWorkspaceForCurrentUser() {
  const user = await requireUser();

  const existing = await db
    .select({ workspaceId: memberships.workspaceId })
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .limit(1);

  if (existing[0]) {
    return existing[0].workspaceId;
  }

  const inserted = await db
    .insert(workspaces)
    .values({ name: user.email ?? "My Workspace" })
    .returning({ id: workspaces.id });

  const workspaceId = inserted[0].id;

  await db.insert(memberships).values({
    workspaceId,
    userId: user.id,
    role: "owner",
  });

  return workspaceId;
}
