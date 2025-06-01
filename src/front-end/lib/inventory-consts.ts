import { ItemTag } from '@/shared/definition/definition-items';

export const inventoryTabMap = new Map<string, ItemTag[]>([
  ['All', []],
  ['Resources', [ItemTag.Resource]],
  ['Tools', [ItemTag.Tool]],
]);
