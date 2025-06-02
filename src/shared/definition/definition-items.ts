import type { ItemId } from './schema/types/types-items';

export const items = new Map<ItemId, ItemDef>();

export enum ItemTag {
  Resource = 'Ressource',
  Tool = 'Tool',
}

export type ItemDef = {
  id: ItemId;
  display: string;
  tags: ItemTag[];
};
export function itemDef(id: ItemId, display: string, ...tags: ItemTag[]) {
  const item = { id, display, tags };
  items.set(id, item);
  return item;
}
