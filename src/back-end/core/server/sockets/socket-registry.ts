import { injectableSingleton } from '../../lib/lib-tsyringe';
import type { ServerSocket } from './server-socket';
import type { SocketId } from './socket-types';

@injectableSingleton()
export class SocketRegistry {
  private readonly _sockets = new Map<SocketId, ServerSocket>();

  public addSocket(socket: ServerSocket) {
    this._sockets.set(socket.id, socket);
  }

  public getSocket(socketId: SocketId) {
    return this._sockets.get(socketId);
  }

  public removeSocket(socketId: SocketId) {
    this._sockets.delete(socketId);
  }
}
