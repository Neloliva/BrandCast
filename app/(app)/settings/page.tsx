import Link from "next/link";
import { getCurrentUser } from "@/src/auth/server";
import { listClients } from "@/src/server/clients";

export default async function SettingsPage() {
  const [user, clients] = await Promise.all([getCurrentUser(), listClients()]);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Account
        </h2>
        <div className="rounded-md border border-border bg-card p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Signed in as</span>
            <span className="font-medium">{user?.email ?? "—"}</span>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Clients
        </h2>
        {clients.length === 0 ? (
          <p className="text-sm text-muted-foreground">No clients yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {clients.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between p-4 text-sm"
              >
                <span className="font-medium">{c.name}</span>
                <Link
                  href={`/clients/${c.id}/brand`}
                  className="text-muted-foreground underline hover:text-foreground"
                >
                  Edit brand
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
