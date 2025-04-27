import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import io from "socket.io-client";
import styles from "../components/userList.module.css";
import UserPanel from "../components/userPainel";

function UserList({
  onSelectUser,
  userIdLogado,
  currentUser,
  setCurrentUser,
  unreadCounts,
}) {
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});
  const socketRef = useRef(null);

  // Buscar todos os usuários
  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (err) {
      console.error("Erro ao buscar usuários", err);
    }
  };

  // Buscar ao logar
  useEffect(() => {
    if (userIdLogado) {
      fetchUsers();
    }
  }, [userIdLogado]);

  // Buscar ao atualizar o currentUser
  useEffect(() => {
    if (currentUser?.id) {
      fetchUsers();
    }
  }, [currentUser]);

  // Conexão socket e listeners
  useEffect(() => {
    if (!userIdLogado) return;

    socketRef.current = io("http://localhost:5000", {
      query: { userId: userIdLogado },
    });

    socketRef.current.on("online-users", (userIds) => {
      const estadoOnline = {};
      userIds.forEach((id) => {
        estadoOnline[id] = true;
      });
      setOnlineUsers(estadoOnline);
    });

    socketRef.current.on("avatarAtualizado", ({ userId, avatarUrl }) => {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, avatar: avatarUrl } : user
        )
      );
    });

    socketRef.current.on("novoUsuario", (novoUser) => {
      setUsers((prev) => [...prev, novoUser]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [userIdLogado]);

  // Render
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
              {/* Badge de mensagens não lidas */}
            {unreadCounts?.[user.id] > 0 && ( // <- Aqui você usa o unreadCounts recebido
              <span className={styles.unread_badge}>{unreadCounts[user.id]}</span>
            )}
          </div>
        ))}

      {/* Painel do usuário logado */}
      <div className={styles.user_panel_container}>
        <UserPanel
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          socket={socketRef.current}
          unreadCounts={unreadCounts}
        />
      </div>
    </div>
  );
}

export default UserList;
