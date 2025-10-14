import { CleanupEventToken } from './cleanup-event';
import { injectableSingleton, resolveAll } from '../lib/lib-tsyringe';

@injectableSingleton()
export class CleanupEventDispatcher {
  private timeout?: NodeJS.Timeout;

  public start(interval: number) {
    if (this.timeout) clearInterval(this.timeout);

    console.log('Cleanup interval: ', interval);
    this.timeout = setInterval(this.cleanup.bind(this), interval);
  }

  public async cleanup() {
    const listeners = resolveAll(CleanupEventToken).filter((l) => l.cleanup);
    for (const listener of listeners) {
      await listener.cleanup();
    }
  }
}
