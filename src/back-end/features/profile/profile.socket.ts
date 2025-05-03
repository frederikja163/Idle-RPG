import type { ProfileType } from '@/back-end/core/db/db.types';
import { SessionStore } from '@/back-end/core/session/session.store';
import { ServerSocket } from '@/back-end/core/sockets/server.socket';
import { SocketCache } from '@/back-end/core/sockets/socket.cache';
import type { ISocketHandler } from '@/back-end/core/sockets/socket.ihandler';
import type { ServerData } from '@/back-end/core/sockets/sockets.types';
import { type ProfileDto, ErrorType } from '@/shared/socket-events';
import { injectable, singleton } from 'tsyringe';
import { ProfileCache } from './profile.cache';

@injectable()
@singleton()
export class ProfileSocketHandler implements ISocketHandler {
  public constructor(
    private readonly sessionStore: SessionStore,
    private readonly socketCache: SocketCache,
    private readonly profileCache: ProfileCache,
  ) {}

  public handleSocketOpen(socket: ServerSocket): void {
    socket.on('Profile/GetProfiles', this.getProfiles.bind(this));
    socket.on('Profile/DeleteProfile', this.deleteProfile.bind(this));
    socket.on('Profile/CreateProfile', this.createProfile.bind(this));
    socket.on('Profile/SelectProfile', this.selectProfile.bind(this));
  }

  private getDto(profile: ProfileType): ProfileDto {
    return {
      ...profile,
    };
  }

  private async getProfiles(socket: ServerSocket, {}: ServerData<'Profile/GetProfiles'>) {
    const user = this.sessionStore.get(socket.id).user;
    if (!user) return socket.error(ErrorType.RequiresLogin);
    const profiles = await this.profileCache.findByUserId(user.id);

    socket.send('Profile/UpdateProfiles', {
      profiles: profiles.map(this.getDto),
    });
  }

  private async createProfile(socket: ServerSocket, { name }: ServerData<'Profile/CreateProfile'>) {
    const user = this.sessionStore.get(socket.id).user;
    if (!user) return socket.error(ErrorType.RequiresLogin);

    const profile = await this.profileCache.createByName(user.id, name);
    if (!profile) return socket.error(ErrorType.NameTaken);

    const profiles = await this.profileCache.findByUserId(user.id);
    this.socketCache.getByUserId(user.id)?.forEach((s) => {
      s.send('Profile/UpdateProfiles', { profiles });
    });
  }

  private async deleteProfile(socket: ServerSocket, { index }: ServerData<'Profile/DeleteProfile'>) {
    const user = this.sessionStore.get(socket.id).user;
    if (!user) return socket.error(ErrorType.RequiresLogin);

    const profiles = await this.profileCache.findByUserId(user.id);
    if (index < 0 || index >= profiles.length) return socket.error(ErrorType.ArgumentOutOfRange);

    const profile = profiles[index];
    if (this.socketCache.hasProfileId(profile.id)) return socket.error(ErrorType.ProfileInUse);

    await this.profileCache.deleteProfile(profile.id);
    profiles.splice(index, 1);
    this.socketCache.getByUserId(user.id)?.forEach((s) => {
      s.send('Profile/UpdateProfiles', { profiles });
    });
  }

  private async selectProfile(socket: ServerSocket, { index }: ServerData<'Profile/SelectProfile'>) {
    const session = this.sessionStore.get(socket.id);
    const user = session.user;
    if (!user) return socket.error(ErrorType.RequiresLogin);
    const profiles = await this.profileCache.findByUserId(user.id);
    if (index < 0 || index >= profiles.length) return socket.error(ErrorType.ArgumentOutOfRange);

    if (session.profile) {
      this.socketCache.removeProfileId(session.profile.id, socket);
      session.resetProfile();
    }

    const profile = profiles[index];
    session.profile = profile;
    this.socketCache.addProfileId(profile.id, socket);
    socket.send('Profile/SelectProfileSuccess', {});
  }
}
