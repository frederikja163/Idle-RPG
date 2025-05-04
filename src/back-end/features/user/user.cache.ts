import type { UserType } from '@/back-end/core/db/db.types';
import { CleanupEventToken, type CleanupEventListener } from '@/back-end/core/events/cleanup.event';
import { UserRepository } from './user.repository';
import { injectableSingleton } from '@/back-end/core/lib/lib.tsyringe';

@injectableSingleton(CleanupEventToken)
export class UserCache implements CleanupEventListener {
  private readonly usersByGoogleId = new Map<string, WeakRef<UserType>>();

  public constructor(private readonly userRepo: UserRepository) {}

  public async findByGoogleId(googleId: string, email: string, profilePicture: string) {
    const cached = this.usersByGoogleId.get(googleId)?.deref();
    if (cached) return cached;

    const user =
      (await this.userRepo.findByGoogleId(googleId)) ??
      (await this.userRepo.create({ googleId, email, profilePicture }));
    if (!user) throw Error('Something went wrong trying to create profile.');

    this.usersByGoogleId.set(user.googleId, new WeakRef(user));
    return user;
  }

  public async cleanup() {
    for (const [googleId, userRef] of this.usersByGoogleId) {
      const user = userRef.deref();
      if (user) this.userRepo.update(user.id, user);
      else this.usersByGoogleId.delete(googleId);
    }
  }
}
