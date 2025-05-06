import {
  ProfileCreatedEventToken,
  ProfileDeletedEventToken,
  ProfileDeselectedEventToken,
  ProfileSelectedEventToken,
  type ProfileCreatedEventData,
  type ProfileDeletedEventData,
  type ProfileDeselectedEventData,
  type ProfileSelectedEventData,
} from './profile-event';
import { injectableSingleton, resolveAll } from '../lib/lib-tsyringe';

@injectableSingleton()
export class ProfileEventDispatcher {
  public emitProfileSelected(event: ProfileSelectedEventData) {
    const listeners = resolveAll(ProfileSelectedEventToken).filter((l) => l.onProfileSelected);
    for (const listener of listeners) {
      listener.onProfileSelected(event);
    }
  }

  public emitProfileDeselected(event: ProfileDeselectedEventData) {
    const listeners = resolveAll(ProfileDeselectedEventToken).filter((l) => l.onProfileDeselected);
    for (const listener of listeners) {
      listener.onProfileDeselected(event);
    }
  }

  public emitProfileCreated(event: ProfileCreatedEventData) {
    const listeners = resolveAll(ProfileCreatedEventToken).filter((l) => l.onProfileCreated);
    for (const listener of listeners) {
      listener.onProfileCreated(event);
    }
  }

  public emitProfileDeleted(event: ProfileDeletedEventData) {
    const listeners = resolveAll(ProfileDeletedEventToken).filter((l) => l.onProfileDeleted);
    for (const listener of listeners) {
      listener.onProfileDeleted(event);
    }
  }
}
