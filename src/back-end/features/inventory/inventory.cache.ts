import type { ICache } from '@/back-end/core/cache';
import type { ItemType, ProfileId } from '@/back-end/core/db/db.types';
import { InventoryRepository } from './inventory.repository';

export class InventoryCache implements ICache {
  private readonly itemsByProfileId = new Map<ProfileId, WeakRef<ItemType[]>>();

  public constructor(private readonly inventoryRepository: InventoryRepository) {}

  public async getByProfileId(profileId: ProfileId) {
    const cache = this.itemsByProfileId.get(profileId)?.deref();
    if (cache) return cache;

    const inventory = await this.inventoryRepository.getByProfileId(profileId);
    this.itemsByProfileId.set(profileId, new WeakRef(inventory));
    return inventory;
  }

  public async cleanup() {
    for (const [profileId, inventoryRef] of this.itemsByProfileId) {
      const inventory = inventoryRef.deref();
      if (inventory) await this.inventoryRepository.replaceItems(profileId, inventory);
    }
  }
}
