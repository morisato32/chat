import styles from "../../components/chat.module.css";
import io from "socket.io-client";
import { useState, useEffect } from "react";

const socket = io("http://localhost:5000");

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Pegando nome e ID do usuário da sessão
  const nomeUsuario = sessionStorage.getItem("name");
  const userId = sessionStorage.getItem("userId"); // Adicione isso no login para salvar o ID

  // Carregar mensagens antigas ao entrar no chat
  useEffect(() => {
    socket.emit("requestMessages");

    socket.on("loadMessages", (loadedMessages) => {
      setMessages(loadedMessages);
    });

    socket.on("receiveMessage", (message) => {
      console.log("Mensagem recebida:", message); // Veja a estrutura real no console
      console.log(message.user)
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("loadMessages");
      socket.off("receiveMessage");
    };
  }, []);

  // Enviar mensagem para o servidor
  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socket.emit("sendMessage", {
        conteudo: newMessage,
        userId: userId, // Agora enviando o ID correto
      });
      setNewMessage(""); // Limpar campo de entrada
    }
  };

  return (
    <div className={styles.container}>
      <p className={styles.userName}>
        {nomeUsuario} <span>batendo papo...</span>
      </p>

      <ul className={styles.messages}>
        {messages.map((message, index) => (
          <li
            key={index}
            className={message.userId === userId ? styles.sent : styles.received}
          >
            {/* Certifique-se de que mmessage.user existe antes de acessar .name */}
            <span className={styles.senderName}>
            <span>{message.user && message.user.name ? message.user.name : "Desconhecido"}</span>

             
            </span>
            <p>{message.conteudo}</p>
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
