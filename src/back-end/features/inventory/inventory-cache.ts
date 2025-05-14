import { injectableSingleton } from "@/back-end/core/lib/lib-tsyringe";
import type {
  Item,
  ItemId,
} from "@/shared/definition/schema/types/types-items";
import type { ProfileId } from "@/shared/definition/schema/types/types-profiles";
import { Table } from "@/shared/lib/table";

@injectableSingleton()
export class InventoryCache {
  private readonly profileToItems = new Table<ProfileId, ItemId, Item>();

  public getItemsByProfileId(profileId: ProfileId) {
    return this.profileToItems.getColumn(profileId);
  }

  public getItemById(profileId: ProfileId, itemId: ItemId) {
    return this.profileToItems.getCell(profileId, itemId);
  }

  public hasProfileId(profileId: ProfileId) {
    return this.profileToItems.hasColumn(profileId);
  }

  public hasItem(profileId: ProfileId, itemId: ItemId) {
    return this.profileToItems.hasCell(profileId, itemId);
  }

  public getItemCount(profileId: string) {
    return this.profileToItems.getColumn(profileId)?.size ?? 0;
  }

  public invalidateInventory(profileId: ProfileId) {
    this.profileToItems.deleteColumn(profileId);
  }

  public store(item: Item) {
    this.profileToItems.add(item.profileId, item.itemId, item);
  }
}
