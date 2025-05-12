import { relations, sql } from 'drizzle-orm';
import { int, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { userProfilesTable } from './db-userprofiles';
import { itemsTable } from './db-items';

export const profilesTable = sqliteTable(
  'profiles',
  {
    id: text('id').primaryKey().$defaultFn(crypto.randomUUID.bind(crypto)),
    name: text('name').notNull().unique(),
    firstLogin: int('first_login', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(current_timestamp)`),
    lastLogin: int('last_login', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(current_timestamp)`),
    activityId: text('activity_id').default(sql`NULL`),
    activityStart: int('activity_start', { mode: 'timestamp_ms' }).default(sql`NULL`),
  },
  (table) => [uniqueIndex('name_idx').on(table.name)],
);

export const profileRelations = relations(profilesTable, ({ many }) => ({
  userProfileRelation: many(userProfilesTable),
  inventoryRelation: many(itemsTable),
}));
