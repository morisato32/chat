import { useEffect, useState } from "react";
import api from "../services/api";
import styles from "../components/userList.module.css";

function UserList({ onSelectUser, userIdLogado }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!userIdLogado) return; // Só carrega se tiver ID
        const response = await api.get("/users");
        setUsers(response.data);
      } catch (err) {
        console.error("Erro ao buscar usuários", err);
      }
    };

    fetchUsers();
  }, [userIdLogado]);

  return (
    <div className={styles.user_list}>
      {users
        .filter((user) => user.id !== userIdLogado) // filtra o logado ➡️ "Mostre apenas os usuários cujo ID seja diferente do ID do usuário logado,
        // e certifique-se de que os tipos também sejam diferentes (ou iguais) se for o caso."
        .map((user) => (
          <div
            key={user.id}
            onClick={() => onSelectUser(user)}
            className={styles.user_item}
          >
            {/*<img src={user.avatarUrl} alt="avatar" className="avatar" />*/}
            <span>{user.name}</span>
          </div>
        ))}
    </div>
  );
}

export default UserList;
