import {
  pgTable,
  text,
  boolean,
  integer,
  doublePrecision,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

/** Singleton row holding the brand configuration for this instance. */
export const settings = pgTable("settings", {
  id: id(),
  brandName: text("brand_name").notNull().default(""),
  brandAliases: text("brand_aliases").array().notNull().default([]),
  domain: text("domain"),
  enabledEngines: text("enabled_engines").array().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const competitors = pgTable("competitors", {
  id: id(),
  name: text("name").notNull(),
  aliases: text("aliases").array().notNull().default([]),
  domain: text("domain"),
  createdAt: createdAt(),
});

export const promptSets = pgTable("prompt_sets", {
  id: id(),
  name: text("name").notNull(),
  description: text("description"),
  /** Optional cron expression. When set, the scheduler runs this set automatically. */
  schedule: text("schedule"),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: createdAt(),
});

export const prompts = pgTable("prompts", {
  id: id(),
  promptSetId: text("prompt_set_id")
    .notNull()
    .references(() => promptSets.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  position: integer("position").notNull().default(0),
  createdAt: createdAt(),
});

/**
 * One AI answer to one prompt on one engine.
 * promptId/promptSetId are plain strings (no FK) so run history survives
 * deletion of the prompt or set that produced it.
 */
export const runs = pgTable(
  "runs",
  {
    id: id(),
    promptId: text("prompt_id").notNull(),
    promptSetId: text("prompt_set_id"),
    engine: text("engine").notNull(),
    model: text("model"),
    status: text("status").notNull().default("success"), // success | error
    error: text("error"),
    promptText: text("prompt_text").notNull(),
    responseText: text("response_text"),
    mentioned: boolean("mentioned"),
    /** Relative position (0..1) of the first brand mention in the response. */
    mentionPosition: doublePrecision("mention_position"),
    citations: text("citations").array().notNull().default([]),
    citedOwnDomain: boolean("cited_own_domain"),
    /** Map of competitor id -> mentioned boolean. */
    competitorMentions: jsonb("competitor_mentions"),
    latencyMs: integer("latency_ms"),
    createdAt: createdAt(),
  },
  (t) => [
    index("runs_engine_created_idx").on(t.engine, t.createdAt),
    index("runs_prompt_created_idx").on(t.promptId, t.createdAt),
    index("runs_set_created_idx").on(t.promptSetId, t.createdAt),
  ],
);

export type Settings = typeof settings.$inferSelect;
export type Competitor = typeof competitors.$inferSelect;
export type PromptSet = typeof promptSets.$inferSelect;
export type Prompt = typeof prompts.$inferSelect;
export type Run = typeof runs.$inferSelect;
