import { relations, sql } from 'drizzle-orm';
import { int, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { userProfilesTable } from './db-userprofiles';
import { itemsTable } from './db-items';
import { skillsTable } from './db-skills';

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
    activityId: text('activity_id').notNull().default('None'),
    activityStart: int('activity_start', { mode: 'timestamp_ms' }).default(sql`NULL`),
    settings: text('settings').notNull().default(''),
  },
  (table) => [uniqueIndex('name_idx').on(table.name)],
);

export const profileRelations = relations(profilesTable, ({ many }) => ({
  userProfileRelation: many(userProfilesTable),
  itemsRelation: many(itemsTable),
  skillsRelation: many(skillsTable),
}));
