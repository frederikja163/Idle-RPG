import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { FormEvent } from 'react';
import type { Skill, SkillId } from '@/shared/definition/schema/types/types-skills.ts';
import type { Item, ItemId } from '@/shared/definition/schema/types/types-items.ts';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFormData<T>(formEvent: FormEvent<HTMLFormElement>) {
  const formData = new FormData(formEvent.currentTarget);
  return Object.fromEntries(formData.entries()) as unknown as T;
}

export function mergeSkills(existingSkills: Map<SkillId, Skill>, updatedSkills: Skill[]) {
  for (const skill of updatedSkills) {
    existingSkills.set(skill.skillId, skill);
  }

  return existingSkills;
}

export function mergeItems(existingItems: Map<ItemId, Item>, updatedItems: Item[]) {
  for (const item of updatedItems) {
    existingItems.set(item.itemId, item);
  }

  return existingItems;
}
