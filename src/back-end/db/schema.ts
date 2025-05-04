import { relations, sql } from "drizzle-orm";
import {
  foreignKey,
  int,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const userTable = sqliteTable(
  "users",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    googleId: text("google_id").notNull().unique(),
    email: text("email").notNull().unique(),
    profilePicture: text("profile_picture").notNull(),
    firstLogin: int("first_login", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(current_timestamp)`),
    lastLogin: int("last_login", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    uniqueIndex("google_idx").on(table.googleId),
    uniqueIndex("email__idx").on(table.email),
  ]
);

export const userRelations = relations(userTable, ({ many }) => ({
  userProfileRelation: many(userProfileTable),
}));

export const profileTable = sqliteTable(
  "profiles",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name").notNull().unique(),
    miningXp: int("mining_xp", { mode: "number" }).notNull().default(0),
    smitheryXp: int("smithery_xp", { mode: "number" }).notNull().default(0),
    lumberjackingXp: int("lumberjacking_xp", { mode: "number" })
      .notNull()
      .default(0),
    carpentryXp: int("carpentry_xp", { mode: "number" }).notNull().default(0),
    creationTime: int("creation_time", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(current_timestamp)`),
    lastLogin: int("last_login", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [uniqueIndex("name_idx").on(table.name)]
);

export const profileRelations = relations(profileTable, ({ many }) => ({
  userProfileRelation: many(userProfileTable),
  inventoryRelation: many(inventoryTable),
}));

export const userProfileTable = sqliteTable(
  "user_profile_relation",
  {
    user: int("user_id", { mode: "number" }).references(() => userTable.id),
    profile: int("profile_id", { mode: "number" }).references(
      () => profileTable.id
    ),
  },
  (table) => [
    uniqueIndex("idx").on(table.user, table.profile),
    foreignKey({
      columns: [table.user],
      foreignColumns: [userTable.id],
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.profile],
      foreignColumns: [profileTable.id],
    }).onDelete("cascade"),
  ]
);

export const userProfileRelations = relations(userProfileTable, ({ one }) => ({
  user: one(userTable, {
    fields: [userProfileTable.user],
    references: [userTable.id],
  }),
  profile: one(profileTable, {
    fields: [userProfileTable.profile],
    references: [profileTable.id],
  }),
}));

export const inventoryTable = sqliteTable(
  "inventory_table",
  {
    profileId: int("id", { mode: "number" }).notNull(),
    itemId: text("item_id").notNull(),
    count: int("count", { mode: "number" }).notNull(),
    index: int("index", { mode: "number" }).notNull(),
  },
  (table) => [
    uniqueIndex("item_idx").on(table.profileId, table.itemId),
    uniqueIndex("index_idx").on(table.profileId, table.index),
    foreignKey({
      columns: [table.profileId],
      foreignColumns: [profileTable.id],
    }).onDelete("cascade"),
  ]
);

export const intentoryRelations = relations(inventoryTable, ({ one }) => ({
  profile: one(profileTable, {
    fields: [inventoryTable.profileId],
    references: [profileTable.id],
  }),
}));
