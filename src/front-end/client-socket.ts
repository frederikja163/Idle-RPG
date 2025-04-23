import { Socket } from "@/shared/socket";
import type {
  ClientServerEvent,
  ServerClientEvent,
} from "@/shared/socket-events";

export type ClientSocket = Socket<ServerClientEvent, ClientServerEvent>;
export async function clientSocket(ws: WebSocket) {
  await new Promise<void>((resolve) => {
    if (ws.readyState == ws.OPEN) {
      resolve();
    } else {
      ws.addEventListener("open", () => resolve(), { once: true });
    }
  });

  const socket = new Socket<ServerClientEvent, ClientServerEvent>(
    ws.send.bind(ws)
  );
  ws.addEventListener("message", (ev) => socket.handleMessage(ev.data));
  return socket;
}
