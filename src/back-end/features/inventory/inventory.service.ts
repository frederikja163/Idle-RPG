import { injectDB, type Database } from '@/back-end/core/db/db';
import { InventoryCache } from './inventory.cache';
import { InventoryRepository } from './inventory.repository';
import {
  ProfileDeletedEventToken,
  ProfileDeselectedEventToken,
  ProfileSelectedEventToken,
  type ProfileDeletedEventData,
  type ProfileDeletedEventListener,
  type ProfileDeselectedEventData,
  type ProfileDeselectedEventListener,
  type ProfileSelectedEventData,
  type ProfileSelectedEventListener,
} from '@/back-end/core/events/profile.event';
import { injectableSingleton } from '@/back-end/core/lib/lib.tsyringe';
import type { ItemType, ProfileId } from '@/back-end/core/db/db.types';
import { CleanupEventToken, type CleanupEventListener } from '@/back-end/core/events/cleanup.event';

@injectableSingleton(
  ProfileSelectedEventToken,
  ProfileDeselectedEventToken,
  ProfileDeletedEventToken,
  CleanupEventToken,
)
export class InventoryService
  implements
    ProfileSelectedEventListener,
    ProfileDeselectedEventListener,
    ProfileDeletedEventListener,
    CleanupEventListener
{
  private readonly dirtyProfiles = new Map<ProfileId, { shouldRemove: boolean }>();

  public constructor(
    @injectDB() private readonly db: Database,
    private readonly inventoryCache: InventoryCache,
    private readonly inventoryRepo: InventoryRepository,
  ) {}

  public async getByProfileId(profileId: ProfileId) {
    try {
      const cache = this.inventoryCache.getByProfileId(profileId);
      if (cache) return cache;

      const inventory = await this.inventoryRepo.getByProfileId(profileId);
      if (inventory) {
        this.inventoryCache.storeInventory(profileId, inventory);
      }
      return inventory;
    } catch (error) {
      console.error(`Failed to get inventory for user ${profileId}`, error);
      return [];
    }
  }

  public update(profileId: ProfileId, inventory: ItemType[]) {
    try {
      this.inventoryCache.storeInventory(profileId, inventory);
      if (!this.dirtyProfiles.has(profileId)) this.dirtyProfiles.set(profileId, { shouldRemove: false });
    } catch (error) {
      console.error(`Failed marking inventory as dirty ${profileId}`);
    }
  }

  public async onProfileSelected({ profileId }: ProfileSelectedEventData): Promise<void> {
    try {
      if (this.inventoryCache.hasInventory(profileId)) return;
      const inventory = await this.inventoryRepo.getByProfileId(profileId);
      this.inventoryCache.storeInventory(profileId, inventory);
    } catch (error) {
      console.error(`Failed warming up inventory cache on profile select ${profileId}`, error);
    }
  }
  public onProfileDeselected({ profileId }: ProfileDeselectedEventData): void | Promise<void> {
    try {
      this.dirtyProfiles.set(profileId, { shouldRemove: true });
    } catch (error) {
      console.error(`Failed invalidating cache on profile deselect ${profileId}`, error);
    }
  }

  public async onProfileDeleted({ profileId }: ProfileDeletedEventData): Promise<void> {
    try {
      await this.db.transaction(async (tx) => this.inventoryRepo.deleteItems(profileId, tx));
    } catch (error) {
      console.error(`Failed deleting profile ${profileId}`, error);
    }
  }

  public async cleanup(): Promise<void> {
    const profilesToFlush = Array.from(this.dirtyProfiles);
    this.dirtyProfiles.clear();
    const shouldRemove: ProfileId[] = [];
    try {
      await this.db.transaction(async (tx) => {
        for (const [profileId, options] of profilesToFlush) {
          const inventory = this.inventoryCache.getByProfileId(profileId);
          if (inventory) await this.inventoryRepo.updateItems(profileId, inventory, tx);
          if (options.shouldRemove) shouldRemove.push(profileId);
        }
      });

      shouldRemove.forEach(this.inventoryCache.invalidateInventory);
    } catch (error) {
      console.error(`Failed saving inventories`, error);
      profilesToFlush.forEach(([pId, o]) => this.dirtyProfiles.set(pId, o));
    }
  }
}
