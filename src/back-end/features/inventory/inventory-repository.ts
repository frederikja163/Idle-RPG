import {
  injectDB,
  type Database,
  type Transaction,
} from "@/back-end/core/db/db";
import { itemsTable } from "@/shared/definition/schema/db/db-items";
import { eq } from "drizzle-orm";
import { injectableSingleton } from "@/back-end/core/lib/lib-tsyringe";
import type { ProfileId } from "@/shared/definition/schema/types/types-profiles";
import type { Item } from "@/shared/definition/schema/types/types-items";

@injectableSingleton()
export class InventoryRepository {
  public constructor(@injectDB() private readonly db: Database) {}

  public async getItemsByProfileId(profileId: ProfileId) {
    return await this.db
      .select()
      .from(itemsTable)
      .where(eq(itemsTable.profileId, profileId))
      .orderBy(itemsTable.index);
  }

  public async updateItems(
    profileId: ProfileId,
    inventory: Item[],
    tx: Transaction
  ) {
    await tx.delete(itemsTable).where(eq(itemsTable.profileId, profileId));
    await tx.insert(itemsTable).values(inventory);
  }

  public async updateItem(item: Item, tx: Transaction) {
    await tx
      .insert(itemsTable)
      .values(item)
      .onConflictDoUpdate({
        target: [itemsTable.profileId, itemsTable.itemId],
        set: item,
      });
  }
}
