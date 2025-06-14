import { relations } from 'drizzle-orm';
import { foreignKey, int, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { profilesTable } from './db-profiles';

export const skillsTable = sqliteTable(
  'skills',
  {
    profileId: text('profile_id').notNull(),
    id: text('id').notNull(),
    xp: int('xp', { mode: 'number' }).notNull().default(0),
    level: int('level', { mode: 'number' }).notNull().default(0),
  },
  (table) => [
    primaryKey({ name: 'idx', columns: [table.profileId, table.id] }),
    foreignKey({
      columns: [table.profileId],
      foreignColumns: [profilesTable.id],
    }).onDelete('cascade'),
  ],
);

export const skillRelations = relations(skillsTable, ({ one }) => ({
  profile: one(profilesTable, {
    fields: [skillsTable.profileId],
    references: [profilesTable.id],
  }),
}));
