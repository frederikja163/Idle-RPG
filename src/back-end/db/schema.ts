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
    profilePicture: text("profile_picture"),
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

export const profileTable = sqliteTable("profiles", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  inventory: text("inventory").notNull().default("[]"),
  name: text("name").notNull(),
  mining: int("mining", { mode: "number" }).notNull().default(0),
  smithery: int("smithery", { mode: "number" }).notNull().default(0),
  lumberjacking: int("lumberjacking", { mode: "number" }).notNull().default(0),
  carpentry: int("carpentry", { mode: "number" }).notNull().default(0),
  crafting: int("crafting", { mode: "number" }).notNull().default(0),
});

export const profileRelations = relations(profileTable, ({ many }) => ({
  userProfileRelation: many(userProfileTable),
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
