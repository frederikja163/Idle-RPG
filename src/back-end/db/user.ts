import type { DataType, EventType } from '@/shared/socket';
import { database, type UserId } from './database';
import type { usersTable } from './schema';
import { Profile } from './profile';
import { ServerSocket } from '../server-socket';
import type { ServerClientEvent } from '@/shared/socket-events';

type UserType = typeof usersTable.$inferSelect;
export class User {
  private static usersByGoogleId = new Map<string, User>();
  private readonly _data: UserType;
  private readonly _sockets = new Set<ServerSocket>();
  private readonly _profiles: Profile[];

  private constructor(data: UserType, profiles: Profile[]) {
    this._data = data;
    this._profiles = profiles;
  }

  public get id() {
    return this._data.id;
  }

  public get profiles() {
    return this._profiles;
  }

  public async addProfile(name: string) {
    const profileData = await database.createProfile(this._data.id, name);
    if (!profileData) {
      return null;
    }
    const profile = new Profile(profileData);
    this._profiles.push(profile);
    return profile;
  }

  public async deleteProfile(index: number) {
    const profiles = this._profiles;
    profiles.splice(index);
    await database.deleteProfile(profiles[index].id);
  }

  public send<TEvent extends EventType<ServerClientEvent>>(event: TEvent, data: DataType<ServerClientEvent, TEvent>) {
    for (const socket of this._sockets) {
      socket.send(event, data);
    }
  }

  public removeSocket(socket: ServerSocket) {
    this._sockets.delete(socket);
    if (this._sockets.size === 0) {
      User.usersByGoogleId.delete(this._data.googleId);
      database.updateUsersTime([this._data.id]);
    }
  }

  public static async createOrGetGoogle(socket: ServerSocket, googleId: string, email: string, profilePicture: string) {
    let user = this.usersByGoogleId.get(googleId);
    if (!user) {
      const data = await database.upsertUser(googleId, email, profilePicture);
      const profiles = (await database.getProfiles(data.id)).map((p) => new Profile(p));
      user = new User(data, profiles);
    }
    // TODO: If the profile picture has been changed from the cached one, update it here.
    user._sockets.add(socket);
    return user;
  }

  public static saveAll() {
    const userIds: UserId[] = [];
    for (const user of User.usersByGoogleId.values()) {
      userIds.push(user._data.id);
    }
    database.updateUsersTime(userIds);
  }
}
