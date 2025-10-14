import type { SocketId } from "@/shared/socket/socket-types";
import type { InjectionToken } from "tsyringe";

export type SocketOpenEventData = { socketId: SocketId };
export interface SocketOpenEventListener {
  onSocketOpen(event: SocketOpenEventData): void | Promise<void>;
}
export const SocketOpenEventToken: InjectionToken<SocketOpenEventListener> =
  Symbol("SocketOpen");

export type SocketCloseEventData = {
  socketId: SocketId;
  code: number;
  reason: string;
};
export interface SocketCloseEventListener {
  onSocketClose(event: SocketCloseEventData): void | Promise<void>;
}
export const SocketCloseEventToken: InjectionToken<SocketCloseEventListener> =
  Symbol("SocketClose");
