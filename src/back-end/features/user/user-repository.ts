import { eq, inArray, sql } from 'drizzle-orm';
import { usersTable } from '@/shared/definition/schema/db/db-users';
import { injectDB, type Database, type Transaction } from '@/back-end/core/db/db';
import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';
import type { User, UserId, UserInsert } from '@/shared/definition/schema/types/types-user';
import { timestampNow } from '@/shared/definition/schema/db/db-types';

@injectableSingleton()
export class UserRepository {
  constructor(@injectDB() private readonly db: Database) {}

  public async create(data: UserInsert, tx: Transaction): Promise<User | null> {
    const [user] = await tx
      .insert(usersTable)
      .values(data)
      .onConflictDoUpdate({
        target: usersTable.id,
        set: {
          profilePicture: data.profilePicture,
          lastLogin: timestampNow,
        },
      })
      .returning();
    return user;
  }

  public async findById(userId: UserId): Promise<User | null> {
    try {
      const [user] = await this.db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      return user ?? null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public async findByGoogleId(googleId: string): Promise<User | null> {
    try {
      const [user] = await this.db.select().from(usersTable).where(eq(usersTable.googleId, googleId));
      return user ?? null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public async update(userId: UserId, data: Partial<User>, tx: Transaction) {
    await tx
      .update(usersTable)
      .set({ ...data, lastLogin: timestampNow })
      .where(eq(usersTable.id, userId))
      .returning();
  }

  public async updateTimes(userIds: UserId[], tx: Transaction) {
    await tx
      .update(usersTable)
      .set({
        lastLogin: timestampNow,
      })
      .where(inArray(usersTable.id, userIds));
  }

  public async delete(userId: UserId, tx: Transaction) {
    await tx.delete(usersTable).where(eq(usersTable.id, userId));
  }
}
