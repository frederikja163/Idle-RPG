import { injectableSingleton } from '@/backend/core/lib/lib-tsyringe';
import type { Item, ItemId } from '@/shared/definition/schema/types/types-items';
import type { ProfileId } from '@/shared/definition/schema/types/types-profiles';
import { Table } from '@/shared/lib/table';

@injectableSingleton()
export class ItemCache {
  private readonly profileToItems = new Table<ProfileId, ItemId, Item>();

  public getItemsByProfileId(profileId: ProfileId) {
    return this.profileToItems.getColumn(profileId);
  }

  public getItemById(profileId: ProfileId, id: ItemId) {
    return this.profileToItems.getCell(profileId, id);
  }

  public *getMany(profileId: ProfileId, ids: ItemId) {
    const profileItems = this.profileToItems.getColumn(profileId);
    for (const id of ids) {
      yield profileItems?.get(id);
    }
  }

  public hasProfileId(profileId: ProfileId) {
    return this.profileToItems.hasColumn(profileId);
  }

  public hasItem(profileId: ProfileId, id: ItemId) {
    return this.profileToItems.hasCell(profileId, id);
  }

  public getItemCount(profileId: string) {
    return this.profileToItems.getColumn(profileId)?.size ?? 0;
  }

  public invalidateProfile(profileId: ProfileId) {
    this.profileToItems.deleteColumn(profileId);
  }

  public store(item: Item) {
    this.profileToItems.add(item.profileId, item.id, item);
  }
}
