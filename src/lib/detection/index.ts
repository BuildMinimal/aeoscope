export interface DetectionCompetitor {
  id: string;
  aliases: string[];
}

export interface DetectionInput {
  text: string;
  /** Brand name plus its aliases, e.g. ["Acme Analytics", "Acme"]. */
  brandAliases: string[];
  ownDomain?: string | null;
  competitors: DetectionCompetitor[];
  /** Structured citations reported by the engine adapter, if any. */
  adapterCitations?: string[];
}

export interface DetectionOutput {
  mentioned: boolean;
  /** Relative position of the first brand mention, 0 = start, 1 = end. */
  mentionPosition: number | null;
  citations: string[];
  citedOwnDomain: boolean;
  competitorMentions: Record<string, boolean>;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Builds a case-insensitive matcher for an alias: word-bounded, with an
 * optional trailing plural so "Acme" also matches "Acmes".
 */
function aliasRegExp(alias: string): RegExp {
  const escaped = escapeRegExp(alias.trim());
  return new RegExp(`\\b${escaped}(?:es|s)?\\b`, "i");
}

/** Returns the lowest index at which any alias occurs, or -1. */
function firstAliasIndex(text: string, aliases: string[]): number {
  let lowest = -1;
  for (const alias of aliases) {
    if (!alias.trim()) continue;
    const m = aliasRegExp(alias).exec(text);
    if (m && (lowest === -1 || m.index < lowest)) lowest = m.index;
  }
  return lowest;
}

const URL_REGEXP = /https?:\/\/[^\s)>\]}"']+/g;

export function extractUrls(text: string): string[] {
  return [...new Set(text.match(URL_REGEXP) ?? [])];
}

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** True when the citation host is the given domain or a subdomain of it. */
function isDomainOrSubdomain(url: string, domain: string): boolean {
  const host = hostnameOf(url);
  if (!host) return false;
  const d = domain.toLowerCase().replace(/^www\./, "").replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  return host === d || host.endsWith(`.${d}`);
}

export function detectMentions(input: DetectionInput): DetectionOutput {
  const { text, brandAliases, ownDomain, competitors } = input;

  const citations = [
    ...new Set([...(input.adapterCitations ?? []), ...extractUrls(text)]),
  ];

  const brandIdx = firstAliasIndex(text, brandAliases);
  const mentioned = brandIdx >= 0;
  const mentionPosition = mentioned && text.length > 0 ? brandIdx / text.length : null;

  const citedOwnDomain = Boolean(
    ownDomain && citations.some((u) => isDomainOrSubdomain(u, ownDomain)),
  );

  const competitorMentions: Record<string, boolean> = {};
  for (const c of competitors) {
    competitorMentions[c.id] = firstAliasIndex(text, c.aliases) >= 0;
  }

  return { mentioned, mentionPosition, citations, citedOwnDomain, competitorMentions };
}
