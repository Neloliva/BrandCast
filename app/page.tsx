import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <div>
        <h1 className="text-5xl font-semibold tracking-tight">BrandCast</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Drop in an article, URL, or file. Pick a client. Get on-brand,
          platform-ready social posts in seconds.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/new"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Start a new cast
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Dashboard
        </Link>
      </div>
    </main>
  );
}
