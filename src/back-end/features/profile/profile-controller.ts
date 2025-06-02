import { ServerSocket } from '@/back-end/core/server/sockets/server-socket';
import { ProfileEventDispatcher } from '@/back-end/core/events/profile-dispatcher';
import {
  SocketOpenEventToken,
  type SocketOpenEventData,
  type SocketOpenEventListener,
} from '@/back-end/core/events/socket-event';
import { SocketHub } from '@/back-end/core/server/sockets/socket-hub';
import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';
import { ProfileService } from './profile-service';
import type { ServerData, SocketId } from '@/shared/socket/socket-types';
import { ErrorType, ServerError } from '@/shared/socket/socket-errors';

@injectableSingleton(SocketOpenEventToken)
export class ProfileController implements SocketOpenEventListener {
  public constructor(
    private readonly socketHub: SocketHub,
    private readonly profileService: ProfileService,
    private readonly profileEventDispatcher: ProfileEventDispatcher,
  ) {}

  public onSocketOpen({ socketId }: SocketOpenEventData): void | Promise<void> {
    const socket = this.socketHub.requireSocket(socketId)!;
    socket.on('Profile/GetProfiles', this.handleGetProfiles.bind(this));
    socket.on('Profile/GetProfile', this.handleGetProfile.bind(this));
    socket.on('Profile/SetSettings', this.handleSetSettings.bind(this));
    socket.on('Profile/DeleteProfile', this.handleDeleteProfile.bind(this));
    socket.on('Profile/CreateProfile', this.handleCreateProfile.bind(this));
    socket.on('Profile/SelectProfile', this.handleSelectProfile.bind(this));
  }

  private async handleGetProfiles(socketId: SocketId, _: ServerData<'Profile/GetProfiles'>) {
    const userId = this.socketHub.requireUserId(socketId);
    const profiles = await this.profileService.getProfilesByUserId(userId);

    this.socketHub.broadcastToSocket(socketId, 'Profile/UpdateProfiles', {
      profiles,
    });
  }

  private async handleGetProfile(socketId: SocketId, _: ServerData<'Profile/GetProfile'>) {
    const profileId = this.socketHub.requireProfileId(socketId);
    const profile = await this.profileService.getProfileById(profileId);

    this.socketHub.broadcastToSocket(socketId, 'Profile/UpdateProfile', {
      profile,
    });
  }

  private async handleSetSettings(socketId: SocketId, { settings }: ServerData<'Profile/SetSettings'>) {
    const profileId = this.socketHub.requireProfileId(socketId);
    const profile = await this.profileService.getProfileById(profileId);

    profile.settings = settings;
    this.profileService.update(profileId);

    this.socketHub.broadcastToProfile(profileId, 'Profile/UpdateProfile', {
      profile,
    });
  }

  private async handleCreateProfile(socketId: SocketId, { name }: ServerData<'Profile/CreateProfile'>) {
    const userId = this.socketHub.requireUserId(socketId);

    await this.profileService.create(userId, {
      name,
      activityId: null,
      activityStart: null,
    });

    const profiles = await this.profileService.getProfilesByUserId(userId);
    this.socketHub.broadcastToUser(userId, 'Profile/UpdateProfiles', {
      profiles: profiles,
    });
  }

  private async handleDeleteProfile(socketId: SocketId, { profileId }: ServerData<'Profile/DeleteProfile'>) {
    const userId = this.socketHub.requireUserId(socketId);
    await this.profileService.requireUserHasAccess(userId, profileId);

    if (this.socketHub.anySocketsForProfile(profileId)) throw new ServerError(ErrorType.ProfileInUse);

    const profile = await this.profileService.getProfileById(profileId);
    await this.profileService.delete(userId, profile.id);
    const profiles = await this.profileService.getProfilesByUserId(userId);
    this.socketHub.broadcastToUser(userId, 'Profile/UpdateProfiles', {
      profiles,
    });
  }

  private async handleSelectProfile(socketId: SocketId, { profileId }: ServerData<'Profile/SelectProfile'>) {
    const userId = this.socketHub.requireUserId(socketId);
    await this.profileService.requireUserHasAccess(userId, profileId);

    const oldProfileId = this.socketHub.getProfileId(socketId);
    if (oldProfileId) {
      this.profileEventDispatcher.emitProfileDeselected({
        userId,
        profileId: oldProfileId,
      });
    }

    const profile = await this.profileService.getProfileById(profileId);
    this.socketHub.setProfileId(socketId, profile.id);
    this.profileEventDispatcher.emitProfileSelected({
      userId,
      profileId: profile.id,
    });
    this.socketHub.broadcastToSocket(socketId, 'Profile/SelectProfileSuccess', {});
  }
}
