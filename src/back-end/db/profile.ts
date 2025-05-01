import { profilesTable } from './schema';
import type { profileDto, ServerClientEvent } from '@/shared/socket-events';
import type { DataType, EventType } from '@/shared/socket';
import { ServerSocket } from '../server-socket';
import { database, type ProfileId } from './database';
import type { Static } from '@sinclair/typebox';

type ProfileType = typeof profilesTable.$inferSelect;
export class Profile {
  private static readonly _allProfiles = new Set<Profile>();
  private static readonly _needsSave = new Set<Profile>();
  private readonly _data: ProfileType;
  private readonly _sockets = new Set<ServerSocket>();

  constructor(data: ProfileType) {
    this._data = data;
  }

  public get id() {
    return this._data.id;
  }

  public getDto(): Static<typeof profileDto> {
    return {
      name: this._data.name,
    };
  }

  public get hasSockets() {
    return this._sockets.size === 0;
  }

  public save() {
    Profile._needsSave.add(this);
  }

  public addSocket(socket: ServerSocket) {
    if (this._sockets.size === 0) {
      // TODO: Calculate offline progress.
      Profile._allProfiles.add(this);
    }
    this._sockets.add(socket);
  }

  public removeSocket(socket: ServerSocket) {
    this._sockets.delete(socket);
    if (this._sockets.size === 0) {
      database.updateProfile(this._data.id, this._data);
      Profile._needsSave.delete(this);
      Profile._allProfiles.delete(this);
    }
  }

  public send<TEvent extends EventType<ServerClientEvent>>(event: TEvent, data: DataType<ServerClientEvent, TEvent>) {
    for (const socket of this._sockets) {
      socket.send(event, data);
    }
  }

  public static async saveAll() {
    for (const profile of this._needsSave) {
      await database.updateProfile(profile.id, profile._data);
    }
    this._needsSave.clear();
    const profileIds: ProfileId[] = [];
    for (const profile of this._allProfiles) {
      profileIds.push(profile.id);
    }
    await database.updateProfileTimes(profileIds);
  }
}
