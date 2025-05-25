import { atom } from 'jotai';
import { ItemTag } from '@/shared/definition/definition-items';
import type { Item, ItemId } from '@/shared/definition/schema/types/types-items.ts';
import type { Skill, SkillId } from '@/shared/definition/schema/types/types-skills.ts';
import type { ActivityId } from '@/shared/definition/definition-activities.ts';

export const profileItemsAtom = atom<Map<ItemId, Item>>(new Map<ItemId, Item>());
export const selectedInventoryTabAtom = atom(ItemTag.Resource);

export const profileSkillsAtom = atom<Map<SkillId, Skill>>(new Map<SkillId, Skill>());
export const activeActivityAtom = atom<{ activityId: ActivityId; activityStart: Date }>();
