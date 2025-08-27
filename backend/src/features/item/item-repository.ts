import { injectDB, type Database, type Transaction } from '@/backend/core/db/db';
import { itemsTable } from '@/shared/definition/schema/db/db-items';
import { eq } from 'drizzle-orm';
import { injectableSingleton } from '@/backend/core/lib/lib-tsyringe';
import type { ProfileId } from '@/shared/definition/schema/types/types-profiles';
import type { Item } from '@/shared/definition/schema/types/types-items';

@injectableSingleton()
export class ItemRepository {
  public constructor(@injectDB() private readonly db: Database) {}

  public async getItemsByProfileId(profileId: ProfileId) {
    return await this.db.select().from(itemsTable).where(eq(itemsTable.profileId, profileId));
  }

  public async updateItems(profileId: ProfileId, items: Item[], tx: Transaction) {
    await tx.delete(itemsTable).where(eq(itemsTable.profileId, profileId));
    await tx.insert(itemsTable).values(items);
  }

  public async update(item: Item, tx: Transaction) {
    await tx
      .insert(itemsTable)
      .values(item)
      .onConflictDoUpdate({
        target: [itemsTable.profileId, itemsTable.id],
        set: item,
      });
  }
}
