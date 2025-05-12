import type { ItemType, ProfileId } from '@/back-end/core/db/db.types';
import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';
import type { ItemId } from '@/shared/definition/definition.items';
import { Table } from '@/shared/lib/table';

@injectableSingleton()
export class InventoryCache {
  private readonly profileToItems = new Table<ProfileId, ItemId, ItemType>();

  public getByProfileId(profileId: ProfileId) {
    return this.profileToItems.getColumn(profileId);
  }

  public getById(profileId: ProfileId, itemId: ItemId) {
    return this.profileToItems.getCell(profileId, itemId);
  }

  public hasInventory(profileId: ProfileId) {
    return this.profileToItems.hasColumn(profileId);
  }

  public hasItem(profileId: ProfileId, itemId: ItemId) {
    return this.profileToItems.hasCell(profileId, itemId);
  }

  public invalidateInventory(profileId: ProfileId) {
    this.profileToItems.deleteColumn(profileId);
  }

  public storeInventory(profileId: ProfileId, inventory: ItemType[]) {
    inventory.forEach((i) => this.profileToItems.add(profileId, i.itemId, i));
  }

  public storeItem(profileId: ProfileId, item: ItemType) {
    this.profileToItems.add(profileId, item.itemId, item);
  }
}
