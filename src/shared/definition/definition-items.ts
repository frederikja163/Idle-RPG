import type { ItemId } from './schema/types/types-items';

export const items = new Map<string, ItemDef>();

ore('Talc');
ore('Gypsum');
ore('Calcite');
ore('Flourite');
ore('Apatite');

refined('Talc');
refined('Gypsum');
refined('Calcite');
refined('Flourite');
refined('Apatite');

log('Balsa');
log('Pine');
log('Cedar');
log('Cherry');
log('Oak');

plank('Balsa');
plank('Pine');
plank('Cedar');
plank('Cherry');
plank('Oak');
console.log(items);

function ore(name: string) {
  const id = `ore_${name.toLowerCase()}`;
  items.set(id, itemDef(id, `${name} ore`, ItemTag.Resource));
}
function refined(name: string) {
  const id = `refined_${name.toLowerCase()}`;
  items.set(id, itemDef(id, `Refined ${name}`, ItemTag.Resource));
}
function log(name: string) {
  const id = `log_${name.toLowerCase()}`;
  items.set(id, itemDef(id, `${name} log`, ItemTag.Resource));
}
function plank(name: string) {
  const id = `plank_${name.toLowerCase()}`;
  items.set(id, itemDef(id, `${name} plank`, ItemTag.Resource));
}

export enum ItemTag {
  Resource,
}

export const itemTagDisplayMap = new Map<ItemTag, string>([[ItemTag.Resource, 'Resource']]);

export type ItemDef = {
  id: ItemId;
  display: string;
  tags: ItemTag[];
};
function itemDef(id: string, display: string, ...tags: ItemTag[]): ItemDef {
  return { id, display, tags };
}
