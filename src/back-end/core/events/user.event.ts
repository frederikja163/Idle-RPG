import type { UserId } from '../db/db.types';
import type { SocketId } from '../server/sockets/sockets.types';

export interface UserLoginEventListener {
  onUserLoggedIn(socketId: SocketId, userId: UserId): void | Promise<void>;
}
export class UserLoginEventToken {}

export interface UserLogoutEventListener {
  onUserLoggedOut(socketId: SocketId, userId: UserId): void | Promise<void>;
}
export class UserLogoutEventToken {}
