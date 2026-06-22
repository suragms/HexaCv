/** Shared validation helpers for parsing and AI rewrite — keeps only genuine document content */

const PLACEHOLDER_PATTERNS = [
  /^(organization|institution|issuer|company|previous employer|state university)$/i,
  /^(professional role|professional associate|professional candidate|degree|field of study)$/i,
  /^(location unknown|candidate name|extracted skills)$/i,
  /^(not provided|n\/a|tbd|unknown)$/i,
];

export const AI_GENERATED_PHRASES = [
  /contributed to core projects/i,
  /collaborated across cross-functional/i,
  /experienced professional looking/i,
  /results-driven and highly motivated/i,
  /proven track record of designing scalable/i,
  /responsible for execution and delivery/i,
  /general studies/i,
  /applied science/i,
  /bachelor degree$/i,
  /leveraged synergies/i,
  /spearheaded initiatives/i,
  /dynamic and detail-oriented/i,
  /passionate about delivering/i,
  /thought leader/i,
  /game.?changer/i,
  /synergy/i,
  /rockstar/i,
  /ninja/i,
  /guru/i,
];

export function normalizeForMatch(text: string): string {
  return (text || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isPlaceholderText(text: string): boolean {
  const trimmed = (text || "").trim();
  if (!trimmed) return true;
  return PLACEHOLDER_PATTERNS.some((p) => p.test(trimmed));
}

export function isAiGeneratedPhrase(text: string): boolean {
  return AI_GENERATED_PHRASES.some((p) => p.test(text || ""));
}

/** Check if extracted text is grounded in the original source document */
export function textGroundedInSource(
  fragment: string,
  sourceText: string,
  threshold = 0.55
): boolean {
  const normFragment = normalizeForMatch(fragment);
  const normSource = normalizeForMatch(sourceText);
  if (!normFragment || normFragment.length < 4) return true;
  if (normSource.includes(normFragment)) return true;

  const words = normFragment.split(" ").filter((w) => w.length > 2);
  if (words.length === 0) return true;

  const matchCount = words.filter((w) => normSource.includes(w)).length;
  return matchCount / words.length >= threshold;
}

export function wordOverlapRatio(original: string, candidate: string): number {
  const origWords = normalizeForMatch(original).split(" ").filter((w) => w.length > 2);
  const candWords = normalizeForMatch(candidate).split(" ").filter((w) => w.length > 2);
  if (origWords.length === 0) return 1;
  const overlap = origWords.filter((w) => candWords.includes(w)).length;
  return overlap / origWords.length;
}

/** Ensure rewritten text stays grounded in the original — reject AI filler */
export function filterGroundedRewrite(original: string, rewritten: string, minOverlap = 0.2): string {
  const candidate = (rewritten || "").trim();
  if (!candidate) return original;
  if (isAiGeneratedPhrase(candidate) && !isAiGeneratedPhrase(original)) return original;
  if (wordOverlapRatio(original, candidate) < minOverlap) return original;
  return candidate;
}

/** Ensure rewritten bullets stay grounded in the originals — same count, no new facts */
export function filterGroundedBullets(originals: string[], rewritten: string[]): string[] {
  if (originals.length === 0) return [];
  const padded =
    rewritten.length === originals.length
      ? rewritten
      : originals.map((orig, i) => rewritten[i] ?? orig);

  return originals.map((original, i) =>
    filterGroundedRewrite(original, padded[i] || original, 0.25)
  );
}
