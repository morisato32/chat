import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ userId, children }) => {
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socketInstance, setSocketInstance] = useState(null);

  useEffect(() => {
    if (!userId || socketRef.current) return;

    const socket = io("https://localhost:5000", { query: { userId } });
    socketRef.current = socket;
    setSocketInstance(socket);

    socket.emit("register", userId);
    

 

  socket.on("online-users", setOnlineUsers);
  socket.on("user-status", ({ userId, online }) => {
    setOnlineUsers((prev) => {
      const exists = prev.includes(userId);
      if (online && !exists) return [...prev, userId];
      if (!online && exists) return prev.filter((u) => u !== userId);
      return prev;
    });
  });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={{ socket: socketInstance, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
