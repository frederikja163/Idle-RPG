import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { FormEvent } from 'react';
import type { InventoryDto } from '@/shared/socket/socket-types';
import { items } from '@/shared/features/items';
import type { ItemStack } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFormData<T>(formEvent: FormEvent<HTMLFormElement>) {
  const formData = new FormData(formEvent.currentTarget);
  return Object.fromEntries(formData.entries()) as unknown as T;
}

export function getItemStacksFromInventory(inventory: InventoryDto): ItemStack[] {
  return inventory.map((itemDto) => {
    return {
      item: items.get(itemDto.itemId)!,
      count: itemDto.count,
    };
  });
}
