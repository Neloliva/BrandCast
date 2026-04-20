import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/src/db/client";
import { clients, generations } from "@/src/db/schema";
import { getOrCreateWorkspaceForCurrentUser } from "@/src/auth/workspace";

export default async function DashboardPage() {
  const workspaceId = await getOrCreateWorkspaceForCurrentUser();

  const [clientList, recent] = await Promise.all([
    db.select().from(clients).where(eq(clients.workspaceId, workspaceId)),
    db
      .select({
        id: generations.id,
        clientId: generations.clientId,
        createdAt: generations.createdAt,
        title: generations.extractedTitle,
        platforms: generations.requestedPlatforms,
      })
      .from(generations)
      .where(eq(generations.workspaceId, workspaceId))
      .orderBy(desc(generations.createdAt))
      .limit(20),
  ]);

  const clientById = Object.fromEntries(clientList.map((c) => [c.id, c]));

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <Link
          href="/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          New cast
        </Link>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Clients
          </h2>
          <Link
            href="/clients/new"
            className="text-sm text-muted-foreground underline hover:text-foreground"
          >
            + New client
          </Link>
        </div>
        {clientList.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No clients yet. Add one to start casting.
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {clientList.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/clients/${c.id}/brand`}
                  className="block rounded-md border border-border bg-card p-4 hover:bg-muted"
                >
                  <p className="font-medium">{c.name}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Recent casts
        </h2>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing here yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {recent.map((g) => (
              <li key={g.id}>
                <Link
                  href={`/clients/${g.clientId}/generations/${g.id}`}
                  className="flex items-center justify-between p-4 hover:bg-muted"
                >
                  <div>
                    <p className="font-medium">
                      {g.title ?? "Untitled"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {clientById[g.clientId]?.name ?? "Unknown client"} ·{" "}
                      {(g.platforms ?? []).join(", ")}
                    </p>
                  </div>
                  <time className="text-xs text-muted-foreground">
                    {new Date(g.createdAt).toLocaleString()}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
