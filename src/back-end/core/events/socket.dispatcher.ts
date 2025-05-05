import { container, injectAll } from 'tsyringe';
import {
  SocketCloseEventToken,
  SocketOpenEventToken,
  type SocketCloseEventData,
  type SocketCloseEventListener,
  type SocketOpenEventData,
  type SocketOpenEventListener,
} from './socket.event';
import type { SocketId } from '../server/sockets/socket.types';
import { injectableSingleton } from '../lib/lib.tsyringe';

@injectableSingleton()
export class SocketEventDispatcher {
  public emitSocketOpen(event: SocketOpenEventData) {
    const listeners = container.resolveAll<SocketOpenEventListener>(SocketOpenEventToken).filter((l) => l.onSocketOpen);
    for (const listener of listeners) {
      listener.onSocketOpen(event);
    }
  }

  public emitSocketClose(event: SocketCloseEventData) {
    const listeners = container
      .resolveAll<SocketCloseEventListener>(SocketCloseEventToken)
      .filter((l) => l.onSocketClose);
    for (const listener of listeners) {
      listener.onSocketClose(event);
    }
  }
}
