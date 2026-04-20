"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/server/clients";

export default function NewClientPage() {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const created = await createClient(name);
    router.push(`/clients/${created.id}/brand`);
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold tracking-tight">New client</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Each client gets its own brand profile.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <input
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Client name"
          className="h-11 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={!name || busy}
          className="h-11 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40"
        >
          {busy ? "Creating…" : "Create client"}
        </button>
      </form>
    </main>
  );
}
