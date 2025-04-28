import type { ItemType } from "@/shared/socket-events";
import { database, type ProfileId } from "./database";
import type { inventoryTable } from "./db/schema";

export class Inventory {
  private static readonly _needsSave = new Set<Inventory>();
  private readonly _items: ItemType[];
  private readonly _profileId: ProfileId;

  private constructor(profileId: ProfileId, items: ItemType[]) {
    this._profileId = profileId;
    this._items = items;
  }

  public get items() {
    return this._items;
  }

  public save() {
    Inventory._needsSave.add(this);
  }

  public static async createInventory(profileId: ProfileId) {
    const items = await database.getInventory(profileId);
    return new Inventory(profileId, items);
  }

  public static async saveAll() {
    for (const inventory of this._needsSave) {
      await database.saveInventory(inventory._profileId, inventory._items);
    }
  }
}
