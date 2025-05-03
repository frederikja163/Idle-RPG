import { relations, sql } from 'drizzle-orm';
import { int, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { userProfiles } from './schema.userprofiles';
import { items } from './schema.items';

export const profiles = sqliteTable(
  'profiles',
  {
    id: int('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
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

export const profileRelations = relations(profiles, ({ many }) => ({
  userProfileRelation: many(userProfiles),
  inventoryRelation: many(items),
}));
