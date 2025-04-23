import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../App";
import { Button } from "./ui/button";

export function NavBar() {
  const socket = useContext(SocketContext);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    socket?.on("Authentication/LoginSuccess", (s, d) => {
      setLoggedIn(true);
    });
    socket?.on("Authentication/LogoutSuccess", (s, d) => {
      setLoggedIn(false);
    });
  }, [socket]);

  return (
    <div>
      {loggedIn ? (
        <Button onClick={() => socket?.send("Authentication/Logout", {})}>
          Log out
        </Button>
      ) : (
        <p>Go to home</p>
      )}
    </div>
  );
}
