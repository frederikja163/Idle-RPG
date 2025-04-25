import { SocketContext } from "@/front-end/App";
import type { EventType } from "@/shared/socket";
import {
  clientServerEvent,
  type ClientServerEvent,
} from "@/shared/socket-events";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useContext, useEffect, useState } from "react";

export function Test() {
  const socket = useContext(SocketContext);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    socket?.on("Authentication/LoginSuccess", () => setLoggedIn(true));
    socket?.send("Ping", {});
  }, [socket]);

  const handleSuccess = (r: CredentialResponse) => {
    socket?.send("Authentication/GoogleLogin", { token: r.credential! });
  };

  const send = (form: FormData) => {
    const event = form.get("event") as EventType<ClientServerEvent>;
    const data = JSON.parse(String(form.get("data")));
    socket?.send(event, data);
  };

  return (
    <>
      <h1>Testing</h1>
      {loggedIn ? null : <GoogleLogin onSuccess={handleSuccess} />}
      <form action={send}>
        <input name="event" />
        <input name="data" />
        <button type="submit">Send</button>
      </form>
    </>
  );
}
