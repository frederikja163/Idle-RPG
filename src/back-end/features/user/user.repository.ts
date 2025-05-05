import { eq, inArray, sql } from 'drizzle-orm';
import type { OmitAutoFields, UserType } from '@/back-end/core/db/db.types';
import { users } from '@/back-end/core/db/schema/schema.users';
import { injectDB, type Database, type Transaction } from '@/back-end/core/db/db';
import { injectableSingleton } from '@/back-end/core/lib/lib.tsyringe';

@injectableSingleton()
export class UserRepository {
  constructor(@injectDB() private readonly db: Database) {}

  public async create(data: OmitAutoFields<UserType>, tx: Transaction): Promise<UserType | null> {
    const [user] = await tx
      .insert(users)
      .values(data)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          profilePicture: data.profilePicture,
          lastLogin: sql`CURRENT_TIMESTAMP`,
        },
      })
      .returning();
    return user;
  }

  public async findById(userId: number): Promise<UserType | null> {
    try {
      const [user] = await this.db.select().from(users).where(eq(users.id, userId)).limit(1);
      return user ?? null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public async findByGoogleId(googleId: string): Promise<UserType | null> {
    try {
      const [user] = await this.db.select().from(users).where(eq(users.googleId, googleId));
      return user ?? null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public async update(userId: number, data: Partial<OmitAutoFields<UserType>>, tx: Transaction) {
    await tx
      .update(users)
      .set({ ...data, lastLogin: sql`CURRENT_TIMESTAMP` })
      .where(eq(users.id, userId))
      .returning();
  }

  public async updateTimes(userIds: number[], tx: Transaction) {
    await tx
      .update(users)
      .set({
        lastLogin: sql`CURRENT_TIMESTAMP`,
      })
      .where(inArray(users.id, userIds));
  }

  public async delete(userId: number, tx: Transaction) {
    await tx.delete(users).where(eq(users.id, userId));
  }
}
