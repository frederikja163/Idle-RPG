import { Socket } from "@/shared/socket";
import {
  ErrorType,
  type ClientServerEvent,
  type ServerClientEvent,
} from "@/shared/socket-events";
import type { ServerWebSocket } from "bun";
import type { profileTable, userTable } from "./db/schema";
import type { InferSelectModel } from "drizzle-orm";

export class ServerSocket extends Socket<ClientServerEvent, ServerClientEvent> {
  private _user: InferSelectModel<typeof userTable> | null = null;
  private _profile: InferSelectModel<typeof profileTable> | null = null;

  constructor(ws: ServerWebSocket<unknown>) {
    super(ws.send.bind(ws));
  }

  public get user(): InferSelectModel<typeof userTable> | null {
    return this._user;
  }
  public set user(value: InferSelectModel<typeof userTable> | null) {
    this._user = value;
  }
  public get profile(): InferSelectModel<typeof profileTable> | null {
    return this._profile;
  }
  public set profile(value: InferSelectModel<typeof profileTable> | null) {
    this._profile = value;
  }

  public on<T extends keyof ClientServerEvent>(
    event: T,
    callback: (socket: ServerSocket, data: ClientServerEvent[T]) => void
  ): void {
    super.on(event, (s, d) => callback(s as ServerSocket, d));
  }

  public error(error: ErrorType) {
    this.send("Error", { error });
  }
}

export function serverSocket(ws: ServerWebSocket<unknown>) {
  return new ServerSocket(ws);
}
