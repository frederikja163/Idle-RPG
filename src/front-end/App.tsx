import { useEffect } from "react";
import "./index.css";
import { clientSocket } from "@/shared/events";

let ws: WebSocket | null = null;

export function App() {
  useEffect(() => {
    if (ws) return;

    ws = new WebSocket(String(window.location));
    clientSocket(ws).then((socket) => {
      socket.send("Ping", {});
      socket.on("Pong", () => console.log("Pong"));
    });
  });

  return <h1>Idle RPG</h1>;
}
