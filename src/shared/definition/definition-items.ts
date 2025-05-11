import type { ItemId } from './schema/types/types-items';

export const items = new Map<string, ItemDef>();

ore('Talc');
ore('Gypsum');
ore('Calcite');
ore('Flourite');
ore('Apatite');

wood('Balsa');
wood('Pine');
wood('Cedar');
wood('Cherry');
wood('Oak');

function ore(name: string) {
  const id = name.toLowerCase();
  item(`ore_${id}`, `${name} ore`, ItemTag.Resource, ItemTag.Tool);
}

function wood(name: string) {
  const id = name.toLowerCase();
  item(`log_${id}`, `${name} log`, ItemTag.Resource);
}

function item(id: string, display: string, ...tags: ItemTag[]) {
  items.set(id, { id, display, tags });
}

export enum ItemTag {
  Resource,
  Tool,
}

export const itemTagDisplayMap = new Map<ItemTag, string>([
  [ItemTag.Resource, 'Resource'],
  [ItemTag.Tool, 'Tool'],
]);

export type ItemDef = {
  id: ItemId;
  display: string;
  tags: ItemTag[];
};
