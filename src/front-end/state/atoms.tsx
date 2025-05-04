import { atom } from 'jotai';
import { ItemTag } from '@/shared/features/items';

export const selectedInventoryTabAtom = atom(ItemTag.Resource);
