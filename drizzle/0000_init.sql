CREATE TABLE "competitors" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"aliases" text[] DEFAULT '{}' NOT NULL,
	"domain" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_sets" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"schedule" text,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompts" (
	"id" text PRIMARY KEY NOT NULL,
	"prompt_set_id" text NOT NULL,
	"text" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "runs" (
	"id" text PRIMARY KEY NOT NULL,
	"prompt_id" text NOT NULL,
	"prompt_set_id" text,
	"engine" text NOT NULL,
	"model" text,
	"status" text DEFAULT 'success' NOT NULL,
	"error" text,
	"prompt_text" text NOT NULL,
	"response_text" text,
	"mentioned" boolean,
	"mention_position" double precision,
	"citations" text[] DEFAULT '{}' NOT NULL,
	"cited_own_domain" boolean,
	"competitor_mentions" jsonb,
	"latency_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" text PRIMARY KEY NOT NULL,
	"brand_name" text DEFAULT '' NOT NULL,
	"brand_aliases" text[] DEFAULT '{}' NOT NULL,
	"domain" text,
	"enabled_engines" text[] DEFAULT '{}' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_prompt_set_id_prompt_sets_id_fk" FOREIGN KEY ("prompt_set_id") REFERENCES "public"."prompt_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "runs_engine_created_idx" ON "runs" USING btree ("engine","created_at");--> statement-breakpoint
CREATE INDEX "runs_prompt_created_idx" ON "runs" USING btree ("prompt_id","created_at");--> statement-breakpoint
CREATE INDEX "runs_set_created_idx" ON "runs" USING btree ("prompt_set_id","created_at");