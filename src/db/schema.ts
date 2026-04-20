import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const sourceKindEnum = pgEnum("source_kind", ["url", "file", "text"]);
export const postStatusEnum = pgEnum("post_status", [
  "draft",
  "approved",
  "published",
]);
export const platformIdEnum = pgEnum("platform_id", [
  "linkedin",
  "twitter",
  "instagram",
  "facebook",
  "threads",
]);
export const emojiPolicyEnum = pgEnum("emoji_policy", [
  "none",
  "sparing",
  "liberal",
]);
export const linkPolicyEnum = pgEnum("link_policy", [
  "inline",
  "end_of_post",
  "first_comment",
]);

export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    role: text("role").notNull().default("owner"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userWorkspaceUnique: uniqueIndex("memberships_user_workspace_unique").on(
      t.userId,
      t.workspaceId,
    ),
  }),
);

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    workspaceIdx: index("clients_workspace_idx").on(t.workspaceId),
  }),
);

export const brandProfiles = pgTable(
  "brand_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    toneDescriptors: jsonb("tone_descriptors")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    readingLevel: text("reading_level"),
    voiceExamples: jsonb("voice_examples")
      .$type<{
        good: { title: string; text: string }[];
        bad: { title: string; text: string; why?: string }[];
      }>()
      .notNull()
      .default(sql`'{"good":[],"bad":[]}'::jsonb`),
    doRules: jsonb("do_rules")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    dontRules: jsonb("dont_rules")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    vocabulary: jsonb("vocabulary")
      .$type<{ preferred: string[]; banned: string[] }>()
      .notNull()
      .default(sql`'{"preferred":[],"banned":[]}'::jsonb`),
    contact: jsonb("contact")
      .$type<{ phone?: string; website?: string; email?: string }>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    emojiPolicy: emojiPolicyEnum("emoji_policy").notNull().default("sparing"),
    linkPolicy: linkPolicyEnum("link_policy").notNull().default("inline"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    clientVersionUnique: uniqueIndex("brand_profiles_client_version_unique").on(
      t.clientId,
      t.version,
    ),
  }),
);

export const generations = pgTable(
  "generations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    brandProfileId: uuid("brand_profile_id")
      .notNull()
      .references(() => brandProfiles.id),
    sourceKind: sourceKindEnum("source_kind").notNull(),
    sourceRef: text("source_ref"),
    extractedTitle: text("extracted_title"),
    extractedByline: text("extracted_byline"),
    extractedBodyMd: text("extracted_body_md"),
    extractedMeta: jsonb("extracted_meta")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`),
    requestedPlatforms: jsonb("requested_platforms")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    workspaceIdx: index("generations_workspace_idx").on(t.workspaceId),
    clientIdx: index("generations_client_idx").on(t.clientId),
  }),
);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    generationId: uuid("generation_id")
      .notNull()
      .references(() => generations.id, { onDelete: "cascade" }),
    platform: platformIdEnum("platform").notNull(),
    content: jsonb("content")
      .$type<{
        hook: string;
        body: string;
        cta?: string;
        hashtags?: string[];
      }>()
      .notNull(),
    status: postStatusEnum("status").notNull().default("draft"),
    revisions: jsonb("revisions")
      .$type<
        {
          content: { hook: string; body: string; cta?: string; hashtags?: string[] };
          editedAt: string;
          editedBy: string;
        }[]
      >()
      .notNull()
      .default(sql`'[]'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    generationIdx: index("posts_generation_idx").on(t.generationId),
  }),
);

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  memberships: many(memberships),
  clients: many(clients),
  generations: many(generations),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [clients.workspaceId],
    references: [workspaces.id],
  }),
  brandProfiles: many(brandProfiles),
  generations: many(generations),
}));

export const brandProfilesRelations = relations(brandProfiles, ({ one }) => ({
  client: one(clients, {
    fields: [brandProfiles.clientId],
    references: [clients.id],
  }),
}));

export const generationsRelations = relations(generations, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [generations.workspaceId],
    references: [workspaces.id],
  }),
  client: one(clients, {
    fields: [generations.clientId],
    references: [clients.id],
  }),
  brandProfile: one(brandProfiles, {
    fields: [generations.brandProfileId],
    references: [brandProfiles.id],
  }),
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  generation: one(generations, {
    fields: [posts.generationId],
    references: [generations.id],
  }),
}));
