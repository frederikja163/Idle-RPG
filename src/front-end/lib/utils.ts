import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { FormEvent } from 'react';
import { items } from '@/shared/definition/definition-items';
import type { ItemStack } from './types';
import type { Item } from '@/shared/definition/schema/types/types-items';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFormData<T>(formEvent: FormEvent<HTMLFormElement>) {
  const formData = new FormData(formEvent.currentTarget);
  return Object.fromEntries(formData.entries()) as unknown as T;
}

export function getItemStacksFromInventory(inventory: Item[]): ItemStack[] {
  return inventory.map((itemDto) => {
    return {
      item: items.get(itemDto.itemId)!,
      count: itemDto.count,
    };
  });
}
