import { useEffect, useState } from "react";
import api from "../services/api";
import styles from '../components/userList.module.css'

function UserList({ onSelectUser }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/users");
        setUsers(response.data);
      } catch (err) {
        console.error("Erro ao buscar usuários", err);
      }
    };

    fetchUsers();
  }, []);

  return (
    
    <div className={styles.user_list}>
      {users.map((user) => (
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
