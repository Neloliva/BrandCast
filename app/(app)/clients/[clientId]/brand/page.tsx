import { notFound } from "next/navigation";
import { getActiveBrandProfile } from "@/src/server/clients";
import BrandEditor from "@/components/brand/BrandEditor";

export default async function BrandPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const profile = await getActiveBrandProfile(clientId);
  if (!profile) notFound();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Brand profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Version {profile.version} · saving creates a new version (older
        generations stay pinned to their original).
      </p>
      <div className="mt-8">
        <BrandEditor clientId={clientId} initial={profile} />
      </div>
    </main>
  );
}
