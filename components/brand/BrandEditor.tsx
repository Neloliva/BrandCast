"use client";

import { useState, useTransition } from "react";
import { saveBrandProfile } from "@/src/server/brand";
import type { brandProfiles } from "@/src/db/schema";

type Profile = typeof brandProfiles.$inferSelect;

export default function BrandEditor({
  clientId,
  initial,
}: {
  clientId: string;
  initial: Profile;
}) {
  const [tone, setTone] = useState(initial.toneDescriptors.join(", "));
  const [readingLevel, setReadingLevel] = useState(initial.readingLevel ?? "");
  const [doRules, setDoRules] = useState(initial.doRules.join("\n"));
  const [dontRules, setDontRules] = useState(initial.dontRules.join("\n"));
  const [preferred, setPreferred] = useState(
    initial.vocabulary.preferred.join(", "),
  );
  const [banned, setBanned] = useState(initial.vocabulary.banned.join(", "));
  const [emojiPolicy, setEmojiPolicy] = useState(initial.emojiPolicy);
  const [linkPolicy, setLinkPolicy] = useState(initial.linkPolicy);
  const [goodExamples, setGoodExamples] = useState(
    JSON.stringify(initial.voiceExamples.good, null, 2),
  );
  const [badExamples, setBadExamples] = useState(
    JSON.stringify(initial.voiceExamples.bad, null, 2),
  );

  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    let goodParsed: { title: string; text: string }[];
    let badParsed: { title: string; text: string; why?: string }[];
    try {
      goodParsed = JSON.parse(goodExamples || "[]");
      badParsed = JSON.parse(badExamples || "[]");
    } catch (e) {
      setError(`Invalid JSON in examples: ${(e as Error).message}`);
      return;
    }

    startTransition(async () => {
      try {
        await saveBrandProfile(clientId, {
          toneDescriptors: splitCsv(tone),
          readingLevel: readingLevel || null,
          doRules: splitLines(doRules),
          dontRules: splitLines(dontRules),
          vocabulary: {
            preferred: splitCsv(preferred),
            banned: splitCsv(banned),
          },
          emojiPolicy,
          linkPolicy,
          voiceExamples: { good: goodParsed, bad: badParsed },
        });
        setSavedAt(new Date().toLocaleTimeString());
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Field label="Tone descriptors (comma-separated)">
        <input
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          placeholder="warm, authoritative, plainspoken"
          className="input"
        />
      </Field>

      <Field label="Reading level (optional)">
        <input
          value={readingLevel}
          onChange={(e) => setReadingLevel(e.target.value)}
          placeholder="general adult"
          className="input"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Do rules (one per line)">
          <textarea
            rows={5}
            value={doRules}
            onChange={(e) => setDoRules(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Don't rules (one per line)">
          <textarea
            rows={5}
            value={dontRules}
            onChange={(e) => setDontRules(e.target.value)}
            className="input"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Preferred vocabulary (comma-separated)">
          <input
            value={preferred}
            onChange={(e) => setPreferred(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Banned vocabulary (comma-separated)">
          <input
            value={banned}
            onChange={(e) => setBanned(e.target.value)}
            className="input"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Emoji policy">
          <select
            value={emojiPolicy}
            onChange={(e) =>
              setEmojiPolicy(e.target.value as Profile["emojiPolicy"])
            }
            className="input"
          >
            <option value="none">None</option>
            <option value="sparing">Sparing</option>
            <option value="liberal">Liberal</option>
          </select>
        </Field>
        <Field label="Link policy">
          <select
            value={linkPolicy}
            onChange={(e) =>
              setLinkPolicy(e.target.value as Profile["linkPolicy"])
            }
            className="input"
          >
            <option value="inline">Inline</option>
            <option value="end_of_post">End of post</option>
            <option value="first_comment">First comment</option>
          </select>
        </Field>
      </div>

      <Field label='"Sounds like us" examples (JSON: [{"title":"...","text":"..."}])'>
        <textarea
          rows={6}
          value={goodExamples}
          onChange={(e) => setGoodExamples(e.target.value)}
          className="input font-mono text-xs"
        />
      </Field>

      <Field label='"Doesn&apos;t sound like us" examples (JSON: [{"title":"...","text":"...","why":"..."}])'>
        <textarea
          rows={6}
          value={badExamples}
          onChange={(e) => setBadExamples(e.target.value)}
          className="input font-mono text-xs"
        />
      </Field>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={pending}
          className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40"
        >
          {pending ? "Saving…" : "Save new version"}
        </button>
        {savedAt && (
          <span className="text-xs text-muted-foreground">Saved at {savedAt}</span>
        )}
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid hsl(var(--border));
          background: hsl(var(--background));
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
        }
        :global(.input:focus) {
          outline: none;
          box-shadow: 0 0 0 2px hsl(var(--ring));
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function splitCsv(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function splitLines(s: string): string[] {
  return s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}
