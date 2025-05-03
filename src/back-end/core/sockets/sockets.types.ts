import type { DataType, EventType } from '@/shared/socket';
import type { ClientServerEvent } from '@/shared/socket-events';

export type ServerData<TData extends EventType<ClientServerEvent>> = DataType<ClientServerEvent, TData>;
export type SocketId = string;
