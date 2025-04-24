import { createContext, useEffect, useState } from "react";
import "./index.css";
import { type ClientSocket, clientSocket } from "./client-socket";
import { Login } from "./components/pages/login.tsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Profiles } from "./components/pages/profiles.tsx";
import { NavBar } from "./components/nav-bar.tsx";

export const SocketContext = createContext<ClientSocket | null>(null);

export function App() {
  const [socket, setSocket] = useState<ClientSocket | null>(null);

  useEffect(() => {
    if (socket) return;
    const ws = new WebSocket(String(window.location));
    clientSocket(ws).then(setSocket);
  });

  return (
    <SocketContext.Provider value={socket}>
      <NavBar />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profiles" element={<Profiles />} />
        </Routes>
      </BrowserRouter>
    </SocketContext.Provider>
  );
}
