import { Socket, type DataType, type EventType } from "@/shared/socket";
import {
  clientServerEvent,
  ErrorType,
  serverClientEvent,
  type ClientServerEvent,
  type ServerClientEvent,
} from "@/shared/socket-events";
import type { ServerWebSocket } from "bun";
import type { profileTable, userTable } from "./db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { type ProfileId, type UserId } from "./database";
import { Lookup } from "@/shared/lookup";
import { server } from "./server";
import { TypeCompiler } from "@sinclair/typebox/compiler";

const typeCheck = TypeCompiler.Compile(clientServerEvent);
export type ServerData<TData extends EventType<ClientServerEvent>> = DataType<
  ClientServerEvent,
  TData
>;

export class ServerSocket extends Socket<ClientServerEvent, ServerClientEvent> {
  private static readonly userSockets = new Lookup<UserId, ServerSocket>();
  private static readonly profileSockets = new Lookup<
    ProfileId,
    ServerSocket
  >();

  private _user: InferSelectModel<typeof userTable> | null = null;
  private _profile: InferSelectModel<typeof profileTable> | null = null;

  constructor(ws: ServerWebSocket<unknown>) {
    super(typeCheck, ws.send.bind(ws));
  }

  public get user(): InferSelectModel<typeof userTable> | null {
    return this._user;
  }
  public set user(value: InferSelectModel<typeof userTable> | null) {
    if (this._user) {
      ServerSocket.userSockets.remove(this._user.id, this);
    }
    this._user = value;
    if (this._user) {
      ServerSocket.userSockets.add(this._user.id, this);
    }
  }
  public get profile(): InferSelectModel<typeof profileTable> | null {
    return this._profile;
  }
  public set profile(value: InferSelectModel<typeof profileTable> | null) {
    if (this._profile) {
      ServerSocket.profileSockets.remove(this._profile.id, this);
    }
    this._profile = value;
    if (this._profile) {
      ServerSocket.profileSockets.add(this._profile.id, this);
    }
  }

  public close() {
    this.user = null;
    this.profile = null;
  }

  public static getUserSockets(userId: UserId) {
    return ServerSocket.userSockets.getValues(userId);
  }

  public static sendUser<TEvent extends EventType<ServerClientEvent>>(
    userId: UserId,
    event: TEvent,
    data: DataType<ServerClientEvent, TEvent>
  ) {
    ServerSocket.getUserSockets(userId)?.forEach((s) => s.send(event, data));
  }

  public static getProfileSockets(profileId: ProfileId) {
    return ServerSocket.profileSockets.getValues(profileId);
  }

  public static sendProfile<TEvent extends EventType<ServerClientEvent>>(
    profileId: ProfileId,
    event: TEvent,
    data: DataType<ServerClientEvent, TEvent>
  ) {
    ServerSocket.getProfileSockets(profileId)?.forEach((s) =>
      s.send(event, data)
    );
  }

  public error(error: ErrorType) {
    this.send("Error", { error });
  }

  public onError(message: string): void {
    this.send("Error", { error: ErrorType.InternalError });
  }
}

export function serverSocket(ws: ServerWebSocket<unknown>) {
  return new ServerSocket(ws);
}

server.onSocketMessage((s, m) => s.handleMessage(m));
server.onSocketClose((s) => s.close());
