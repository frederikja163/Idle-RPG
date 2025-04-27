import { Socket } from "@/shared/socket";
import {
  clientServerEvent,
  ErrorType,
  serverClientEvent,
} from "@/shared/socket-events";
import { TypeCompiler } from "@sinclair/typebox/compiler";

export type ClientSocket = Socket<
  typeof serverClientEvent,
  typeof clientServerEvent
>;
export async function clientSocket(ws: WebSocket) {
  await new Promise<void>((resolve) => {
    if (ws.readyState == ws.OPEN) {
      resolve();
    } else {
      ws.addEventListener("open", () => resolve(), { once: true });
    }
  });
  const socket = new Socket<typeof serverClientEvent, typeof clientServerEvent>(
    TypeCompiler.Compile(serverClientEvent),
    ws.send.bind(ws)
  );
  ws.addEventListener("message", (ev) => socket.handleMessage(ev.data));
  return socket;
}
