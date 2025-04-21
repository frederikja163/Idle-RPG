import { useEffect, useState } from "react";
import "./index.css";
import { clientSocket, type ClientSocket } from "@/shared/socket";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";

export function App() {
  const [socket, setSocket] = useState<ClientSocket | null>(null);

  useEffect(() => {
    if (socket) return;

    const ws = new WebSocket(String(window.location));
    clientSocket(ws).then((s) => {
      s.send("Ping", {});
      s.on("Pong", () => console.log("Pong"));
      setSocket(s);
    });
  });

  const handleSuccess = (response: CredentialResponse) => {
    if (!socket || !response.credential) return;
    socket.send("Account/Authenticate", { token: response.credential });
  };

  return (
    <>
      {socket ? (
        <GoogleLogin onSuccess={handleSuccess} />
      ) : (
        <p>Establishing connection.</p>
      )}
      <h1>Idle RPG</h1>
    </>
  );
}
