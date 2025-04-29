import { Socket, type DataType, type EventType } from "@/shared/socket";
import {
  clientServerEvent,
  ErrorType,
  type ClientServerEvent,
  type ServerClientEvent,
} from "@/shared/socket-events";
import type { ServerWebSocket } from "bun";
import { server } from "./server";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import type { Profile } from "./profile";
import type { User } from "./user";
import type { Inventory } from "./inventory";

const typeCheck = TypeCompiler.Compile(clientServerEvent);
export type ServerData<TData extends EventType<ClientServerEvent>> = DataType<
  ClientServerEvent,
  TData
>;

export class ServerSocket extends Socket<ClientServerEvent, ServerClientEvent> {
  public user: User | null = null;
  public profile: Profile | null = null;
  public inventory: Inventory | null = null;

  constructor(ws: ServerWebSocket<unknown>) {
    super(typeCheck, ws.send.bind(ws));
  }

  public close() {
    this.logout();
  }

  public logout(){
    if (this.user)
      this.user.removeSocket(this);
    this.user = null;
    if (this.profile)
      this.profile.removeSocket(this);
    this.profile = null;
    this.inventory = null;
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

export function initSocket() {
  server.onSocketMessage((s, m) => s.handleMessage(m));
  server.onSocketClose((s) => s.close());
}
