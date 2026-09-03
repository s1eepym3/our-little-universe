/**
 * Tag Normalization & Utility ("Stiker Rasa")
 */

export const MAX_TAGS_PER_MOMENT = 5;

/**
 * Normalizes a single tag:
 * - lowercase
 * - trim
 * - strip leading '#' or '@'
 * - collapse multiple internal whitespaces to a single space
 * - max 24 characters
 */
export function normalizeTag(input: string): string {
  if (!input) return "";

  return input
    .toLowerCase()
    .trim()
    .replace(/^[#@]+/, "") // strip leading # or @
    .replace(/\s+/g, " ") // collapse internal whitespace
    .slice(0, 24)
    .trim();
}

/**
 * Cleans an array of tags:
 * - normalizes each tag
 * - removes empties
 * - prevents case-insensitive duplicates
 * - limits to MAX_TAGS_PER_MOMENT (5)
 */
export function cleanTags(tags: (string | null | undefined)[]): string[] {
  if (!Array.isArray(tags)) return [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of tags) {
    if (!raw) continue;
    const normalized = normalizeTag(raw);
    if (!normalized) continue;

    if (!seen.has(normalized)) {
      seen.add(normalized);
      result.push(normalized);
      if (result.length >= MAX_TAGS_PER_MOMENT) break;
    }
  }

  return result;
}

/**
 * Aggregates all tags from a list of moments or tag arrays,
 * returning distinct tags sorted by frequency descending.
 */
export function getTagFrequencies(
  momentsWithTags: Array<{ tags?: string[] | null }>
): Array<{ tag: string; count: number }> {
  const map = new Map<string, number>();

  for (const m of momentsWithTags) {
    if (!m.tags || !Array.isArray(m.tags)) continue;
    for (const t of m.tags) {
      const normalized = normalizeTag(t);
      if (!normalized) continue;
      map.set(normalized, (map.get(normalized) || 0) + 1);
    }
  }

  return Array.from(map.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
