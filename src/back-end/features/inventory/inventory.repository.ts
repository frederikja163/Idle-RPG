import { injectDB, type Database, type Transaction } from '@/back-end/core/db/db';
import type { ItemType, ProfileId } from '@/back-end/core/db/db.types';
import { items } from '@/back-end/core/db/schema/schema.items';
import { eq } from 'drizzle-orm';
import { injectableSingleton } from '@/back-end/core/lib/lib.tsyringe';

@injectableSingleton()
export class InventoryRepository {
  public constructor(@injectDB() private readonly db: Database) {}

  public async getByProfileId(profileId: ProfileId) {
    return (await this.db.select().from(items).where(eq(items.profileId, profileId)).orderBy(items.index)) ?? [];
  }

  public async updateItems(profileId: ProfileId, inventory: Omit<ItemType, 'profileId' | 'index'>[], tx: Transaction) {
    await this.deleteItems(profileId, tx);
    await tx.insert(items).values(
      inventory.map((item, index) => ({
        ...item,
        profileId,
        index,
      })),
    );
  }

  public async deleteItems(profileId: ProfileId, tx: Transaction) {
    await tx.delete(items).where(eq(items.profileId, profileId));
  }
}
