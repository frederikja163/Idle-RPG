import { profileTable } from "./db/schema";
import type { profileDto, ServerClientEvent } from "@/shared/socket-events";
import type { DataType, EventType } from "@/shared/socket";
import { ServerSocket } from "./server-socket";
import { database, type ProfileId } from "./database";
import type { Static } from "@sinclair/typebox";

type ProfileType = typeof profileTable.$inferSelect;
export class Profile {
  private static readonly _allProfiles = new Set<Profile>();
  private static readonly _needsSave = new Set<Profile>();
  private readonly _data: ProfileType;
  private readonly _sockets = new Set<ServerSocket>();

  constructor(data: ProfileType) {
    this._data = data;
  }

  public get data() {
    return this._data;
  }

  public getDto(): Static<typeof profileDto> {
    return {
      name: this._data.name,
      miningXp: this._data.miningXp,
      smitheryXp: this._data.smitheryXp,
      lumberjackingXp: this._data.lumberjackingXp,
      carpentryXp: this.data.carpentryXp,
    };
  }

  public get hasSockets() {
    return this._sockets.size === 0;
  }

  public save(){
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
      database.updateProfile(this.data.id, this.data);
      Profile._needsSave.delete(this);
      Profile._allProfiles.delete(this);
    }
  }

  public send<TEvent extends EventType<ServerClientEvent>>(
    event: TEvent,
    data: DataType<ServerClientEvent, TEvent>
  ) {
    for (const socket of this._sockets) {
      socket.send(event, data);
    }
  }

  public static async saveAll() {
    for (const profile of this._needsSave) {
      await database.updateProfile(profile.data.id, profile.data);
    }
    this._needsSave.clear();
    const profileIds: ProfileId[] = [];
    for (const profile of this._allProfiles) {
      profileIds.push(profile.data.id);
    }
    await database.updateProfileTimes(profileIds);
  }
}
