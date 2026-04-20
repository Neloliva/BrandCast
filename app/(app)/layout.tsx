import Link from "next/link";
import { Settings } from "lucide-react";
import { listClients } from "@/src/server/clients";
import ClientSelector from "@/components/header/ClientSelector";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clients = await listClients();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-base font-semibold tracking-tight">
            BrandCast
          </Link>
          <nav className="hidden gap-4 text-sm text-muted-foreground md:flex">
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/new" className="hover:text-foreground">
              New cast
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ClientSelector clients={clients} />
          <Link
            href="/settings"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Settings"
          >
            <Settings size={18} />
          </Link>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
