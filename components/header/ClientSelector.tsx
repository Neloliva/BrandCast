"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

type Client = { id: string; name: string };

const STORAGE_KEY = "brandcast.activeClientId";

export default function ClientSelector({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get("client");

  const [activeId, setActiveId] = useState<string | null>(fromUrl ?? null);

  useEffect(() => {
    if (!activeId) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && clients.some((c) => c.id === stored)) {
        setActiveId(stored);
      } else if (clients[0]) {
        setActiveId(clients[0].id);
      }
    }
  }, [activeId, clients]);

  function handleChange(id: string) {
    setActiveId(id);
    localStorage.setItem(STORAGE_KEY, id);
    router.refresh();
  }

  if (!clients.length) {
    return (
      <Link
        href="/clients/new"
        className="text-sm text-muted-foreground underline hover:text-foreground"
      >
        + Add a client
      </Link>
    );
  }

  return (
    <div className="relative">
      <select
        value={activeId ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        className="appearance-none rounded-md border border-border bg-background py-1.5 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}
