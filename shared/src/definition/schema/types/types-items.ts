import { itemsTable } from '../db/db-items';

export type Item = typeof itemsTable.$inferSelect;
export type ItemId = string;
