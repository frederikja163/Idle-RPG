import { ItemTag } from '@/shared/definition/definition-items.ts';

export const inventoryTabMap = new Map<string, ItemTag[]>([
  ['All', []],
  ['Resources', [ItemTag.Resource]],
  ['Tools', [ItemTag.Tool]],
]);
