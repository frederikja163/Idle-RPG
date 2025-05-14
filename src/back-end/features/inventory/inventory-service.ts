import { injectDB, type Database } from "@/back-end/core/db/db";
import { InventoryCache } from "./inventory-cache";
import { InventoryRepository } from "./inventory-repository";
import {
  ProfileDeselectedEventToken,
  ProfileSelectedEventToken,
  type ProfileDeselectedEventData,
  type ProfileDeselectedEventListener,
  type ProfileSelectedEventData,
  type ProfileSelectedEventListener,
} from "@/back-end/core/events/profile-event";
import { injectableSingleton } from "@/back-end/core/lib/lib-tsyringe";
import {
  CleanupEventToken,
  type CleanupEventListener,
} from "@/back-end/core/events/cleanup-event";
import { Lookup } from "@/shared/lib/lookup";
import type { ItemId } from "@/shared/definition/schema/types/types-items";
import type { ProfileId } from "@/shared/definition/schema/types/types-profiles";

@injectableSingleton(
  ProfileSelectedEventToken,
  ProfileDeselectedEventToken,
  CleanupEventToken
)
export class InventoryService
  implements
    ProfileSelectedEventListener,
    ProfileDeselectedEventListener,
    CleanupEventListener
{
  private readonly dirtyItems = new Lookup<ProfileId, ItemId>();
  private readonly profilesToRemove = new Set<ProfileId>();

  public constructor(
    @injectDB() private readonly db: Database,
    private readonly inventoryCache: InventoryCache,
    private readonly inventoryRepo: InventoryRepository
  ) {}

  public async getItemsByProfileId(profileId: ProfileId) {
    const cache = this.inventoryCache
      .getItemsByProfileId(profileId)
      ?.values()
      .toArray();
    if (cache) return cache;

    const items =
      (await this.inventoryRepo.getItemsByProfileId(profileId)) ?? [];
    items.forEach(this.inventoryCache.store.bind(this.inventoryCache));
    return items;
  }

  public async getItemById(profileId: ProfileId, itemId: ItemId) {
    if (!this.inventoryCache.hasProfileId(profileId)) {
      const items = await this.inventoryRepo.getItemsByProfileId(profileId);
      items.forEach(this.inventoryCache.store.bind(this.inventoryCache));
    }

    const cache = this.inventoryCache.getItemById(profileId, itemId);
    if (cache) return cache;
    const item = {
      profileId,
      itemId,
      count: 0,
      index: this.inventoryCache.getItemCount(profileId),
    };
    this.inventoryCache.store(item);
    return item;
  }

  public updateItem(profileId: ProfileId, itemId: ItemId) {
    this.dirtyItems.add(profileId, itemId);
  }

  public async onProfileSelected({
    profileId,
  }: ProfileSelectedEventData): Promise<void> {
    if (this.inventoryCache.hasProfileId(profileId)) return;
    const items = await this.inventoryRepo.getItemsByProfileId(profileId);
    items.forEach(this.inventoryCache.store.bind(this.inventoryCache));
  }
  public onProfileDeselected({
    profileId,
  }: ProfileDeselectedEventData): void | Promise<void> {
    this.profilesToRemove.add(profileId);
  }

  public async cleanup(): Promise<void> {
    try {
      await this.db.transaction(async (tx) => {
        for (const [profileId, itemId] of this.dirtyItems.values()) {
          const item = this.inventoryCache.getItemById(profileId, itemId);
          if (item) await this.inventoryRepo.updateItem(item, tx);
        }
      });
      this.dirtyItems.clear();
      this.profilesToRemove.forEach(
        this.inventoryCache.invalidateInventory.bind(this.inventoryCache)
      );
      this.profilesToRemove.clear();
    } catch (error) {
      console.error(`Failed saving inventories`, error);
    }
  }
}
