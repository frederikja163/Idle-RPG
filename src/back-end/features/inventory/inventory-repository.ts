import { injectDB, type Database, type Transaction } from '@/back-end/core/db/db';
import type { ItemType, ProfileId } from '@/back-end/core/db/db.types';
import { itemsTable } from '@/back-end/core/db/schema/schema-items';
import { eq } from 'drizzle-orm';
import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';

@injectableSingleton()
export class InventoryRepository {
  public constructor(@injectDB() private readonly db: Database) {}

  public async getByProfileId(profileId: ProfileId) {
    return await this.db.select().from(itemsTable).where(eq(itemsTable.profileId, profileId)).orderBy(itemsTable.index);
  }

  public async updateItems(profileId: ProfileId, inventory: ItemType[], tx: Transaction) {
    await tx.delete(itemsTable).where(eq(itemsTable.profileId, profileId));
    await tx.insert(itemsTable).values(inventory);
  }

  public async updateItem(item: ItemType, tx: Transaction) {
    await tx
      .insert(itemsTable)
      .values(item)
      .onConflictDoUpdate({ target: [itemsTable.profileId, itemsTable.itemId], set: item });
  }
}
