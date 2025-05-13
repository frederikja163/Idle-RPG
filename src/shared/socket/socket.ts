import { TypeCheck } from "@sinclair/typebox/compiler";
import type { AllEvents, DataType, EventType } from "./socket-types";

const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
function reviver<T>(_: string, value: T) {
  if (typeof value === "string" && dateFormat.test(value)) {
    return new Date(value);
  }
  return value;
}

export class Socket<TIncoming extends AllEvents, TOutgoing extends AllEvents> {
  private readonly _send: (data: string) => void;
  private readonly _events: ((message: string) => void)[];
  private readonly _typeCheck: TypeCheck<TIncoming>;

  public static LogEvents: boolean = false;

  constructor(typeCheck: TypeCheck<TIncoming>, send: (data: string) => void) {
    this._send = send;
    this._typeCheck = typeCheck;
    this._events = [];
  }

  public close() {
    this._events.splice(0, -1);
  }

  public handleMessage(message: string) {
    if (Socket.LogEvents) {
      console.log(message);
    }
    for (const event of this._events) {
      event(message);
    }
  }

  public send<
    TEvent extends EventType<TOutgoing>,
    TData extends DataType<TOutgoing, TEvent>
  >(event: TEvent, data: TData) {
    const obj = { type: event, data: data };
    const json = JSON.stringify(obj);
    this._send(json);
  }

  public on<
    TEvent extends EventType<TIncoming>,
    TData extends DataType<TIncoming, TEvent>
  >(event: TEvent, callback: (socket: typeof this, data: TData) => void) {
    this._events.push((message) => {
      const obj = JSON.parse(message, reviver);
      if (this._typeCheck.Check(obj)) {
        if (obj.type === event) {
          const data = obj.data as TData;
          callback(this, data);
        }
      } else this.onError(message);
    });
  }

  public onError(message: string) {
    console.error(message);
  }
}
