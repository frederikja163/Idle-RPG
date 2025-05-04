import {atom} from 'jotai';
import {ItemTag} from '@/shared/items.ts';

export const selectedInventoryTabAtom = atom(ItemTag.Resource);