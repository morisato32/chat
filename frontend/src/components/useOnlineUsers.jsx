import { useEffect, useState } from "react";
import io from "socket.io-client";

function useOnlineUsers(userIdLogado) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socket = io("https://localhost:5000");

  useEffect(() => {
    if (!userIdLogado) return;

    // Conecta o socket (se ainda não estiver)
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("register", userIdLogado);
    socket.emit("getOnlineUsers");

    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    socket.on("userOnline", (userId) => {
      setOnlineUsers((prev) => [...new Set([...prev, userId])]);
    });

    socket.on("userOffline", (userId) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    return () => {
      socket.off("onlineUsers");
      socket.off("userOnline");
      socket.off("userOffline");
    };
  }, [userIdLogado]);

  return { onlineUsers };
}

export default useOnlineUsers;
