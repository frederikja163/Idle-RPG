import {inventoryDto, itemDto, profileDto} from '@/shared/socket-events.ts';
import type {Static} from '@sinclair/typebox';

export type ProfileDto = Static<typeof profileDto>;
export type ItemDto = Static<typeof itemDto>;
export type InventoryDto = Static<typeof inventoryDto>;