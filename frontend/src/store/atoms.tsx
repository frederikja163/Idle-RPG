import { atom } from 'jotai';
import { atomWithReset, RESET } from 'jotai/utils';
import type { Item, ItemId } from '@/shared/definition/schema/types/types-items';
import type { Skill, SkillId } from '@/shared/definition/schema/types/types-skills';
import type { CraftingRecipeId } from '@/shared/definition/definition-crafting';
import type { Profile, ProfileId } from '@/shared/definition/schema/types/types-profiles';
import { nameOf } from '@/frontend/lib/function-utils';

export const profilesAtom = atomWithReset<Map<ProfileId, Partial<Profile>>>(new Map());
profilesAtom.debugLabel = nameOf({ profilesAtom });

export const selectedProfileIdAtom = atomWithReset<string | undefined>(undefined);
selectedProfileIdAtom.debugLabel = nameOf({ selectedProfileIdAtom });

// TODO: consider adding getter to atoms with map in here
export const profileItemsAtom = atomWithReset<Map<ItemId, Partial<Item>>>(new Map());
profileItemsAtom.debugLabel = nameOf({ profileItemsAtom });

export const selectedInventoryTabAtom = atomWithReset<string>('All');
selectedInventoryTabAtom.debugLabel = nameOf({ selectedInventoryTabAtom });

export const selectedSkillTabAtom = atomWithReset<SkillId>('');
selectedInventoryTabAtom.debugLabel = nameOf({ selectedSkillTabAtom });

export const profileSkillsAtom = atomWithReset<Map<SkillId, Partial<Skill>>>(new Map());
profileSkillsAtom.debugLabel = nameOf({ profileSkillsAtom });

export const activeActivityAtom = atomWithReset<{ activityId: CraftingRecipeId; activityStart: Date } | undefined>(
  undefined,
);
activeActivityAtom.debugLabel = nameOf({ activeActivityAtom });

export const resetAtomsAtom = atom(null, (_, set) => {
  console.debug('Reset atoms');

  set(profileItemsAtom, RESET);
  set(selectedInventoryTabAtom, RESET);
  set(profileSkillsAtom, RESET);
  set(activeActivityAtom, RESET);
});
resetAtomsAtom.debugLabel = nameOf({ resetAtomsAtom });
