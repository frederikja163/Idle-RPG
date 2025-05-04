import { atom } from 'jotai';
import { ItemTag } from '@/shared/definition/definition.items';

export const selectedInventoryTabAtom = atom(ItemTag.Resource);
