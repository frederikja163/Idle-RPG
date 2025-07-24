import { relations } from 'drizzle-orm';
import { sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { userProfilesTable } from './db-userprofiles';
import { timestamp, timestampNow } from './db-types';

export const usersTable = sqliteTable(
  'users',
  {
    id: text('id').primaryKey().$defaultFn(crypto.randomUUID.bind(crypto)),
    googleId: text('google_id').notNull().unique(),
    email: text('email').notNull().unique(),
    profilePicture: text('profile_picture').notNull(),
    firstLogin: timestamp('first_login').notNull().default(timestampNow),
    lastLogin: timestamp('last_login').notNull().default(timestampNow),
    settings: text('settings').notNull().default(''),
  },
  (table) => [uniqueIndex('google_idx').on(table.googleId), uniqueIndex('email__idx').on(table.email)],
);

export const userRelations = relations(usersTable, ({ many }) => ({
  userProfileRelation: many(userProfilesTable),
}));
