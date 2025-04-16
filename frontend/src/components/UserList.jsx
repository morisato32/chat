import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import styles from "../components/userList.module.css";
import io from "socket.io-client";

function UserList({ onSelectUser, userIdLogado }) {
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!userIdLogado) return;
        const response = await api.get("/users");
        setUsers(response.data);
      } catch (err) {
        console.error("Erro ao buscar usuários", err);
      }
    };

    fetchUsers();
  }, [userIdLogado]);

  useEffect(() => {
    if (!userIdLogado) return;
  
    socketRef.current = io("http://localhost:5000", {
      query: { userId: userIdLogado },
    });
  
    // snapshot inicial dos usuários online
    socketRef.current.on("online-users", (userIds) => {
      const initialState = {};
      userIds.forEach((id) => {
        initialState[id] = true;
      });
      setOnlineUsers(initialState);
    });
  
    // atualizações em tempo real
    socketRef.current.on("user-status", ({ userId, online }) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [userId]: online,
      }));
    });
  
    return () => {
      socketRef.current.disconnect();
    };
  }, [userIdLogado]);
  

  return (
    <div className={styles.user_list}>
      {users
        .filter((user) => user.id !== userIdLogado)
        .map((user) => (
          <div
            key={user.id}
            onClick={() => onSelectUser(user)}
            className={styles.user_item}
          >
            <span>{user.name}</span>
            <span
              className={`${styles.status_dot} ${
                onlineUsers[user.id] ? styles.online : styles.offline
              }`}
            ></span>
            
          </div>
        ))}
    </div>
  );
}

export default UserList;
