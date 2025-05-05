import type { ProfileId, ProfileType, UserId } from '@/back-end/core/db/db.types';
import { ProfileRepository } from './profile.repository';
import { injectableSingleton } from '@/back-end/core/lib/lib.tsyringe';
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
} from '@/back-end/core/events/profile.event';
import {
  UserLoginEventToken,
  UserLogoutEventToken,
  type UserLoginEventData,
  type UserLoginEventListener,
  type UserLogoutEventData,
  type UserLogoutEventListener,
} from '@/back-end/core/events/user.event';
import { SocketSessionStore } from '@/back-end/core/server/sockets/socket.session.store';

@injectableSingleton(
  UserLoginEventToken,
  UserLogoutEventToken,
  ProfileSelectedEventToken,
  ProfileDeselectedEventToken,
  ProfileCreatedEventToken,
  ProfileDeletedEventToken,
)
export class ProfileCache
  implements
    UserLoginEventListener,
    UserLogoutEventListener,
    ProfileSelectedEventListener,
    ProfileDeselectedEventListener,
    ProfileCreatedEventListener,
    ProfileDeletedEventListener
{
  private readonly userProfilesCache = new Map<UserId, ProfileType[]>();
  private readonly profileCache = new Map<ProfileId, ProfileType>();

  public constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly socketSession: SocketSessionStore,
  ) {}

  public async getProfilesByUserId(userId: UserId) {
    const cache = this.userProfilesCache.get(userId);
    if (cache) return cache;

    const profiles = await this.profileRepo.findByUserId(userId);
    this.userProfilesCache.set(userId, profiles);
    return profiles;
  }

  public async getProfilesById(profileId: ProfileId) {
    const cache = this.profileCache.get(profileId);
    if (cache) return cache;

    const profile = await this.profileRepo.findByProfileId(profileId);
    if (profile) this.profileCache.set(profile?.id, profile);
    return profile;
  }

  public invalidateUser(userId: UserId) {
    this.userProfilesCache.delete(userId);
  }

  public invalidateProfile(profileId: ProfileId) {
    this.profileCache.delete(profileId);
    for (const [userId, profiles] of this.userProfilesCache) {
      if (profiles.find((p) => p.id === profileId)) this.userProfilesCache.delete(userId);
    }
  }

  public onUserLoggedIn({ userId }: UserLoginEventData): void | Promise<void> {
    this.profileRepo.findByUserId(userId).then((p) => this.userProfilesCache.set(userId, p));
  }
  public onUserLoggedOut({ userId }: UserLogoutEventData): void | Promise<void> {
    if (!this.socketSession.anySocketsForUser(userId)) {
      this.userProfilesCache.delete(userId);
    }
  }

  public onProfileSelected({ userId, profileId }: ProfileSelectedEventData): void | Promise<void> {
    this.profileRepo.findByProfileId(profileId).then((p) => this.profileCache.set(p.id, p));
    this.invalidateUser(userId);
  }
  public onProfileDeselected({ profileId }: ProfileDeselectedEventData): void | Promise<void> {
    if (!this.socketSession.anySocketsForProfile(profileId)) {
      this.profileCache.delete(profileId);
    }
  }

  public onProfileCreated({ userId }: ProfileCreatedEventData): void | Promise<void> {
    this.invalidateUser(userId);
  }
  public onProfileDeleted({ userId }: ProfileDeletedEventData): void | Promise<void> {
    this.invalidateUser(userId);
  }
}
