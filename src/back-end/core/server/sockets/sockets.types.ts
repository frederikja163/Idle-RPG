import type { DataType, EventType } from '@/shared/socket';
import type { ClientServerEvent, ServerClientEvent } from '@/shared/socket/socket-events';

export type ClientEvent = EventType<ServerClientEvent>;
export type ClientData<TData extends ClientEvent> = DataType<ServerClientEvent, TData>;
export type ServerEvent = EventType<ClientServerEvent>;
export type ServerData<TData extends ServerEvent> = DataType<ClientServerEvent, TData>;
export type SocketId = string;
