import { redirect } from "next/navigation";
import { listClients } from "@/src/server/clients";
import ComposeRoot from "@/components/compose/ComposeRoot";

export default async function NewCastPage() {
  const clients = await listClients();
  if (!clients.length) {
    redirect("/clients/new?reason=needs-first-client");
  }
  return <ComposeRoot clients={clients} />;
}
