import { useContext, useEffect } from "react";
import { SocketContext } from "../../App.tsx";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

export function Login() {
  const socket = useContext(SocketContext);
  const navigate = useNavigate();

  useEffect(() => {
    socket?.on("Authentication/LoginSuccess", (s, d) => {
      navigate("/profiles");
    });
    socket?.on("Authentication/LogoutSuccess", (s, d) => {
      navigate("/login");
    });
  }, [socket]);

  const handleSuccess = (response: CredentialResponse) => {
    if (!socket || !response.credential) return;
    socket.send("Authentication/GoogleLogin", { token: response.credential });
  };

  return (
    <>
      <h1>Idle RPG</h1>
      {socket ? (
        <GoogleLogin onSuccess={handleSuccess} />
      ) : (
        <p>Establishing connection.</p>
      )}
    </>
  );
}
