import type { ServerSocket } from './server.socket';

export interface ISocketHandler {
  handleSocketOpen(socket: ServerSocket): void;
}
