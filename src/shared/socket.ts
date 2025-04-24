import type { ServerWebSocket } from "bun";
import {
  type ClientServerEvent,
  type ServerClientEvent,
} from "./socket-events";

export type AllEvents = ServerClientEvent | ClientServerEvent;
export type AllSockets = WebSocket | ServerWebSocket;

export class Socket<TIncoming extends AllEvents, TOutgoing extends AllEvents> {
  private readonly _send: (data: string) => void;
  private readonly _events: ((message: string) => void)[];

  constructor(send: (data: string) => void) {
    this._send = send;
    this._events = [];
  }

  public handleMessage(message: string) {
    for (const event of this._events) {
      event(message);
    }
  }

  public send<T extends keyof TOutgoing>(event: T, data: TOutgoing[T]) {
    const obj = { type: event, data: data };
    const json = JSON.stringify(obj);
    this._send(json);
  }

  public on<T extends keyof TIncoming>(
    event: T,
    callback: (socket: Socket<TIncoming, TOutgoing>, data: TIncoming[T]) => void
  ) {
    this._events.push((message) => {
      const obj = JSON.parse(message) as { type: string; data: unknown };
      if (obj.type === event) {
        // TODO: Validate that the incoming data has the correct type.
        const data = obj.data as TIncoming[T];
        callback(this, data);
      }
    });
  }
}
