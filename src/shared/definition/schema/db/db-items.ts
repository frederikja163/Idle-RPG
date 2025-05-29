import { relations } from 'drizzle-orm';
import { foreignKey, int, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { profilesTable } from './db-profiles';

export const itemsTable = sqliteTable(
  'items',
  {
    profileId: text('id').notNull(),
    itemId: text('item_id').notNull(),
    count: int('count', { mode: 'number' }).notNull().default(0),
    index: int('index', { mode: 'number' }).notNull(),
  },
  (table) => [
    primaryKey({ name: 'index_idx', columns: [table.profileId, table.itemId] }),
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
