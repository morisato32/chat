import styles from "../../components/chat.module.css";
import io from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io("http://localhost:5000");

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Pegando os dados do usuário da sessão
  const userString = sessionStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const userId = user ? user.id : null;
  const userName = user ? user.name : "Usuário Desconhecido";

  console.log("Usuário logado:", user);

  useEffect(() => {
    socket.emit("requestMessages");

    socket.on("loadMessages", (loadedMessages) => {
      console.log("Mensagens carregadas:", loadedMessages);
      setMessages(loadedMessages);
    });

    socket.on("receiveMessage", (message) => {
      console.log("Mensagem recebida:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("loadMessages");
      socket.off("receiveMessage");
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socket.emit("sendMessage", { conteudo: newMessage, userId });
      setNewMessage(""); // Limpar campo de entrada
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.userName}>{userName} batendo papo...</h2>

      <ul className={styles.messages}>
        {messages.map((msg, index) => (
          <li
            key={index}
            className={msg.userId === userId ? styles.sent : styles.received}
          >
            <span>{msg.user?.name || "Desconhecido"}</span>
            <p>{msg.conteudo}</p>
          </li>
        ))}
      </ul>

      <form className={styles.form} onSubmit={sendMessage}>
        <input
          className={styles.input}
          autoComplete="off"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}

export default Chat;
