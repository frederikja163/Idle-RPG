import { injectAll } from 'tsyringe';
import { CleanupEventToken, type CleanupEventListener } from './cleanup.event';
import { injectableSingleton } from '../lib/lib.tsyringe';

@injectableSingleton()
export class CleanupEventDispatcher {
  private timeout?: NodeJS.Timeout;

  public constructor(
    @injectAll(CleanupEventToken, { isOptional: true }) private readonly listeners: CleanupEventListener[],
  ) {
    this.listeners = this.listeners.filter((l) => l.cleanup);
    console.log('Cleanup listeners: ', listeners.length);
  }

  public start(interval: number) {
    if (this.timeout) clearInterval(this.timeout);

    this.timeout = setInterval(this.cleanup.bind(this), interval);
  }

  private async cleanup() {
    if (global.gc) {
      global.gc();
    }
    const results = await Promise.allSettled(this.listeners.map((c) => c.cleanup()));
    for (const result of results) {
      if (result.status === 'rejected') {
        console.error('Cache cleanup failed: ', result.reason);
      }
    }
  }
}
