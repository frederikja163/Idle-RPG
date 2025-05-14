import { TypeCheck } from "@sinclair/typebox/compiler";
import type { AllEvents, DataType, EventType } from "./socket-types";
import { errorMessages, ErrorType, ServerError } from "./socket-errors";

const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
function reviver<T>(_: string, value: T) {
  if (typeof value === "string" && dateFormat.test(value)) {
    return new Date(value);
  }
  return value;
}

export class Socket<TIncoming extends AllEvents, TOutgoing extends AllEvents> {
  private readonly _send: (data: string) => void;
  private readonly _events = new Map<
    EventType<TIncoming>,
    ((data: object) => void)[]
  >();
  private readonly _typeCheck: TypeCheck<TIncoming>;

  public static LogEvents: boolean = false;

  constructor(typeCheck: TypeCheck<TIncoming>, send: (data: string) => void) {
    this._send = send;
    this._typeCheck = typeCheck;
  }

  private getOrCreateEventsArray(type: EventType<TIncoming>) {
    const cached = this._events.get(type);
    if (cached) return cached;

    const events: ((data: object) => void)[] = [];
    this._events.set(type, events);
    return events;
  }

  public close() {
    this._events.clear();
  }

  public handleMessage(message: string) {
    if (Socket.LogEvents) {
      console.log(message);
    }
    const object = JSON.parse(message, reviver) as object;

    if (!this._typeCheck.Check(object)) {
      this.onError(ErrorType.InternalError, "Failed parsing input data");
    }

    try {
      const { type, data } = object as {
        type: EventType<TIncoming>;
        data: object;
      };
      for (const event of this._events.get(type) ?? []) {
        event(data);
      }
    } catch (error) {
      if (error instanceof ServerError) {
        this.onError(error.errorType, error.message);
      }
      if (error instanceof Error) {
        this.onError(undefined, error.message);
      }
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
  >(type: TEvent, callback: (socket: typeof this, data: TData) => void) {
    const events = this.getOrCreateEventsArray(type);
    events.push((d) => callback(this, d as TData));
  }

  public onError(errorType?: ErrorType, message?: string) {
    if (errorType) console.error(errorType, errorMessages[errorType], message);
    else console.error(message);
  }
}
