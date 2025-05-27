import type { Item } from '../definition/schema/types/types-items';

export function addItems(item: Item, amount: number) {
  item.count += amount;
}

export function subItems(item: Item, amount: number) {
  item.count = Math.max(item.count - amount, 0);
}
