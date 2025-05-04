import type { SocketId } from './sockets.types';
import type { ProfileId, UserId } from '../../db/db.types';
import {
  UserLoginEventToken,
  UserLogoutEventToken,
  type UserLoginEventListener,
  type UserLogoutEventListener,
} from '../../events/user.event';
import {
  ProfileDeselectedEventToken,
  ProfileSelectedEventToken,
  type ProfileDeselectedEventListener,
  type ProfileSelectedEventListener,
} from '../../events/profile.event';
import { injectableSingleton } from '../../lib/lib.tsyringe';

@injectableSingleton(UserLoginEventToken, UserLogoutEventToken, ProfileSelectedEventToken, ProfileDeselectedEventToken)
export class SocketSessionStore
  implements
    UserLoginEventListener,
    UserLogoutEventListener,
    ProfileSelectedEventListener,
    ProfileDeselectedEventListener
{
  private readonly userIds = new Map<SocketId, UserId>();
  private readonly profileId = new Map<SocketId, ProfileId>();

  public getUserId(socketId: SocketId) {
    return this.userIds.get(socketId);
  }

  public getProfileId(socketId: SocketId) {
    return this.profileId.get(socketId);
  }

  public onProfileSelected(socketId: SocketId, profile: ProfileId): void | Promise<void> {
    this.profileId.set(socketId, profile);
  }
  public onProfileDeselected(socketId: SocketId, profile: ProfileId): void | Promise<void> {
    this.profileId.delete(socketId);
  }
  public onUserLoggedIn(socketId: SocketId, userId: UserId): void | Promise<void> {
    this.userIds.set(socketId, userId);
  }
  public onUserLoggedOut(socketId: SocketId, userId: UserId): void | Promise<void> {
    this.userIds.delete(socketId);
  }
}
