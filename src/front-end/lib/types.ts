import type {Item} from '@/shared/items.ts';

export interface ItemStack {
  item: Item;
  count: number;
}