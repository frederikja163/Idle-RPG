import { TypeCheck } from '@sinclair/typebox/compiler';
import type { AllEvents, DataType, EventType, SocketId } from './socket-types';
import { errorMessages, ErrorType, ServerError } from './socket-errors';

const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

function reviver<T>(_: string, value: T) {
  if (typeof value === 'string' && dateFormat.test(value)) {
    return new Date(value);
  }
  return value;
}

export class Socket<TIncoming extends AllEvents, TOutgoing extends AllEvents> {
  public static LogEvents: boolean = false;
  private readonly _send: (data: string) => void;
  private readonly _events = new Map<EventType<TIncoming>, (data: object) => Promise<void> | void>();
  private readonly _typeCheck: TypeCheck<TIncoming>;

  public readonly id: SocketId = crypto.randomUUID();

  constructor(typeCheck: TypeCheck<TIncoming>, send: (data: string) => void) {
    this._send = send;
    this._typeCheck = typeCheck;
  }

  public close() {
    this._events.clear();
  }

  public async handleMessage(message: string) {
    // if (Socket.LogEvents) {
    console.log(message);
    // }
    const object = JSON.parse(message, reviver) as object;

    if (!this._typeCheck.Check(object)) {
      this.onError(ErrorType.InternalError, 'Failed parsing input data');
    }

    try {
      const { type, data } = object as {
        type: EventType<TIncoming>;
        data: object;
      };
      const event = this._events.get(type);
      if (event) {
        await event(data);
        return;
      }

      console.log(`No event of type ${type} found.`);
    } catch (error) {
      if (error instanceof ServerError) {
        this.onError(error.errorType, error.message);
      }
      if (error instanceof Error) {
        this.onError(undefined, error.message);
      }
    }
  }

  public send<TEvent extends EventType<TOutgoing>>(event: TEvent, data: DataType<TOutgoing, TEvent>) {
    const obj = { type: event, data: data };
    const json = JSON.stringify(obj);
    this._send(json);
  }

  public on<TEvent extends EventType<TIncoming>>(
    type: TEvent,
    callback: (socket: SocketId, data: DataType<TIncoming, TEvent>) => void,
  ) {
    this._events.set(type, (d) => callback(this.id, d as DataType<TIncoming, TEvent>));
  }

  public onError(errorType?: ErrorType, message?: string) {
    if (errorType) console.error(errorType, errorMessages[errorType], message);
    else console.error(message);
  }
}
