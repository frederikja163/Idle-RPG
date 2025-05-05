import { Socket } from '@/shared/socket/socket';
import {
  clientServerEvent,
  ErrorType,
  type ClientServerEvent,
  type ServerClientEvent,
} from '@/shared/socket/socket.events';
import type { ServerWebSocket } from 'bun';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import type { SocketId } from './socket.types';

const typeCheck = TypeCompiler.Compile(clientServerEvent);

export class ServerSocket extends Socket<ClientServerEvent, ServerClientEvent> {
  public readonly id: SocketId = crypto.randomUUID();

  constructor(ws: ServerWebSocket<unknown>) {
    super(typeCheck, ws.send.bind(ws));
  }

  public error(error: ErrorType) {
    this.send('Error', { error });
  }

  public onError(message: string): void {
    super.onError(message);
    this.send('Error', { error: ErrorType.InternalError });
  }
}
