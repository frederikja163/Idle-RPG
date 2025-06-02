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
import type { ServerData } from '@/shared/socket/socket-types';
import { ErrorType } from '@/shared/socket/socket-errors';

@injectableSingleton(SocketOpenEventToken)
export class ProfileController implements SocketOpenEventListener {
  public constructor(
    private readonly socketHub: SocketHub,
    private readonly profileService: ProfileService,
    private readonly profileEventDispatcher: ProfileEventDispatcher,
  ) {}

  public onSocketOpen({ socketId }: SocketOpenEventData): void | Promise<void> {
    const socket = this.socketHub.getSocket(socketId)!;
    socket.on('Profile/GetProfiles', this.handleGetProfiles.bind(this));
    socket.on('Profile/GetProfile', this.handleGetProfile.bind(this));
    socket.on('Profile/DeleteProfile', this.handleDeleteProfile.bind(this));
    socket.on('Profile/CreateProfile', this.handleCreateProfile.bind(this));
    socket.on('Profile/SelectProfile', this.handleSelectProfile.bind(this));
  }

  private async handleGetProfiles(socket: ServerSocket, _: ServerData<'Profile/GetProfiles'>) {
    const userId = this.socketHub.requiresUserId(socket.id);
    const profiles = await this.profileService.getProfilesByUserId(userId);

    socket.send('Profile/UpdateProfiles', {
      profiles,
    });
  }

  private async handleGetProfile(socket: ServerSocket, _: ServerData<'Profile/GetProfile'>) {
    const profileId = this.socketHub.requireProfileId(socket.id);
    const profile = await this.profileService.getProfileById(profileId);

    socket.send('Profile/UpdateProfile', {
      profile,
    });
  }

  private async handleCreateProfile(socket: ServerSocket, { name }: ServerData<'Profile/CreateProfile'>) {
    const userId = this.socketHub.requiresUserId(socket.id);

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

  private async handleDeleteProfile(socket: ServerSocket, { profileId }: ServerData<'Profile/DeleteProfile'>) {
    const userId = this.socketHub.requiresUserId(socket.id);
    await this.profileService.requireUserHasAccess(userId, profileId);

    if (this.socketHub.anySocketsForProfile(profileId)) return socket.error(ErrorType.ProfileInUse);

    const profile = await this.profileService.getProfileById(profileId);
    await this.profileService.delete(userId, profile.id);
    const profiles = await this.profileService.getProfilesByUserId(userId);
    this.socketHub.broadcastToUser(userId, 'Profile/UpdateProfiles', {
      profiles,
    });
  }

  private async handleSelectProfile(socket: ServerSocket, { profileId }: ServerData<'Profile/SelectProfile'>) {
    const userId = this.socketHub.requiresUserId(socket.id);
    await this.profileService.requireUserHasAccess(userId, profileId);

    const oldProfileId = this.socketHub.getProfileId(socket.id);
    if (oldProfileId) {
      this.profileEventDispatcher.emitProfileDeselected({
        userId,
        profileId: oldProfileId,
      });
    }

    const profile = await this.profileService.getProfileById(profileId);
    this.socketHub.setProfileId(socket.id, profile.id);
    this.profileEventDispatcher.emitProfileSelected({
      userId,
      profileId: profile.id,
    });
    socket.send('Profile/SelectProfileSuccess', {});
  }
}
