import type { ProfileId } from '../db/db.types';
import type { SocketId } from '../server/sockets/sockets.types';

export interface ProfileSelectedEventListener {
  onProfileSelected(socketId: SocketId, profileId: ProfileId): void | Promise<void>;
}
export class ProfileSelectedEventToken {}

export interface ProfileDeselectedEventListener {
  onProfileDeselected(socketId: SocketId, profileId: ProfileId): void | Promise<void>;
}
export class ProfileDeselectedEventToken {}

export interface ProfileCreatedEventListener {
  onProfileCreated(socketId: SocketId, profileId: ProfileId): void | Promise<void>;
}
export class ProfileCreatedEventToken {}

export interface ProfileDeletedEventListener {
  onProfileDeleted(socketId: SocketId, profileId: ProfileId): void | Promise<void>;
}
export class ProfileDeletedEventToken {}
