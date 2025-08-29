import { relations } from 'drizzle-orm';
import { sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { userProfilesTable } from './db-userprofiles';
import { itemsTable } from './db-items';
import { skillsTable } from './db-skills';
import { timestamp, timestampNow } from './db-types';

export const profilesTable = sqliteTable(
  'profiles',
  {
    id: text('id').primaryKey().$defaultFn(crypto.randomUUID.bind(crypto)),
    name: text('name').notNull(),
    firstLogin: timestamp('first_login').notNull().default(timestampNow),
    lastLogin: timestamp('last_login').notNull().default(timestampNow),
    activity: text('activity', { mode: 'json' }).notNull().default('{"type": "none", "start": null}'),
    settings: text('settings').notNull().default(''),
  },
  (table) => [uniqueIndex('name_idx').on(table.name)],
);

export const profileRelations = relations(profilesTable, ({ many }) => ({
  userProfileRelation: many(userProfilesTable),
  itemsRelation: many(itemsTable),
  skillsRelation: many(skillsTable),
}));
