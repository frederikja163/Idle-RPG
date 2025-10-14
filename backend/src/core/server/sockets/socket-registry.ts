import type { SocketId } from '@/shared/socket/socket-types';
import { injectableSingleton } from '../../lib/lib-tsyringe';
import type { ServerSocket } from './server-socket';

@injectableSingleton()
export class SocketRegistry {
  private readonly _sockets = new Map<SocketId, ServerSocket>();

  public addSocket(socket: ServerSocket) {
    this._sockets.set(socket.id, socket);
  }

  public getSocket(socketId: SocketId) {
    return this._sockets.get(socketId);
  }

  public getAllSockets() {
    return this._sockets.values();
  }

  public removeSocket(socketId: SocketId) {
    this._sockets.delete(socketId);
  }
}
