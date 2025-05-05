import { container, injectAll } from 'tsyringe';
import { CleanupEventToken, type CleanupEventListener } from './cleanup.event';
import { injectableSingleton } from '../lib/lib.tsyringe';

@injectableSingleton()
export class CleanupEventDispatcher {
  private timeout?: NodeJS.Timeout;

  public start(interval: number) {
    if (this.timeout) clearInterval(this.timeout);

    this.timeout = setInterval(this.cleanup.bind(this), interval);
  }

  private async cleanup() {
    const listeners = container.resolveAll<CleanupEventListener>(CleanupEventToken).filter((l) => l.cleanup);
    const results = await Promise.allSettled(listeners.map((c) => c.cleanup()));
    for (const result of results) {
      if (result.status === 'rejected') {
        console.error('Cache cleanup failed: ', result.reason);
      }
    }
  }
}
