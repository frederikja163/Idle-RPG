import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { FormEvent } from 'react';
import type { Skill, SkillId } from '@/shared/definition/schema/types/types-skills.ts';
import type { Item, ItemId } from '@/shared/definition/schema/types/types-items.ts';
import { activities, type ActivityId } from '@/shared/definition/definition-activities.ts';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFormData<T>(formEvent: FormEvent<HTMLFormElement>) {
  const formData = new FormData(formEvent.currentTarget);
  return Object.fromEntries(formData.entries()) as unknown as T;
}

export const mergeSkills = (updatedSkills: Skill[]) => (existingSkills: Map<SkillId, Skill>) => {
  const skills = new Map(existingSkills);

  for (const skill of updatedSkills) {
    skills.set(skill.skillId, skill);
  }

  return skills;
};

export const mergeItems = (updatedItems: Item[]) => (existingItems: Map<ItemId, Item>) => {
  const items = new Map(existingItems);

  for (const item of updatedItems) {
    items.set(item.itemId, item);
  }

  return items;
};

export const getMsUntilActionDone = (activityId: ActivityId, activityStart: Date) => {
  const activityDef = activities.get(activityId);
  if (!activityDef) return 0;

  const activityActionTime = activityDef.time;
  const activityElapsedMs = new Date().getTime() - activityStart.getTime();
  const actionElapsedMs = activityElapsedMs % activityActionTime;
  return activityActionTime - actionElapsedMs;
};
