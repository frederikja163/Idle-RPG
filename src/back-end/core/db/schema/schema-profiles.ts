import { relations, sql } from 'drizzle-orm';
import { int, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { userProfilesTable } from './schema-userprofiles';
import { itemsTable } from './schema-items';

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
  },
  (table) => [uniqueIndex('name_idx').on(table.name)],
);

export const profileRelations = relations(profilesTable, ({ many }) => ({
  userProfileRelation: many(userProfilesTable),
  inventoryRelation: many(itemsTable),
}));
