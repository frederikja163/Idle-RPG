import { injectAll } from 'tsyringe';
import {
  SocketCloseEventToken,
  SocketOpenEventToken,
  type SocketCloseEventListener,
  type SocketOpenEventListener,
} from './socket.event';
import type { SocketId } from '../server/sockets/sockets.types';
import { injectableSingleton } from '../lib/lib.tsyringe';

@injectableSingleton()
export class SocketEventDispatcher {
  public constructor(
    @injectAll(SocketOpenEventToken, { isOptional: true })
    private readonly openListeners: SocketOpenEventListener[] = [],
    @injectAll(SocketCloseEventToken, { isOptional: true })
    private readonly closeListeners: SocketCloseEventListener[],
  ) {
    this.openListeners = this.openListeners.filter((l) => l.onSocketOpen);
    console.log('Socket open listeners: ', this.openListeners.length);
    this.closeListeners = this.closeListeners.filter((l) => l.onSocketClose);
    console.log('Socket close listeners: ', this.closeListeners.length);
  }

  public emitSocketOpen(socketId: SocketId) {
    for (const listener of this.openListeners) {
      listener.onSocketOpen(socketId);
    }
  }

  public emitSocketClose(socketId: SocketId) {
    for (const listener of this.closeListeners) {
      listener.onSocketClose(socketId);
    }
  }
}
