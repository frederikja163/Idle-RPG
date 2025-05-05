import type { InjectionToken } from 'tsyringe';
import type { SocketId } from '../server/sockets/socket.types';

export type SocketOpenEventData = { socketId: SocketId };
export interface SocketOpenEventListener {
  onSocketOpen(event: SocketOpenEventData): void | Promise<void>;
}
export const SocketOpenEventToken: InjectionToken<SocketOpenEventListener> = Symbol('SocketOpen');

export type SocketCloseEventData = { socketId: SocketId };
export interface SocketCloseEventListener {
  onSocketClose(event: SocketCloseEventData): void | Promise<void>;
}
export const SocketCloseEventToken: InjectionToken<SocketCloseEventListener> = Symbol('SocketClose');
