import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { userProfilesTable } from './db-userprofiles';
import { itemsTable } from './db-items';
import { skillsTable } from './db-skills';
import { timestampNow } from './db-types';

export const profilesTable = sqliteTable(
  'profiles',
  {
    id: text('id').primaryKey().$defaultFn(crypto.randomUUID.bind(crypto)),
    name: text('name').notNull(),
    firstLogin: integer('first_login')
      .notNull()
      .default(sql`${timestampNow}`),
    lastLogin: integer('last_login')
      .notNull()
      .default(sql`${timestampNow}`),
    activity: text('activity', { mode: 'json' })
      .notNull()
      .default(sql`{"type": "none", "start": ${timestampNow}}`),
    settings: text('settings').notNull().default(''),
  },
  (table) => [uniqueIndex('name_idx').on(table.name)],
);

export const profileRelations = relations(profilesTable, ({ many }) => ({
  userProfileRelation: many(userProfilesTable),
  itemsRelation: many(itemsTable),
  skillsRelation: many(skillsTable),
}));
