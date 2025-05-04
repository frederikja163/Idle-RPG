import { injectAll } from 'tsyringe';
import {
  ProfileCreatedEventToken,
  ProfileDeletedEventToken,
  ProfileDeselectedEventToken,
  ProfileSelectedEventToken,
  type ProfileCreatedEventListener,
  type ProfileDeletedEventListener,
  type ProfileDeselectedEventListener,
  type ProfileSelectedEventListener,
} from './profile.event';
import type { SocketId } from '../server/sockets/sockets.types';
import type { ProfileId } from '../db/db.types';
import { injectableSingleton } from '../lib/lib.tsyringe';

@injectableSingleton()
export class ProfileEventDispatcher {
  public constructor(
    @injectAll(ProfileSelectedEventToken, { isOptional: true })
    private readonly selectedListeners: ProfileSelectedEventListener[],
    @injectAll(ProfileDeselectedEventToken, { isOptional: true })
    private readonly deselectedListeners: ProfileDeselectedEventListener[],
    @injectAll(ProfileCreatedEventToken, { isOptional: true })
    private readonly createdListeners: ProfileCreatedEventListener[],
    @injectAll(ProfileDeletedEventToken, { isOptional: true })
    private readonly deletedListeners: ProfileDeletedEventListener[],
  ) {
    this.selectedListeners = this.selectedListeners.filter((l) => l.onProfileSelected);
    console.log('Profile selected listeners: ', selectedListeners.length);
    this.deselectedListeners = this.deselectedListeners.filter((l) => l.onProfileDeselected);
    console.log('Profile deselected listeners: ', deselectedListeners.length);
    this.createdListeners = this.createdListeners.filter((l) => l.onProfileCreated);
    console.log('Profile created listeners: ', createdListeners.length);
    this.deletedListeners = this.deletedListeners.filter((l) => l.onProfileDeleted);
    console.log('Profile deleted listeners: ', deletedListeners.length);
  }

  public emitProfileSelected(socketId: SocketId, profileId: ProfileId) {
    for (const listener of this.selectedListeners) {
      listener.onProfileSelected(socketId, profileId);
    }
  }

  public emitProfileDeselected(socketId: SocketId, profileId: ProfileId) {
    for (const listener of this.deselectedListeners) {
      listener.onProfileDeselected(socketId, profileId);
    }
  }

  public emitProfileCreated(socketId: SocketId, profileId: ProfileId) {
    for (const listener of this.createdListeners) {
      listener.onProfileCreated(socketId, profileId);
    }
  }

  public emitProfileDeleted(socketId: SocketId, profileId: ProfileId) {
    for (const listener of this.deletedListeners) {
      listener.onProfileDeleted(socketId, profileId);
    }
  }
}
