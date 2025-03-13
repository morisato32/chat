import styles from "../../components/chat.module.css";
import io from "socket.io-client";
import { useEffect, useState,useRef} from "react";
import api from "../../services/api";

const socket = io("http://localhost:5000");

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState(null);

  const messagesEndRef = useRef(null); // Referência para a última mensagem

// Função para rolar até a última mensagem
const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
};

useEffect(() => {
  scrollToBottom(); // Rola automaticamente quando mensagens são carregadas ou enviadas
}, [messages]);

  // Pegando os dados do usuário da sessão
  const userString = sessionStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const userId = user ? user.id : null;
  const userName = user ? user.name : "Usuário Desconhecido";

  useEffect(() => {
    socket.emit("requestMessages");

    socket.on("loadMessages", (loadedMessages) => {
      setMessages(loadedMessages);
    });

    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("loadMessages");
      socket.off("receiveMessage");
    };
  }, []);

  // Função única para enviar texto ou mídia
  const sendMessage = async (e) => {
    e.preventDefault();

    if (file) {
      // Se houver um arquivo, faz o upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);

      try {
        const response = await api.post(
          "http://localhost:5000/upload",
          formData
        );
        const { midiaUrl, tipoMidia } = response.data;

        // Envia a mídia pelo Socket.IO
        socket.emit("sendMessage", { conteudo: midiaUrl, userId, tipoMidia });

        setFile(null); // Limpa o estado do arquivo
      } catch (error) {
        console.error("Erro ao enviar mídia:", error);
      }
    } else if (newMessage.trim()) {
      // Se não houver arquivo, mas houver texto, envia mensagem normal
      socket.emit("sendMessage", {
        conteudo: newMessage,
        userId,
        tipoMidia: "texto",
      });
      setNewMessage(""); // Limpa o campo de texto
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.userName}>{userName} batendo papo...</h2>

      <ul className={styles.messages}>
        {messages.map((message, index) => (
          <li
            key={index}
            className={
              message.userId === userId ? styles.sent : styles.received
            }
          >
            <span>{message.user?.name || "Desconhecido"}</span>

            {message.tipoMidia === "imagem" ? (
              <img
                src={message.conteudo}
                alt="Imagem enviada"
                className={styles.media}
              />
            ) : message.tipoMidia === "audio" ? (
              <audio controls>
                <source src={message.conteudo} type="audio/mp3" />
                Seu navegador não suporta áudio.
              </audio>
            ) : message.tipoMidia === "video" ? (
              <video controls className={styles.video}>
                <source src={message.conteudo} type="video/mp4" />
                Seu navegador não suporta vídeos.
              </video>
            ) : (
              <p>{message.conteudo}</p>
            )}
          </li>
        ))}
        <div ref={messagesEndRef} /> {/* Referência para rolar ao final */}
      </ul>

      {/* Um único formulário para enviar tanto texto quanto mídia */}
      <form className={styles.form} onSubmit={sendMessage}>
        <input
          className={styles.input}
          type="text"
          autoComplete="off"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite uma mensagem..."
        />

        {/* Input de arquivo estilizado */}
        <label className={styles.uploadButton}>
          📎 Escolher Arquivo
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        </label>

        {/* Exibir nome do arquivo selecionado */}
        {file && <span className={styles.fileName}>{file.name}</span>}

        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}

export default Chat;
