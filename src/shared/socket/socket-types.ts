import { inventoryDto, itemDto, profileDto } from '@/shared/socket/socket-events';
import type { Static } from '@sinclair/typebox';

export type ProfileDto = Static<typeof profileDto>;
export type ItemDto = Static<typeof itemDto>;
export type InventoryDto = Static<typeof inventoryDto>;
