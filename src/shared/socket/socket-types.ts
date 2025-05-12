import type { Static } from '@sinclair/typebox';
import type { clientServerEvent, serverClientEvent } from './socket-events';

export type AllEvents = ClientServerEvent | ServerClientEvent;
export type EventType<T extends AllEvents> = Static<T>['type'];
export type DataType<T extends AllEvents, TEvent extends EventType<T>> = Extract<Static<T>, { type: TEvent }>['data'];
export type ClientServerEvent = typeof clientServerEvent;
export type ServerClientEvent = typeof serverClientEvent;

export type ClientEvent = EventType<ServerClientEvent>;
export type ClientData<TData extends ClientEvent> = DataType<ServerClientEvent, TData>;
export type ServerEvent = EventType<ClientServerEvent>;
export type ServerData<TData extends ServerEvent> = DataType<ClientServerEvent, TData>;
export type SocketId = string;
