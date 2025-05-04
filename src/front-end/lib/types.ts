import type { Item } from '@/shared/features/items';

export interface ItemStack {
  item: Item;
  count: number;
}
