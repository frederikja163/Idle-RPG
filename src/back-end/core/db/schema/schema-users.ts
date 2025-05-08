import { relations, sql } from 'drizzle-orm';
import { int, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { userProfilesTable } from './schema-userprofiles';

export const usersTable = sqliteTable(
  'users',
  {
    id: text('id').primaryKey().$defaultFn(crypto.randomUUID.bind(crypto)),
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
  userProfileRelation: many(userProfilesTable),
}));
