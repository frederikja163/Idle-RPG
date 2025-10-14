import { relations } from 'drizzle-orm';
import { foreignKey, int, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { profilesTable } from './db-profiles';

export const itemsTable = sqliteTable(
  'items',
  {
    profileId: text('profile_id').notNull(),
    id: text('id').notNull(),
    count: int('count', { mode: 'number' }).notNull().default(0),
    index: int('index', { mode: 'number' }).notNull(),
  },
  (table) => [
    primaryKey({ name: 'index_idx', columns: [table.profileId, table.id] }),
    foreignKey({
      columns: [table.profileId],
      foreignColumns: [profilesTable.id],
    }).onDelete('cascade'),
  ],
);

export const itemsRelation = relations(itemsTable, ({ one }) => ({
  profile: one(profilesTable, {
    fields: [itemsTable.profileId],
    references: [profilesTable.id],
  }),
}));
