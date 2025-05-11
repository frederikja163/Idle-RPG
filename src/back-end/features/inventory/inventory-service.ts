import { injectDB, type Database } from '@/back-end/core/db/db';
import { InventoryCache } from './inventory-cache';
import { InventoryRepository } from './inventory-repository';
import {
  ProfileDeselectedEventToken,
  ProfileSelectedEventToken,
  type ProfileDeselectedEventData,
  type ProfileDeselectedEventListener,
  type ProfileSelectedEventData,
  type ProfileSelectedEventListener,
} from '@/back-end/core/events/profile-event';
import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';
import { CleanupEventToken, type CleanupEventListener } from '@/back-end/core/events/cleanup-event';
import { Lookup } from '@/shared/lib/lookup';
import type { ItemId } from '@/shared/definition/schema/types/types-items';
import type { ProfileId } from '@/shared/definition/schema/types/types-profiles';

@injectableSingleton(ProfileSelectedEventToken, ProfileDeselectedEventToken, CleanupEventToken)
export class InventoryService
  implements ProfileSelectedEventListener, ProfileDeselectedEventListener, CleanupEventListener
{
  private readonly dirtyItems = new Lookup<ProfileId, ItemId>();
  private readonly dirtyInventories = new Set<ProfileId>();
  private readonly profilesToRemove = new Set<ProfileId>();

  public constructor(
    @injectDB() private readonly db: Database,
    private readonly inventoryCache: InventoryCache,
    private readonly inventoryRepo: InventoryRepository,
  ) {}

  public async getByProfileId(profileId: ProfileId) {
    try {
      const cache = this.inventoryCache.getByProfileId(profileId);
      if (cache) return cache.values().toArray();

      return await this.warmupCache(profileId);
    } catch (error) {
      console.error(`Failed to get inventory for profile ${profileId}`, error);
      return [];
    }
  }

  public async getByItemId(profileId: ProfileId, itemId: ItemId) {
    try {
      if (!this.inventoryCache.hasInventory(profileId)) await this.warmupCache(profileId);

      const cache = this.inventoryCache.getById(profileId, itemId);
      if (cache) return cache;

      const index = this.inventoryCache.getByProfileId(profileId)?.size ?? 0;
      const item = { index, itemId, profileId, count: 0 };
      this.inventoryCache.storeItem(profileId, item);
      return item;
    } catch (error) {
      console.error(`Failed to get item ${itemId} for profile ${profileId}`, error);
      throw new Error(`Unable to retrieve item from inventory`);
    }
  }

  public updateInventory(profileId: ProfileId) {
    try {
      if (this.dirtyItems.hasKey(profileId)) this.dirtyItems.removeKey(profileId);
      this.dirtyInventories.add(profileId);
    } catch (error) {
      console.error(`Failed marking inventory as dirty ${profileId}`);
    }
  }

  public updateItem(profileId: ProfileId, itemId: ItemId) {
    try {
      if (this.dirtyInventories.has(profileId)) return;
      this.dirtyItems.add(profileId, itemId);
    } catch (error) {
      console.error(`Failed marking item as dirty ${profileId} ${itemId}`, error);
    }
  }

  private async warmupCache(profileId: ProfileId) {
    const inventory = await this.inventoryRepo.getByProfileId(profileId);
    this.inventoryCache.storeInventory(profileId, inventory);
    return inventory;
  }

  public async onProfileSelected({ profileId }: ProfileSelectedEventData): Promise<void> {
    try {
      if (this.inventoryCache.hasInventory(profileId)) return;
      await this.warmupCache(profileId);
    } catch (error) {
      console.error(`Failed warming up inventory cache on profile select ${profileId}`, error);
    }
  }
  public onProfileDeselected({ profileId }: ProfileDeselectedEventData): void | Promise<void> {
    try {
      this.profilesToRemove.add(profileId);
    } catch (error) {
      console.error(`Failed invalidating cache on profile deselect ${profileId}`, error);
    }
  }

  public async cleanup(): Promise<void> {
    const dirtyItems = Array.from(this.dirtyItems.values());
    const dirtyInventories = Array.from(this.dirtyInventories);
    const profilesToRemove: ProfileId[] = Array.from(this.profilesToRemove);
    try {
      this.dirtyItems.clear();
      this.dirtyInventories.clear();
      this.profilesToRemove.clear();
      await this.db.transaction(async (tx) => {
        for (const [profileId, itemId] of dirtyItems) {
          const item = this.inventoryCache.getById(profileId, itemId);
          if (item) await this.inventoryRepo.updateItem(item, tx);
        }

        for (const profileId of dirtyInventories) {
          const items = this.inventoryCache.getByProfileId(profileId);
          if (items) await this.inventoryRepo.updateItems(profileId, Array.from(items.values()), tx);
        }
      });

      profilesToRemove.forEach(this.inventoryCache.invalidateInventory);
    } catch (error) {
      console.error(`Failed saving inventories`, error);
      dirtyItems.forEach(([pId, is]) => this.dirtyItems.add(pId, is));
      dirtyInventories.forEach(this.dirtyInventories.add);
      profilesToRemove.forEach(this.profilesToRemove.add);
    }
  }
}
