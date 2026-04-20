import type { brandProfiles } from "@/src/db/schema";

type BrandProfile = typeof brandProfiles.$inferSelect;

export function brandVoiceSection(profile: BrandProfile): string {
  const lines: string[] = ["## Brand Voice"];

  if (profile.toneDescriptors.length) {
    lines.push(`**Tone:** ${profile.toneDescriptors.join(", ")}`);
  }

  if (profile.readingLevel) {
    lines.push(`**Reading level:** ${profile.readingLevel}`);
  }

  if (profile.doRules.length) {
    lines.push("\n**Do:**");
    for (const r of profile.doRules) lines.push(`- ${r}`);
  }

  if (profile.dontRules.length) {
    lines.push("\n**Don't:**");
    for (const r of profile.dontRules) lines.push(`- ${r}`);
  }

  if (profile.vocabulary.preferred.length) {
    lines.push(
      `\n**Prefer these words:** ${profile.vocabulary.preferred.join(", ")}`,
    );
  }
  if (profile.vocabulary.banned.length) {
    lines.push(
      `**Never use:** ${profile.vocabulary.banned.join(", ")}`,
    );
  }

  lines.push(`\n**Emoji policy:** ${profile.emojiPolicy}`);
  lines.push(`**Link policy:** ${profile.linkPolicy}`);

  const contactBits: string[] = [];
  if (profile.contact?.phone) contactBits.push(`Phone: ${profile.contact.phone}`);
  if (profile.contact?.website) contactBits.push(`Website: ${profile.contact.website}`);
  if (profile.contact?.email) contactBits.push(`Email: ${profile.contact.email}`);
  if (contactBits.length) {
    lines.push("\n**Contact details (use in CTAs when natural, respect each platform's link policy):**");
    for (const c of contactBits) lines.push(`- ${c}`);
  }

  if (profile.voiceExamples.good.length) {
    lines.push("\n**Examples that sound like us:**");
    for (const ex of profile.voiceExamples.good) {
      lines.push(`> ${ex.title}\n> ${truncate(ex.text, 400)}`);
    }
  }

  if (profile.voiceExamples.bad.length) {
    lines.push("\n**Examples that do NOT sound like us:**");
    for (const ex of profile.voiceExamples.bad) {
      const why = ex.why ? ` _(why: ${ex.why})_` : "";
      lines.push(`> ${ex.title}${why}\n> ${truncate(ex.text, 400)}`);
    }
  }

  return lines.join("\n");
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}
