import { SocketRegistry } from './socket-registry';
import { SocketSessionStore } from './socket-session-store';
import { injectableSingleton } from '../../lib/lib-tsyringe';
import type { UserId } from '@/shared/definition/schema/types/types-user';
import type { ProfileId } from '@/shared/definition/schema/types/types-profiles';
import type { ClientEvent, DataType, ServerClientEvent, SocketId } from '@/shared/socket/socket-types';

@injectableSingleton()
export class SocketHub {
  public constructor(
    private readonly socketRegistry: SocketRegistry,
    private readonly socketSessionStore: SocketSessionStore,
  ) {}

  public getSocket(socketId: SocketId) {
    return this.socketRegistry.getSocket(socketId);
  }

  public getUserId(socketId: SocketId) {
    return this.socketSessionStore.getUserId(socketId);
  }

  public setUserId(socketId: SocketId, userId?: UserId) {
    this.socketSessionStore.setUserId(socketId, userId);
  }

  public getProfileId(socketId: SocketId) {
    return this.socketSessionStore.getProfileId(socketId);
  }

  public setProfileId(socketId: SocketId, profileId: ProfileId) {
    return this.socketSessionStore.setProfileId(socketId, profileId);
  }

  public anySocketsForUser(userId: UserId) {
    return this.socketSessionStore.getSocketsForProfile(userId);
  }

  public anySocketsForProfile(profileId: ProfileId) {
    return this.socketSessionStore.getSocketsForProfile(profileId);
  }

  public broadcastToProfile<TEvent extends ClientEvent>(
    profileId: ProfileId,
    event: TEvent,
    data: DataType<ServerClientEvent, TEvent>,
  ) {
    this.socketSessionStore.getSocketsForProfile(profileId)?.forEach((s) => {
      const socket = this.socketRegistry.getSocket(s);
      socket?.send(event, data);
    });
  }

  public broadcastToUser<TEvent extends ClientEvent>(
    userId: UserId,
    event: TEvent,
    data: DataType<ServerClientEvent, TEvent>,
  ) {
    this.socketSessionStore.getSocketsForUser(userId)?.forEach((s) => {
      const socket = this.socketRegistry.getSocket(s);
      socket?.send(event, data);
    });
  }
}
