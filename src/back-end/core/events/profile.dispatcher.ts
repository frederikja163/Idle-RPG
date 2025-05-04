import { injectAll } from 'tsyringe';
import {
  ProfileDeselectedEventToken,
  ProfileSelectedEventToken,
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
  ) {
    this.selectedListeners = this.selectedListeners.filter((l) => l.onProfileSelected);
    console.log('Profile selected listeners: ', selectedListeners.length);
    this.deselectedListeners = this.deselectedListeners.filter((l) => l.onProfileDeselected);
    console.log('Profile deselected listeners: ', deselectedListeners.length);
  }

  public emitProfileSelected(socketId: SocketId, profileId: ProfileId) {
    for (const listener of this.selectedListeners) {
      listener.onProfileSelected(socketId, profileId);
    }
  }

  public emitProfileUnselected(socketId: SocketId, profileId: ProfileId) {
    for (const listener of this.deselectedListeners) {
      listener.onProfileDeselected(socketId, profileId);
    }
  }
}
