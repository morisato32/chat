import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import styles from "../components/userList.module.css";
import io from "socket.io-client";
import UserPanel from "../components/userPainel";

function UserList({ onSelectUser, userIdLogado, currentUser, setCurrentUser }) {
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
    if (!currentUser?.id) return;
    const fetchUsers = async () => {
      const response = await api.get("/users");
      console.log("Usuários recebidos:", response.data);
      setUsers(response.data);
    };
    fetchUsers();
  }, [currentUser]);
  

  useEffect(() => {
    if (!userIdLogado) return;

    socketRef.current = io("http://localhost:5000", {
      query: { userId: userIdLogado },
    });

    socketRef.current.on("online-users", (userIds) => {
      const initialState = {};
      userIds.forEach((id) => {
        initialState[id] = true;
      });
      setOnlineUsers(initialState);
    });

    // Atualiza avatar em tempo real para todos
    socketRef.current.on("avatar-updated", ({ userId, AvatarUrl }) => {
      setUsers(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, avatar: AvatarUrl } : user
        )
      );
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
            <img
              src={
                user.avatar
                  ? user.avatar.startsWith("http")
                    ? user.avatar
                    : `http://localhost:5000${user.avatar}`
                  : "https://thumbs.dreamstime.com/b/%C3%ADcone-de-perfil-avatar-padr%C3%A3o-imagem-usu%C3%A1rio-m%C3%ADdia-social-210115353.jpg"
              }
              alt="Avatar"
              className={styles.user_avatar}
            />
            <span className={styles.user_name}>{user.name}</span>
            <span
              className={`${styles.status_dot} ${
                onlineUsers[user.id] ? styles.online : styles.offline
              }`}
            ></span>
          </div>
        ))}

      {/* Painel do usuário logado */}
  <div className={styles.user_panel_container}>
    <UserPanel
      currentUser={currentUser}
      setCurrentUser={setCurrentUser}
      socket={socketRef.current}
      
    />
  </div>
    </div>
  );
}

export default UserList;
