import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { userProfilesTable } from './db-userprofiles';
import { itemsTable } from './db-items';
import { skillsTable } from './db-skills';
import { timestampNowSql } from './db-types';

export const profilesTable = sqliteTable(
  'profiles',
  {
    id: text('id').primaryKey().$defaultFn(crypto.randomUUID.bind(crypto)),
    name: text('name').notNull(),
    firstLogin: integer('first_login').notNull().default(timestampNowSql),
    lastLogin: integer('last_login').notNull().default(timestampNowSql),
    activity: text('activity', { mode: 'json' })
      .notNull()
      .default(sql`'{"type": "none", "start": 0}'`),
    settings: text('settings').notNull().default(''),
  },
  (table) => [uniqueIndex('name_idx').on(table.name)],
);

export const profileRelations = relations(profilesTable, ({ many }) => ({
  userProfileRelation: many(userProfilesTable),
  itemsRelation: many(itemsTable),
  skillsRelation: many(skillsTable),
}));
