import { atom } from 'jotai';
import { atomWithReset, RESET } from 'jotai/utils';
import type { Item, ItemId } from '@/shared/definition/schema/types/types-items.ts';
import type { Skill, SkillId } from '@/shared/definition/schema/types/types-skills.ts';
import type { ActivityId } from '@/shared/definition/definition-activities.ts';

export const profileItemsAtom = atomWithReset<Map<ItemId, Item>>(new Map<ItemId, Item>());
profileItemsAtom.debugLabel = 'profileItemsAtom';

export const selectedInventoryTabAtom = atomWithReset<string>('All');
selectedInventoryTabAtom.debugLabel = 'selectedInventoryTabAtom';

export const profileSkillsAtom = atomWithReset<Map<SkillId, Skill>>(new Map<SkillId, Skill>());
profileSkillsAtom.debugLabel = 'profileSkillsAtom';

export const activeActivityAtom = atomWithReset<{ activityId: ActivityId; activityStart: Date } | undefined>(undefined);
activeActivityAtom.debugLabel = 'activeActivityAtom';

export const activityProgressPercentAtom = atomWithReset<number | undefined>(undefined);
activityProgressPercentAtom.debugLabel = 'activityProgressPercentAtom';

// When adding new atoms, remember to add them to reset below
export const resetAtomsAtom = atom(null, (_, set) => {
  set(profileItemsAtom, RESET);
  set(selectedInventoryTabAtom, RESET);
  set(profileSkillsAtom, RESET);
  set(activeActivityAtom, RESET);
  set(activityProgressPercentAtom, RESET);
});
resetAtomsAtom.debugLabel = 'resetAtomsAtom';
