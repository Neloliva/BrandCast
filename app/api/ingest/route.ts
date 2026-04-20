import { NextResponse, type NextRequest } from "next/server";
import { ingest } from "@/src/ingest";
import { requireUser } from "@/src/auth/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "Missing file" }, { status: 400 });
      }
      const extracted = await ingest({ kind: "file", file });
      return NextResponse.json(extracted);
    }

    const body = await request.json();

    if (typeof body.url === "string" && body.url.length > 0) {
      const extracted = await ingest({ kind: "url", url: body.url });
      return NextResponse.json(extracted);
    }

    if (typeof body.text === "string" && body.text.length > 0) {
      const extracted = await ingest({
        kind: "text",
        title: body.title,
        text: body.text,
      });
      return NextResponse.json(extracted);
    }

    return NextResponse.json({ error: "Provide url, text, or file." }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ingest failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
