import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { userProfilesTable } from './db-userprofiles';
import { timestampNowSql } from './db-types';

export const usersTable = sqliteTable(
  'users',
  {
    id: text('id').primaryKey().$defaultFn(crypto.randomUUID.bind(crypto)),
    googleId: text('google_id').notNull().unique(),
    email: text('email').notNull().unique(),
    profilePicture: text('profile_picture').notNull(),
    firstLogin: integer('first_login').notNull().default(timestampNowSql),
    lastLogin: integer('last_login').notNull().default(timestampNowSql),
    settings: text('settings').notNull().default(''),
  },
  (table) => [uniqueIndex('google_idx').on(table.googleId), uniqueIndex('email__idx').on(table.email)],
);

export const userRelations = relations(usersTable, ({ many }) => ({
  userProfileRelation: many(userProfilesTable),
}));
