import {
  SocketCloseEventToken,
  SocketOpenEventToken,
  type SocketCloseEventData,
  type SocketOpenEventData,
} from './socket-event';
import { injectableSingleton, resolveAll } from '../lib/lib-tsyringe';

@injectableSingleton()
export class SocketEventDispatcher {
  public emitSocketOpen(event: SocketOpenEventData) {
    const listeners = resolveAll(SocketOpenEventToken).filter((l) => l.onSocketOpen);
    for (const listener of listeners) {
      listener.onSocketOpen(event);
    }
  }

  public emitSocketClose(event: SocketCloseEventData) {
    const listeners = resolveAll(SocketCloseEventToken).filter((l) => l.onSocketClose);
    for (const listener of listeners) {
      listener.onSocketClose(event);
    }
  }
}
