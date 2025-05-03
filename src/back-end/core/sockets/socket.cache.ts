import { Table } from '@/shared/table';
import type { ServerSocket } from './server.socket';
import type { ProfileId, UserId } from '../db/db.types';
import { injectable, singleton } from 'tsyringe';
import type { ICache } from '../cache';
import type { SocketId } from './sockets.types';

@injectable()
@singleton()
export class SocketCache implements ICache {
  private readonly socketsByUserId = new Table<UserId, SocketId, WeakRef<ServerSocket>>();
  private readonly socketsByProfileId = new Table<ProfileId, SocketId, WeakRef<ServerSocket>>();

  public addUserId(userId: UserId, socket: ServerSocket) {
    this.socketsByUserId.add(userId, socket.id, new WeakRef(socket));
  }

  public getByUserId(userId: UserId) {
    return this.socketsByUserId
      .getColumn(userId)
      ?.map(([_, s]) => s.deref())
      .filter((s) => s !== undefined);
  }

  public hasUserId(userId: UserId) {
    return this.socketsByUserId.hasColumn(userId);
  }

  public removeUserId(userId: UserId, socket: ServerSocket) {
    return this.socketsByUserId.deleteCell(userId, socket.id);
  }

  public addProfileId(profileId: ProfileId, socket: ServerSocket) {
    return this.socketsByProfileId.add(profileId, socket.id, new WeakRef(socket));
  }

  public getByProfileId(profileId: ProfileId) {
    return this.socketsByProfileId
      .getColumn(profileId)
      ?.map(([_, s]) => s.deref())
      .filter((s) => s !== undefined);
  }

  public hasProfileId(profileId: ProfileId) {
    return this.socketsByProfileId.hasColumn(profileId);
  }

  public removeProfileId(profileId: ProfileId, socket: ServerSocket) {
    return this.socketsByProfileId.deleteCell(profileId, socket.id);
  }

  public cleanup() {
    SocketCache.cleanup(this.socketsByUserId);
    SocketCache.cleanup(this.socketsByProfileId);
  }

  private static cleanup<T extends WeakKey>(table: Table<number, SocketId, WeakRef<T>>) {
    for (const [id, socketId, socketRef] of table.getCells()) {
      if (!socketRef.deref()) {
        table.deleteCell(id, socketId);
        console.log('cleanup');
      }
    }
  }
}
