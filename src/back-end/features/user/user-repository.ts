import { eq, inArray, sql } from 'drizzle-orm';
import type { OmitAutoFields, UserId, UserType } from '@/back-end/core/db/db.types';
import { usersTable } from '@/back-end/core/db/schema/schema-users';
import { injectDB, type Database, type Transaction } from '@/back-end/core/db/db';
import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';

@injectableSingleton()
export class UserRepository {
  constructor(@injectDB() private readonly db: Database) {}

  public async create(data: OmitAutoFields<UserType>, tx: Transaction): Promise<UserType | null> {
    const [user] = await tx
      .insert(usersTable)
      .values(data)
      .onConflictDoUpdate({
        target: usersTable.id,
        set: {
          profilePicture: data.profilePicture,
          lastLogin: sql`CURRENT_TIMESTAMP`,
        },
      })
      .returning();
    return user;
  }

  public async findById(userId: UserId): Promise<UserType | null> {
    try {
      const [user] = await this.db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      return user ?? null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public async findByGoogleId(googleId: string): Promise<UserType | null> {
    try {
      const [user] = await this.db.select().from(usersTable).where(eq(usersTable.googleId, googleId));
      return user ?? null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public async update(userId: UserId, data: Partial<OmitAutoFields<UserType>>, tx: Transaction) {
    await tx
      .update(usersTable)
      .set({ ...data, lastLogin: sql`CURRENT_TIMESTAMP` })
      .where(eq(usersTable.id, userId))
      .returning();
  }

  public async updateTimes(userIds: UserId[], tx: Transaction) {
    await tx
      .update(usersTable)
      .set({
        lastLogin: sql`CURRENT_TIMESTAMP`,
      })
      .where(inArray(usersTable.id, userIds));
  }

  public async delete(userId: UserId, tx: Transaction) {
    await tx.delete(usersTable).where(eq(usersTable.id, userId));
  }
}
