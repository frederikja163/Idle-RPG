import { relations } from 'drizzle-orm';
import { foreignKey, int, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { profilesTable } from './db-profiles';

export const equipmentTable = sqliteTable(
  'items',
  {
    profileId: text('profile_id').notNull(),
    id: text('id').notNull(),
    slot: text('slot').notNull(),
    skill: text('skill').notNull(),
  },
  (table) => [
    primaryKey({ name: 'index_idx', columns: [table.profileId, table.id, table.slot, table.skill] }),
    foreignKey({
      columns: [table.profileId],
      foreignColumns: [profilesTable.id],
    }).onDelete('cascade'),
  ],
);

export const equipmentRelation = relations(equipmentTable, ({ one }) => ({
  profile: one(profilesTable, {
    fields: [equipmentTable.profileId],
    references: [profilesTable.id],
  }),
}));
