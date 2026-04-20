# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**BrandCast** transforms web pages, articles, and files into platform-ready social posts that match a client's brand voice. Target user: agency operators managing multiple clients.

## Commands

```bash
npm run dev          # Next.js dev server on :3000
npm run build        # Production build
npm run start        # Run built app
npm run lint         # Next/ESLint
npm run typecheck    # tsc --noEmit
npm run test         # Vitest (one-shot)
npm run test:watch   # Vitest in watch mode

# DB (requires DATABASE_URL)
npm run db:generate  # Generate SQL migrations from src/db/schema.ts
npm run db:migrate   # Apply migrations
npm run db:studio    # Drizzle Studio
```

Required env (see [.env.example](.env.example)): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`, `ANTHROPIC_API_KEY` (or another provider key + `LLM_PROVIDER`).

## Architecture (the parts that need reading multiple files to understand)

### Two pipelines own the system

1. **Ingest** ([src/ingest/](src/ingest/)) — `URL | File | text → ExtractedContent`. URL goes through Mozilla Readability + jsdom. Files dispatch by mime/extension to `pdf-parse`, `mammoth`, or raw read. The 10MB file cap lives in [src/ingest/file.ts](src/ingest/file.ts). Extraction results are persisted on the `Generation` row so regenerations don't re-fetch.

2. **Generation** ([src/llm/generate.ts](src/llm/generate.ts) + [app/api/generate/route.ts](app/api/generate/route.ts)) — for each requested platform, in parallel: compose `system = brandVoiceSection + platformSection`, `streamObject` with a Zod schema, write deltas to an NDJSON stream, persist the final `Post` row.

The compose-then-stream split is deliberate: platform prompts live in [src/platforms/registry.ts](src/platforms/registry.ts), brand-voice prompts in [src/llm/prompts/brand-voice.ts](src/llm/prompts/brand-voice.ts), and the generation call doesn't know what's in either — change voice rendering or platform rules without touching call sites.

### Email goes through Resend

[src/email/client.ts](src/email/client.ts) exposes `sendEmail({ to, subject, html, text?, replyTo? })`. The Resend client is lazy-instantiated so the module is safe to import in code paths that may not have `RESEND_API_KEY` set (e.g. dev). For Supabase magic-link emails, configure custom SMTP in the Supabase dashboard pointing at `smtp.resend.com` — the SDK helper is for app-originated email (notifications, summaries, invites), not auth emails.

### LLM provider is swappable

Everything goes through [src/llm/client.ts](src/llm/client.ts) (`defaultModel()`), which reads `LLM_PROVIDER` and returns a Vercel AI SDK `LanguageModel`. To add a provider: install `@ai-sdk/<provider>`, add a case in the switch.

### Outputs are structured, not freeform

Posts come back as `{ hook, body, cta?, hashtags? }` validated by [src/llm/schemas.ts](src/llm/schemas.ts) (`PostOutputSchema`). The UI ([components/compose/PostCard.tsx](components/compose/PostCard.tsx)) renders each field separately and computes char counts against per-platform `softCharTarget` / `hardCharLimit`. Don't switch to freeform string outputs — the UI depends on the structure.

### Brand profiles are versioned

Editing a profile inserts a *new row* with `version + 1` ([src/server/brand.ts](src/server/brand.ts)). `Generation` rows reference a specific `brandProfileId`, so historical posts stay reproducible against the brand they were created with. When loading "the brand" for new generation, always sort `desc(version)` and take the first.

### Multi-tenancy

`Workspace → Membership(user) → Client → BrandProfile/Generation/Post` ([src/db/schema.ts](src/db/schema.ts)). Every domain table carries `workspace_id`. Server code resolves workspace via [src/auth/workspace.ts](src/auth/workspace.ts) (`getOrCreateWorkspaceForCurrentUser`) — **never** trust a workspace id from the request body. RLS on Supabase is the second line of defense; add it before going to production.

### Streaming protocol (compose page ↔ /api/generate)

Server emits NDJSON events: `generation.created`, `post.started`, `post.delta` (with partial object), `post.completed` (with final), `generation.completed`. Client ([components/compose/ComposeRoot.tsx](components/compose/ComposeRoot.tsx)) updates per-platform state by these events. Adding a new event type means updating both ends.

### Compose UI shape

Split-screen by design: left = input + controls ([components/compose/InputPanel.tsx](components/compose/InputPanel.tsx), [PlatformPicker.tsx](components/compose/PlatformPicker.tsx)), right = live previews ([PreviewPanel.tsx](components/compose/PreviewPanel.tsx) + one [PostCard.tsx](components/compose/PostCard.tsx) per platform). The header (`app/(app)/layout.tsx`) hosts the cross-page client selector.

### Route groups

- `app/(app)/*` — authenticated app shell (header, client selector). Protected by [middleware.ts](middleware.ts).
- `app/login/*`, `app/api/auth/callback` — auth flow, public.
- `app/api/ingest`, `app/api/generate` — server endpoints; both require auth.

## Conventions worth knowing

- Path alias `@/*` resolves to repo root (e.g. `@/src/db/client`, `@/components/...`).
- Server-only modules live under `src/server/*` and `src/auth/*`. Browser code never imports from them.
- Drizzle JSONB columns use `$type<...>` for compile-time type safety; the runtime defaults are SQL literals — don't rely on Drizzle to coerce missing keys.
- Next 15 dynamic route params are `Promise`-typed: `params: Promise<{ id: string }>` then `await params`.
