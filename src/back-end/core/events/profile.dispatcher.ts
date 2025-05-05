import { container, injectAll } from 'tsyringe';
import {
  ProfileCreatedEventToken,
  ProfileDeletedEventToken,
  ProfileDeselectedEventToken,
  ProfileSelectedEventToken,
  type ProfileCreatedEventData,
  type ProfileCreatedEventListener,
  type ProfileDeletedEventData,
  type ProfileDeletedEventListener,
  type ProfileDeselectedEventData,
  type ProfileDeselectedEventListener,
  type ProfileSelectedEventData,
  type ProfileSelectedEventListener,
} from './profile.event';
import type { SocketId } from '../server/sockets/socket.types';
import type { ProfileId, ProfileType, UserId } from '../db/db.types';
import { injectableSingleton } from '../lib/lib.tsyringe';

@injectableSingleton()
export class ProfileEventDispatcher {
  public emitProfileSelected(event: ProfileSelectedEventData) {
    const listeners = container.resolveAll(ProfileSelectedEventToken).filter((l) => l.onProfileSelected);
    for (const listener of listeners) {
      listener.onProfileSelected(event);
    }
  }

  public emitProfileDeselected(event: ProfileDeselectedEventData) {
    const listeners = container.resolveAll(ProfileDeselectedEventToken).filter((l) => l.onProfileDeselected);
    for (const listener of listeners) {
      listener.onProfileDeselected(event);
    }
  }

  public emitProfileCreated(event: ProfileCreatedEventData) {
    const listeners = container.resolveAll(ProfileCreatedEventToken).filter((l) => l.onProfileCreated);
    for (const listener of listeners) {
      listener.onProfileCreated(event);
    }
  }

  public emitProfileDeleted(event: ProfileDeletedEventData) {
    const listeners = container.resolveAll(ProfileDeletedEventToken).filter((l) => l.onProfileDeleted);
    for (const listener of listeners) {
      listener.onProfileDeleted(event);
    }
  }
}
