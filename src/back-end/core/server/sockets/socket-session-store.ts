import { injectableSingleton } from '../../lib/lib-tsyringe';
import {
  SocketCloseEventToken,
  SocketOpenEventToken,
  type SocketCloseEventData,
  type SocketCloseEventListener,
  type SocketOpenEventData,
  type SocketOpenEventListener,
} from '../../events/socket-event';
import { Lookup } from '@/shared/lib/lookup';
import type { UserId } from '@/shared/definition/schema/types/types-user';
import type { ProfileId } from '@/shared/definition/schema/types/types-profiles';
import type { SocketId } from '@/shared/socket/socket-types';

@injectableSingleton(SocketOpenEventToken, SocketCloseEventToken)
export class SocketSessionStore implements SocketOpenEventListener, SocketCloseEventListener {
  private readonly sessions = new Map<SocketId, { userId?: UserId; profileId?: ProfileId }>();
  private readonly userToSockets = new Lookup<UserId, SocketId>();
  private readonly profileToSockets = new Lookup<ProfileId, SocketId>();

  public getUserId(socketId: SocketId) {
    return this.sessions.get(socketId)?.userId;
  }

  public getProfileId(socketId: SocketId) {
    return this.sessions.get(socketId)?.profileId;
  }

  public getSocketsForUser(userId: UserId) {
    return this.userToSockets.get(userId);
  }

  public anySocketsForUser(userId: UserId) {
    return this.userToSockets.get(userId)?.size !== 0;
  }

  public getSocketsForProfile(profileId: ProfileId) {
    return this.profileToSockets.get(profileId);
  }

  public anySocketsForProfile(profileId: ProfileId) {
    return this.profileToSockets.get(profileId)?.size !== 0;
  }

  public setUserId(socketId: SocketId, userId?: UserId) {
    const session = this.sessions.get(socketId);
    if (!session) {
      throw new Error(`Session not found for socket ${socketId}`);
    }
    if (session.userId) {
      this.userToSockets.remove(session.userId, socketId);
    }
    session.userId = userId;
    if (userId) {
      this.userToSockets.add(userId, socketId);
    }
  }

  public setProfileId(socketId: SocketId, profileId: ProfileId) {
    const session = this.sessions.get(socketId);
    if (!session) {
      throw new Error(`Session not found for socket ${socketId}`);
    }
    if (session.profileId) {
      this.profileToSockets.remove(session.profileId, socketId);
    }
    session.profileId = profileId;
    if (profileId) {
      this.profileToSockets.add(session.profileId, socketId);
    }
  }

  public onSocketOpen({ socketId }: SocketOpenEventData) {
    this.sessions.set(socketId, {});
  }

  public onSocketClose({ socketId }: SocketCloseEventData) {
    this.sessions.delete(socketId);
  }

  public get userCount() {
    return this.userToSockets.size;
  }

  public get profileCount() {
    return this.profileToSockets.size;
  }

  public get socketCount() {
    return this.sessions.size;
  }
}
