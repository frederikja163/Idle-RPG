import { relations } from 'drizzle-orm';
import { foreignKey, int, primaryKey, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { profiles } from './schema.profiles';

export const items = sqliteTable(
  'items',
  {
    profileId: int('id', { mode: 'number' }).notNull(),
    itemId: text('item_id').notNull(),
    count: int('count', { mode: 'number' }).notNull().default(0),
    index: int('index', { mode: 'number' }).notNull(),
  },
  (table) => [
    primaryKey({ name: 'index_idx', columns: [table.profileId, table.index] }),
    unique('item_idx').on(table.profileId, table.itemId),
    foreignKey({
      columns: [table.profileId],
      foreignColumns: [profiles.id],
    }).onDelete('cascade'),
  ],
);

export const itemsRelation = relations(items, ({ one }) => ({
  profile: one(profiles, {
    fields: [items.profileId],
    references: [profiles.id],
  }),
}));
