import { relations, sql } from 'drizzle-orm';
import { foreignKey, int, primaryKey, sqliteTable, text, unique, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable(
  'users',
  {
    id: int('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    googleId: text('google_id').notNull().unique(),
    email: text('email').notNull().unique(),
    profilePicture: text('profile_picture').notNull(),
    firstLogin: int('first_login', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(current_timestamp)`),
    lastLogin: int('last_login', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [uniqueIndex('google_idx').on(table.googleId), uniqueIndex('email__idx').on(table.email)],
);

export const userRelations = relations(usersTable, ({ many }) => ({
  userProfileRelation: many(userProfileTable),
}));

export const profilesTable = sqliteTable(
  'profiles',
  {
    id: int('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    name: text('name').notNull().unique(),
    creationTime: int('creation_time', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(current_timestamp)`),
    lastLogin: int('last_login', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [uniqueIndex('name_idx').on(table.name)],
);

export const profileRelations = relations(profilesTable, ({ many }) => ({
  userProfileRelation: many(userProfileTable),
  inventoryRelation: many(itemsTable),
}));

export const userProfileTable = sqliteTable(
  'user_profile_relation',
  {
    userId: int('user_id', { mode: 'number' }).references(() => usersTable.id),
    profileId: int('profile_id', { mode: 'number' }).references(() => profilesTable.id),
  },
  (table) => [
    primaryKey({ name: 'idx', columns: [table.userId, table.profileId] }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [usersTable.id],
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.profileId],
      foreignColumns: [profilesTable.id],
    }).onDelete('cascade'),
  ],
);

export const userProfileRelations = relations(userProfileTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [userProfileTable.userId],
    references: [usersTable.id],
  }),
  profile: one(profilesTable, {
    fields: [userProfileTable.profileId],
    references: [profilesTable.id],
  }),
}));

export const itemsTable = sqliteTable(
  'items',
  {
    profileId: int('id', { mode: 'number' }).notNull(),
    itemId: text('item_id').notNull(),
    count: int('count', { mode: 'number' }).notNull().default(0),
    index: int('index', { mode: 'number' }).notNull(),
  },
  (table) => [
    primaryKey({ name: 'index_idx', columns: [table.profileId, table.index] }),
    unique('item_idx').on(table.profileId, table.itemId),
    foreignKey({
      columns: [table.profileId],
      foreignColumns: [profilesTable.id],
    }).onDelete('cascade'),
  ],
);

export const itemsRelation = relations(itemsTable, ({ one }) => ({
  profile: one(profilesTable, {
    fields: [itemsTable.profileId],
    references: [profilesTable.id],
  }),
}));

export const skillsTable = sqliteTable(
  'skills',
  {
    profileId: int('profile_id', { mode: 'number' }).notNull(),
    skillId: text('skill_id').notNull(),
    xp: int('xp', { mode: 'number' }).notNull().default(0),
    level: int('level', { mode: 'number' }).notNull().default(0),
  },
  (table) => [
    primaryKey({ name: 'idx', columns: [table.profileId, table.skillId] }),
    foreignKey({
      columns: [table.profileId],
      foreignColumns: [profilesTable.id],
    }),
  ],
);

export const skillRelations = relations(skillsTable, ({ one }) => ({
  profile: one(profilesTable, {
    fields: [skillsTable.profileId],
    references: [profilesTable.id],
  }),
}));
