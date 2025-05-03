import { container, injectable, singleton } from 'tsyringe';
import { ProfileCache } from '../features/profile/profile.cache';
import { SocketCache } from './sockets/socket.cache';
import { UserCache } from '../features/user/user.cache';
import type { ICache } from './cache';

@injectable()
@singleton()
export class CacheCleanup {
  private timeout?: NodeJS.Timeout;

  private readonly caches: ICache[];

  public constructor(socketCache: SocketCache, profileCache: ProfileCache, userCache: UserCache) {
    this.caches = [socketCache, profileCache, userCache];
  }

  public start(interval: number) {
    if (this.timeout) this.timeout.close();

    this.timeout = setInterval(this.cleanup.bind(this), interval);
  }

  private async cleanup() {
    if (global.gc) {
      global.gc();
    }
    return Promise.all(this.caches.map((c) => c.cleanup()));
  }
}
