import assert from "node:assert";
import { describe, it } from "node:test";
import { detectMentions, extractUrls } from "../src/lib/detection/index.ts";

const text = `Here are some solid options:

1. Acme Analytics - clean interface, strong reporting. Details: https://acme.com/docs
2. Rival CRM - popular with larger teams, though pricier. See https://rivalcrm.com and https://blog.acme.com/guide

Overall Acme is the safer pick.`;

function run(overrides: Partial<Parameters<typeof detectMentions>[0]>) {
  return detectMentions({
    text,
    brandAliases: ["Acme Analytics", "Acme"],
    ownDomain: "acme.com",
    competitors: [
      { id: "c1", aliases: ["Rival CRM", "Rival"] },
      { id: "c2", aliases: ["Zeta Tools"] },
    ],
    ...overrides,
  });
}

describe("detectMentions", () => {
  it("finds the brand and its position", () => {
    const r = run({});
    assert.strictEqual(r.mentioned, true);
    assert.ok(r.mentionPosition !== null && r.mentionPosition > 0 && r.mentionPosition < 0.6);
  });

  it("counts own-domain and subdomain citations, but not lookalike domains", () => {
    const r = run({});
    assert.strictEqual(r.citedOwnDomain, true);
    assert.strictEqual(
      run({ text: "see https://notacme.com", brandAliases: ["acme"], competitors: [] }).citedOwnDomain,
      false,
    );
  });

  it("tracks competitor mentions", () => {
    const r = run({});
    assert.deepStrictEqual(r.competitorMentions, { c1: true, c2: false });
  });

  it("handles absence, plurals, and word boundaries", () => {
    const none = run({ text: "Nothing relevant here at all." });
    assert.strictEqual(none.mentioned, false);
    assert.strictEqual(none.mentionPosition, null);

    assert.strictEqual(
      run({ text: "try Acmes tools", brandAliases: ["Acme"], competitors: [] }).mentioned,
      true,
    );
    assert.strictEqual(
      run({ text: "classic sacme reference", brandAliases: ["Acme"], competitors: [] }).mentioned,
      false,
    );
  });
});

describe("extractUrls", () => {
  it("extracts and deduplicates urls", () => {
    assert.deepStrictEqual(extractUrls("a https://x.io/a b https://x.io/a"), ["https://x.io/a"]);
  });
});
