import { InjectDB, type Database } from '@/back-end/core/db/db';
import type { ItemType, ProfileId } from '@/back-end/core/db/db.types';
import { items } from '@/back-end/core/db/schema/schema.items';
import { injectable, singleton } from 'tsyringe';
import { eq } from 'drizzle-orm';

@injectable()
@singleton()
export class InventoryRepository {
  public constructor(@InjectDB() private readonly db: Database) {}

  public async getByProfileId(profileId: ProfileId) {
    try {
      return (await this.db.select().from(items).where(eq(items.profileId, profileId)).orderBy(items.index)) ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  public async replaceItems(profileId: ProfileId, inventory: Omit<ItemType, 'profileId' | 'index'>[]) {
    try {
      await this.db.transaction(async (tx) => {
        await tx.delete(items).where(eq(items.profileId, profileId));
        await tx.insert(items).values(
          inventory.map((item, index) => ({
            ...item,
            profileId,
            index,
          })),
        );
      });
    } catch (error) {
      console.error(error);
    }
  }
}
