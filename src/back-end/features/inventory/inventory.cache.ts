import type { ItemType, ProfileId } from '@/back-end/core/db/db.types';
import { injectableSingleton } from '@/back-end/core/lib/lib.tsyringe';

@injectableSingleton()
export class InventoryCache {
  private readonly profileToItems = new Map<ProfileId, ItemType[]>();

  public getByProfileId(profileId: ProfileId) {
    return this.profileToItems.get(profileId);
  }

  public hasInventory(profileId: ProfileId) {
    return this.profileToItems.has(profileId);
  }

  public invalidateInventory(profileId: ProfileId) {
    this.profileToItems.delete(profileId);
  }

  public storeInventory(profileId: ProfileId, inventory: ItemType[]) {
    this.profileToItems.set(profileId, inventory);
  }
}
