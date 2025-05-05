import type { ItemType, ProfileId } from '@/back-end/core/db/db.types';
import { InventoryRepository } from './inventory.repository';
import type { SocketId } from '@/back-end/core/server/sockets/socket.types';
import { CleanupEventToken, type CleanupEventListener } from '@/back-end/core/events/cleanup.event';
import {
  ProfileDeselectedEventToken,
  ProfileSelectedEventToken,
  type ProfileDeselectedEventListener,
  type ProfileSelectedEventListener,
} from '@/back-end/core/events/profile.event';
import { injectableSingleton } from '@/back-end/core/lib/lib.tsyringe';

@injectableSingleton(CleanupEventToken, ProfileSelectedEventToken, ProfileDeselectedEventToken)
export class InventoryCache
  implements CleanupEventListener, ProfileSelectedEventListener, ProfileDeselectedEventListener
{
  private readonly profileToItems = new Map<ProfileId, WeakRef<ItemType[]>>();
  private readonly itemsToSave = new Map<ProfileId, ItemType[]>();

  public constructor(private readonly inventoryRepository: InventoryRepository) {}

  public async getByProfileId(profileId: ProfileId) {
    const cache = this.profileToItems.get(profileId)?.deref();
    if (cache) return cache;

    const inventory = await this.inventoryRepository.getByProfileId(profileId);
    this.profileToItems.set(profileId, new WeakRef(inventory));
    return inventory;
  }

  public save(profileId: ProfileId, inventory: ItemType[]) {
    this.itemsToSave.set(profileId, inventory);
  }

  public async cleanup() {
    for (const [profileId, inventory] of this.itemsToSave) {
      await this.inventoryRepository.replaceItems(profileId, inventory);
    }

    for (const [profileId, inventoryRef] of this.profileToItems) {
      const inventory = inventoryRef.deref();
      if (!inventory) this.profileToItems.delete(profileId);
    }
  }

  public async onProfileSelected(socketId: SocketId, profileId: ProfileId) {
    await this.getByProfileId(profileId);
  }

  public async onProfileDeselected(socketId: SocketId, profileId: ProfileId) {
    const inventory = this.profileToItems.get(profileId)?.deref();
    if (inventory) this.save(profileId, inventory);
  }
}
