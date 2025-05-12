import { atom } from 'jotai';
import { ItemTag } from '@/shared/definition/definition-items';

export const selectedInventoryTabAtom = atom(ItemTag.Resource);
export const activeActivityAtom = atom<{ activityId: string; time: number }>();
