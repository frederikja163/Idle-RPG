import type { ProfileType } from '@/back-end/core/db/db.types';
import { ServerSocket } from '@/back-end/core/server/sockets/server.socket';
import type { ServerData } from '@/back-end/core/server/sockets/socket.types';
import { type ProfileDto, ErrorType } from '@/shared/socket/socket.events';
import { ProfileEventDispatcher } from '@/back-end/core/events/profile.dispatcher';
import {
  SocketOpenEventToken,
  type SocketOpenEventData,
  type SocketOpenEventListener,
} from '@/back-end/core/events/socket.event';
import { SocketHub } from '@/back-end/core/server/sockets/socket.hub';
import { injectableSingleton } from '@/back-end/core/lib/lib.tsyringe';
import { ProfileService } from './profile.service';

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
    socket.on('Profile/DeleteProfile', this.handleDeleteProfile.bind(this));
    socket.on('Profile/CreateProfile', this.handleCreateProfile.bind(this));
    socket.on('Profile/SelectProfile', this.handleSelectProfile.bind(this));
  }

  private async handleGetProfiles(socket: ServerSocket, {}: ServerData<'Profile/GetProfiles'>) {
    const userId = this.socketHub.getUserId(socket.id);
    if (!userId) return socket.error(ErrorType.RequiresLogin);
    const profiles = await this.profileService.getProfilesByUserId(userId);

    socket.send('Profile/UpdateProfiles', {
      profiles,
    });
  }

  private async handleCreateProfile(socket: ServerSocket, { name }: ServerData<'Profile/CreateProfile'>) {
    const userId = this.socketHub.getUserId(socket.id);
    if (!userId) return socket.error(ErrorType.RequiresLogin);

    const profile = await this.profileService.create(userId, { name });
    if (!profile) return socket.error(ErrorType.NameTaken);

    const profiles = await this.profileService.getProfilesByUserId(userId);
    this.socketHub.broadcastToUser(userId, 'Profile/UpdateProfiles', { profiles: profiles });
  }

  private async handleDeleteProfile(socket: ServerSocket, { index }: ServerData<'Profile/DeleteProfile'>) {
    const userId = this.socketHub.getUserId(socket.id);
    if (!userId) return socket.error(ErrorType.RequiresLogin);

    const profiles = await this.profileService.getProfilesByUserId(userId);
    if (index < 0 || index >= profiles.length) return socket.error(ErrorType.ArgumentOutOfRange);

    const profile = profiles[index];
    if (this.socketHub.anySocketsForProfile(profile.id)) return socket.error(ErrorType.ProfileInUse);

    await this.profileService.delete(userId, profile.id);
    profiles.splice(index, 1);
    this.socketHub.broadcastToUser(userId, 'Profile/UpdateProfiles', { profiles: profiles });
  }

  private async handleSelectProfile(socket: ServerSocket, { index }: ServerData<'Profile/SelectProfile'>) {
    const userId = this.socketHub.getUserId(socket.id);
    if (!userId) return socket.error(ErrorType.RequiresLogin);

    const profiles = await this.profileService.getProfilesByUserId(userId);
    if (index < 0 || index >= profiles.length) return socket.error(ErrorType.ArgumentOutOfRange);

    const oldProfileId = this.socketHub.getProfileId(socket.id);
    if (oldProfileId) {
      this.profileEventDispatcher.emitProfileDeselected({ userId, profileId: oldProfileId });
    }

    const profile = profiles[index];
    this.socketHub.setProfileId(socket.id, profile.id);
    this.profileEventDispatcher.emitProfileSelected({ userId, profileId: profile.id });
    socket.send('Profile/SelectProfileSuccess', {});
  }
}
