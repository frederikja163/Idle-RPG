import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { FormEvent } from 'react';
import type { Skill, SkillId } from '@/shared/definition/schema/types/types-skills.ts';
import type { Item, ItemId } from '@/shared/definition/schema/types/types-items.ts';
import { activities, type ActivityId } from '@/shared/definition/definition-activities.ts';
import type { Profile, ProfileId } from '@/shared/definition/schema/types/types-profiles';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFormData<T>(formEvent: FormEvent<HTMLFormElement>) {
  const formData = new FormData(formEvent.currentTarget);
  return Object.fromEntries(formData.entries()) as unknown as T;
}

export const getSkill = (skills: Map<SkillId, Partial<Skill>>) => (id: SkillId) => {
  return {
    id,
    xp: 0,
    level: 0,
    profileId: '',
    ...skills.get(id),
  };
};

export const getItem = (items: Map<ItemId, Partial<Item>>) => (id: ItemId) => {
  return {
    id,
    count: 0,
    index: 0,
    profileId: '',
    ...items.get(id),
  };
};

export const updateSkills = (updatedSkills: Partial<Skill>[]) => (existingSkills: Map<SkillId, Partial<Skill>>) => {
  const skills = new Map(existingSkills);

  for (const skill of updatedSkills) {
    if (skill.id) {
      const existing = skills.get(skill.id);
      skills.set(skill.id, { ...existing, ...skill });
    }
  }

  return skills;
};

export const updateItems = (updatedItems: Partial<Item>[]) => (existingItems: Map<ItemId, Partial<Item>>) => {
  const items = new Map(existingItems);

  for (const item of updatedItems) {
    if (item.id) {
      const existing = items.get(item.id);
      items.set(item.id, { ...existing, ...item });
    }
  }

  return items;
};

export const updateProfiles =
  (updatedProfiles: Partial<Profile>[]) => (existingProfiles: Map<ProfileId, Partial<Profile>>) => {
    const profiles = new Map(existingProfiles);

    for (const profile of updatedProfiles) {
      if (profile.id) {
        const existing = profiles.get(profile.id);
        profiles.set(profile.id, { ...existing, ...profile });
      }
    }

    return profiles;
  };

export const getMsUntilActionDone = (activityId: ActivityId, activityStart: Date) => {
  const activityDef = activities.get(activityId);
  if (!activityDef) return 0;

  const activityActionTime = activityDef.time;
  const activityElapsedMs = new Date().getTime() - activityStart.getTime();
  const actionElapsedMs = activityElapsedMs % activityActionTime;
  return activityActionTime - actionElapsedMs;
};

export const getKey = (i?: number) => `${i}${Math.random()}${Date.now()}`;
