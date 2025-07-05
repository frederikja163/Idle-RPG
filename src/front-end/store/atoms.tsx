import { atom } from 'jotai';
import { atomWithReset, RESET } from 'jotai/utils';
import type { Item, ItemId } from '@/shared/definition/schema/types/types-items.ts';
import type { Skill, SkillId } from '@/shared/definition/schema/types/types-skills.ts';
import type { ActivityId } from '@/shared/definition/definition-activities.ts';
import type { Profile, ProfileId } from '@/shared/definition/schema/types/types-profiles.ts';

export const profilesAtom = atomWithReset<Map<ProfileId, Partial<Profile>>>(new Map());
profilesAtom.debugLabel = 'profilesAtom';

export const selectedProfileIdAtom = atomWithReset<string | undefined>(undefined);
selectedProfileIdAtom.debugLabel = 'selectedProfileIdAtom';

// TODO: consider adding getter to atoms with map in here
export const profileItemsAtom = atomWithReset<Map<ItemId, Partial<Item>>>(new Map());
profileItemsAtom.debugLabel = 'profileItemsAtom';

export const selectedInventoryTabAtom = atomWithReset<string>('All');
selectedInventoryTabAtom.debugLabel = 'selectedInventoryTabAtom';

export const profileSkillsAtom = atomWithReset<Map<SkillId, Partial<Skill>>>(new Map());
profileSkillsAtom.debugLabel = 'profileSkillsAtom';

export const activeActivityAtom = atomWithReset<{ activityId: ActivityId; activityStart: Date } | undefined>(undefined);
activeActivityAtom.debugLabel = 'activeActivityAtom';

export const resetAtomsAtom = atom(null, (_, set) => {
  console.debug('Reset atoms');

  set(profileItemsAtom, RESET);
  set(selectedInventoryTabAtom, RESET);
  set(profileSkillsAtom, RESET);
  set(activeActivityAtom, RESET);
});
resetAtomsAtom.debugLabel = 'resetAtomsAtom';
