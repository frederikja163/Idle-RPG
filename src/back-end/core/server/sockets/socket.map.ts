import type { ProfileId, UserId } from '../../db/db.types';
import type { SocketId } from './sockets.types';
import { Lookup } from '@/shared/lib/lookup';
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
export class SocketMap
  implements
    UserLoginEventListener,
    UserLogoutEventListener,
    ProfileSelectedEventListener,
    ProfileDeselectedEventListener
{
  private readonly userToSocket = new Lookup<UserId, SocketId>();
  private readonly profileToSocket = new Lookup<ProfileId, SocketId>();

  public getSocketsForUser(userId: UserId) {
    return this.userToSocket.get(userId);
  }

  public getSocketsForProfile(profileId: ProfileId) {
    return this.profileToSocket.get(profileId);
  }

  public onUserLoggedIn(socketId: SocketId, userId: UserId): void | Promise<void> {
    this.userToSocket.add(userId, socketId);
  }
  public onUserLoggedOut(socketId: SocketId, userId: UserId): void | Promise<void> {
    this.userToSocket.remove(userId, socketId);
  }
  public onProfileSelected(socketId: SocketId, profileId: ProfileId): void | Promise<void> {
    this.profileToSocket.add(profileId, socketId);
  }
  public onProfileDeselected(socketId: SocketId, profileId: ProfileId): void | Promise<void> {
    this.profileToSocket.remove(profileId, socketId);
  }
}
