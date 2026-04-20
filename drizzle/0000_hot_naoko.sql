CREATE TYPE "public"."emoji_policy" AS ENUM('none', 'sparing', 'liberal');--> statement-breakpoint
CREATE TYPE "public"."link_policy" AS ENUM('inline', 'end_of_post', 'first_comment');--> statement-breakpoint
CREATE TYPE "public"."platform_id" AS ENUM('linkedin', 'twitter', 'instagram', 'facebook', 'threads');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('draft', 'approved', 'published');--> statement-breakpoint
CREATE TYPE "public"."source_kind" AS ENUM('url', 'file', 'text');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "brand_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"tone_descriptors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"reading_level" text,
	"voice_examples" jsonb DEFAULT '{"good":[],"bad":[]}'::jsonb NOT NULL,
	"do_rules" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"dont_rules" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"vocabulary" jsonb DEFAULT '{"preferred":[],"banned":[]}'::jsonb NOT NULL,
	"emoji_policy" "emoji_policy" DEFAULT 'sparing' NOT NULL,
	"link_policy" "link_policy" DEFAULT 'inline' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"brand_profile_id" uuid NOT NULL,
	"source_kind" "source_kind" NOT NULL,
	"source_ref" text,
	"extracted_title" text,
	"extracted_byline" text,
	"extracted_body_md" text,
	"extracted_meta" jsonb DEFAULT '{}'::jsonb,
	"requested_platforms" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'owner' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"generation_id" uuid NOT NULL,
	"platform" "platform_id" NOT NULL,
	"content" jsonb NOT NULL,
	"status" "post_status" DEFAULT 'draft' NOT NULL,
	"revisions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "brand_profiles" ADD CONSTRAINT "brand_profiles_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clients" ADD CONSTRAINT "clients_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generations" ADD CONSTRAINT "generations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generations" ADD CONSTRAINT "generations_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generations" ADD CONSTRAINT "generations_brand_profile_id_brand_profiles_id_fk" FOREIGN KEY ("brand_profile_id") REFERENCES "public"."brand_profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "memberships" ADD CONSTRAINT "memberships_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_generation_id_generations_id_fk" FOREIGN KEY ("generation_id") REFERENCES "public"."generations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "brand_profiles_client_version_unique" ON "brand_profiles" USING btree ("client_id","version");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "clients_workspace_idx" ON "clients" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "generations_workspace_idx" ON "generations" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "generations_client_idx" ON "generations" USING btree ("client_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "memberships_user_workspace_unique" ON "memberships" USING btree ("user_id","workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_generation_idx" ON "posts" USING btree ("generation_id");