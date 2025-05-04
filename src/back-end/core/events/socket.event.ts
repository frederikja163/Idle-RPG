import type { constructor } from 'tsyringe/dist/typings/types';
import type { SocketId } from '../server/sockets/sockets.types';
import { container } from 'tsyringe';

export interface SocketOpenEventListener {
  onSocketOpen(socketId: SocketId): void | Promise<void>;
}
export class SocketOpenEventToken {}

export interface SocketCloseEventListener {
  onSocketClose(socketId: SocketId): void | Promise<void>;
}
export class SocketCloseEventToken {}
