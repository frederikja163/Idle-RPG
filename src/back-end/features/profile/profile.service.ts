import type { ProfileType } from '@/back-end/core/db/db.types';
import { ServerSocket } from '@/back-end/core/server/server.socket';
import type { ServerData, SocketId } from '@/back-end/core/server/sockets/sockets.types';
import { type ProfileDto, ErrorType } from '@/shared/socket/socket-events';
import { ProfileEventDispatcher } from '@/back-end/core/events/profile.dispatcher';
import { SocketOpenEventToken, type SocketOpenEventListener } from '@/back-end/core/events/socket.event';
import { SocketHub } from '@/back-end/core/server/sockets/socket.hub';
import { ProfileCache } from './profile.cache';
import { injectableSingleton } from '@/back-end/core/lib/lib.tsyringe';

@injectableSingleton(SocketOpenEventToken)
export class ProfileService implements SocketOpenEventListener {
  public constructor(
    private readonly socketHub: SocketHub,
    private readonly profileCache: ProfileCache,
    private readonly profileEventDispatcher: ProfileEventDispatcher,
  ) {}
  onSocketOpen(socketId: SocketId): void | Promise<void> {
    const socket = this.socketHub.getSocket(socketId)!;
    socket.on('Profile/GetProfiles', this.handleGetProfiles.bind(this));
    socket.on('Profile/DeleteProfile', this.handleDeleteProfile.bind(this));
    socket.on('Profile/CreateProfile', this.handleCreateProfile.bind(this));
    socket.on('Profile/SelectProfile', this.handleSelectProfile.bind(this));
  }

  private getDto(profile: ProfileType): ProfileDto {
    return {
      ...profile,
    };
  }

  private async handleGetProfiles(socket: ServerSocket, {}: ServerData<'Profile/GetProfiles'>) {
    const userId = this.socketHub.getUserId(socket.id);
    if (!userId) return socket.error(ErrorType.RequiresLogin);
    const profiles = await this.profileCache.findByUserId(userId);

    socket.send('Profile/UpdateProfiles', {
      profiles: profiles.map(this.getDto),
    });
  }

  private async handleCreateProfile(socket: ServerSocket, { name }: ServerData<'Profile/CreateProfile'>) {
    const userId = this.socketHub.getUserId(socket.id);
    if (!userId) return socket.error(ErrorType.RequiresLogin);

    const profile = await this.profileCache.createByName(userId, name);
    if (!profile) return socket.error(ErrorType.NameTaken);

    const profiles = await this.profileCache.findByUserId(userId);
    this.socketHub.broadcastToUser(userId, 'Profile/UpdateProfiles', { profiles: profiles.map(this.getDto) });
  }

  private async handleDeleteProfile(socket: ServerSocket, { index }: ServerData<'Profile/DeleteProfile'>) {
    const userId = this.socketHub.getUserId(socket.id);
    if (!userId) return socket.error(ErrorType.RequiresLogin);

    const profiles = await this.profileCache.findByUserId(userId);
    if (index < 0 || index >= profiles.length) return socket.error(ErrorType.ArgumentOutOfRange);

    const profile = profiles[index];
    if (this.socketHub.anySocketsForProfile(profile.id)) return socket.error(ErrorType.ProfileInUse);

    await this.profileCache.deleteProfile(profile.id);
    profiles.splice(index, 1);
    this.socketHub.broadcastToUser(userId, 'Profile/UpdateProfiles', { profiles: profiles.map(this.getDto) });
  }

  private async handleSelectProfile(socket: ServerSocket, { index }: ServerData<'Profile/SelectProfile'>) {
    const userId = this.socketHub.getUserId(socket.id);
    if (!userId) return socket.error(ErrorType.RequiresLogin);

    const profiles = await this.profileCache.findByUserId(userId);
    if (index < 0 || index >= profiles.length) return socket.error(ErrorType.ArgumentOutOfRange);

    const oldProfileId = this.socketHub.getProfileId(socket.id);
    if (oldProfileId) {
      this.profileEventDispatcher.emitProfileDeselected(socket.id, oldProfileId);
    }

    const profile = profiles[index];
    this.profileEventDispatcher.emitProfileSelected(socket.id, profile.id);
    socket.send('Profile/SelectProfileSuccess', {});
  }
}
