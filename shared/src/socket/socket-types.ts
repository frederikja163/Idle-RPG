import type { Static } from '@sinclair/typebox';
import type { activityDto, clientServerEvent, serverClientEvent } from './socket-events';

export type ClientServerEvent = typeof clientServerEvent;
export type ServerClientEvent = typeof serverClientEvent;
export type AllEvents = ClientServerEvent | ServerClientEvent;
export type SocketId = string;

export type EventType<T extends AllEvents> = Static<T>['type'];
export type DataType<T extends AllEvents, TEvent extends EventType<T>> = Extract<Static<T>, { type: TEvent }>['data'];
export type ClientEvent = EventType<ServerClientEvent>;
export type ClientData<TData extends ClientEvent> = DataType<ServerClientEvent, TData>;
export type ServerEvent = EventType<ClientServerEvent>;
export type ServerData<TData extends ServerEvent> = DataType<ClientServerEvent, TData>;

export type Query<T> = { [key in keyof T]?: boolean };
export type Update<T> = Partial<T>;
export type Many<T> = Omit<T, 'id'> & { id?: boolean | string[] };
export type QueryMany<T> = Many<Query<T>>;
export type UpdateMany<T> = Many<Update<T>>;

export type Activity = Static<typeof activityDto>;
