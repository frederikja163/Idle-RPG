import type { ItemId } from './schema/types/types-items';
import type { SkillId } from './schema/types/types-skills';

export const items = new Map<ItemId, ItemDef>();

export enum ItemTag {
  Resource = 'Ressource',
  Tool = 'Tool',
}

export enum EquipmentSlots {
  Head = 'head',
  Handle = 'handle',
}

export type SkillStatBlock = {
  Speed: number;
  Productivity: number;
  Xp: number;
  CraftingXp: number;
};

export type EquipmentStatBlock = {
  [key in EquipmentSlots]?: Partial<SkillStatBlock>;
};

export type ItemStatBlock = {
  [key in SkillId]: EquipmentStatBlock;
};

export type ItemDef = {
  id: ItemId;
  display: string;
  tags: ItemTag[];
  stats?: ItemStatBlock;
};
export function itemDef(id: ItemId, display: string, tags: ItemTag[], stats?: ItemStatBlock) {
  const item = { id, display, tags, stats };
  items.set(id, item);
  return item;
}
