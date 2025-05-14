import { injectDB, type Database } from "@/back-end/core/db/db";
import { ItemCache } from "./item-cache";
import { ItemRepository } from "./item-repository";
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
export class ItemService
  implements
    ProfileSelectedEventListener,
    ProfileDeselectedEventListener,
    CleanupEventListener
{
  private readonly dirtyItems = new Lookup<ProfileId, ItemId>();
  private readonly profilesToRemove = new Set<ProfileId>();

  public constructor(
    @injectDB() private readonly db: Database,
    private readonly itemCache: ItemCache,
    private readonly itemRepo: ItemRepository
  ) {}

  public async getItemsByProfileId(profileId: ProfileId) {
    const cache = this.itemCache
      .getItemsByProfileId(profileId)
      ?.values()
      .toArray();
    if (cache) return cache;

    const items = (await this.itemRepo.getItemsByProfileId(profileId)) ?? [];
    items.forEach(this.itemCache.store.bind(this.itemCache));
    return items;
  }

  public async getItemById(profileId: ProfileId, itemId: ItemId) {
    if (!this.itemCache.hasProfileId(profileId)) {
      const items = await this.itemRepo.getItemsByProfileId(profileId);
      items.forEach(this.itemCache.store.bind(this.itemCache));
    }

    const cache = this.itemCache.getItemById(profileId, itemId);
    if (cache) return cache;
    const item = {
      profileId,
      itemId,
      count: 0,
      index: this.itemCache.getItemCount(profileId),
    };
    this.itemCache.store(item);
    return item;
  }

  public updateItem(profileId: ProfileId, itemId: ItemId) {
    this.dirtyItems.add(profileId, itemId);
  }

  public async onProfileSelected({
    profileId,
  }: ProfileSelectedEventData): Promise<void> {
    if (this.itemCache.hasProfileId(profileId)) return;
    const items = await this.itemRepo.getItemsByProfileId(profileId);
    items.forEach(this.itemCache.store.bind(this.itemCache));
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
          const item = this.itemCache.getItemById(profileId, itemId);
          if (item) await this.itemRepo.updateItem(item, tx);
        }
      });
      this.dirtyItems.clear();
      this.profilesToRemove.forEach(
        this.itemCache.invalidateProfile.bind(this.itemCache)
      );
      this.profilesToRemove.clear();
    } catch (error) {
      console.error(`Failed saving inventories`, error);
    }
  }
}
