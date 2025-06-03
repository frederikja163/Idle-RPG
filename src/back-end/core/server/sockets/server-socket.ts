import { Socket } from '@/shared/socket/socket';
import { clientServerEvent } from '@/shared/socket/socket-events';
import type { ServerWebSocket } from 'bun';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import type { ClientServerEvent, ServerClientEvent } from '@/shared/socket/socket-types';
import { ErrorType } from '@/shared/socket/socket-errors';

const typeCheck = TypeCompiler.Compile(clientServerEvent);

export class ServerSocket extends Socket<ClientServerEvent, ServerClientEvent> {
  constructor(ws: ServerWebSocket<unknown>) {
    super(typeCheck, ws.send.bind(ws));
  }

  public error(error: ErrorType) {
    this.send('System/Error', { errorType: error, message: '' });
  }

  public onError(errorType?: ErrorType, message?: string): void {
    if (!errorType) super.onError(errorType, message);
    this.send('System/Error', {
      errorType: errorType ?? ErrorType.InternalError,
      message: message,
    });
  }
}
