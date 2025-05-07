import { CleanupEventToken } from './cleanup-event';
import { injectableSingleton, resolveAll } from '../lib/lib-tsyringe';

@injectableSingleton()
export class CleanupEventDispatcher {
  private timeout?: NodeJS.Timeout;

  public start(interval: number) {
    if (this.timeout) clearInterval(this.timeout);

    this.timeout = setInterval(this.cleanup.bind(this), interval);
  }

  private async cleanup() {
    const listeners = resolveAll(CleanupEventToken).filter((l) => l.cleanup);
    for (const listener of listeners) {
      await listener.cleanup();
    }
  }
}
