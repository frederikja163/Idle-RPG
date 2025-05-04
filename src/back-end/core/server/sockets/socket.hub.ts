import { SocketMap } from './socket.map';
import { SocketRegistry } from './socket.registry';
import { SocketSessionStore } from './socket.session.store';
import type { ClientEvent, SocketId } from './sockets.types';
import type { ProfileId, UserId } from '../../db/db.types';
import type { DataType } from '@/shared/socket';
import type { ServerClientEvent } from '@/shared/socket/socket.events';
import { injectableSingleton } from '../../lib/lib.tsyringe';

@injectableSingleton()
export class SocketHub {
  public constructor(
    private readonly socketRegistry: SocketRegistry,
    private readonly socketMap: SocketMap,
    private readonly socketSessionStore: SocketSessionStore,
  ) {}

  public getSocket(socketId: SocketId) {
    return this.socketRegistry.getSocket(socketId);
  }

  public getUserId(socketId: SocketId) {
    return this.socketSessionStore.getUserId(socketId);
  }

  public getProfileId(socketId: SocketId) {
    return this.socketSessionStore.getProfileId(socketId);
  }

  public anySocketsForUser(userId: UserId) {
    return this.socketMap.getSocketsForProfile(userId);
  }

  public anySocketsForProfile(profileId: ProfileId) {
    return this.socketMap.getSocketsForProfile(profileId);
  }

  public broadcastToProfile<TEvent extends ClientEvent>(
    profileId: ProfileId,
    event: TEvent,
    data: DataType<ServerClientEvent, TEvent>,
  ) {
    this.socketMap.getSocketsForProfile(profileId)?.forEach((s) => {
      const socket = this.socketRegistry.getSocket(s);
      socket?.send(event, data);
    });
  }

  public broadcastToUser<TEvent extends ClientEvent>(
    userId: UserId,
    event: TEvent,
    data: DataType<ServerClientEvent, TEvent>,
  ) {
    this.socketMap.getSocketsForUser(userId)?.forEach((s) => {
      const socket = this.socketRegistry.getSocket(s);
      socket?.send(event, data);
    });
  }
}
