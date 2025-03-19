import styles from "../../components/chat.module.css";
import io from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import api from "../../services/api";
import { MdFileUpload, MdArrowRight, MdMic, MdStop } from "react-icons/md";

const socket = io("http://localhost:5000");

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.emit("requestMessages");

    socket.on("loadMessages", setMessages);
    socket.on("receiveMessage", (message) =>
      setMessages((prevMessages) => [...prevMessages, message])
    );

    return () => {
      socket.off("loadMessages");
      socket.off("receiveMessage");
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const userId = user.id || null;
  const userName = user.name || "Usuário Desconhecido";

  const sendMessage = async (e) => {
    e.preventDefault();

    if (file) {
      await uploadFile(file, file.name, getFileType(file.type));
      setFile(null);
      return;
    }

    if (newMessage.trim()) {
      socket.emit("sendMessage", { conteudo: newMessage, userId, tipoMidia: "texto" });
      setNewMessage("");
    }
  };

  const uploadFile = async (file, fileName, tipoMidia) => {
    const formData = new FormData();
    formData.append("file", file, fileName);
    formData.append("userId", userId);

    try {
      const response = await api.post("http://localhost:5000/upload", formData);
      socket.emit("sendMessage", { conteudo: response.data.midiaUrl, userId, tipoMidia });
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
    }
  };

  const getFileType = (mimeType) => {
    if (mimeType.startsWith("image/")) return "imagem";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType.startsWith("video/")) return "video";
    return "arquivo";
  };

  const startRecording = async () => {
    if (isRecording) return; // Impede iniciar uma nova gravação se já estiver gravando
  
    setIsRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
  
    mediaRecorderRef.current = mediaRecorder;
    let chunks = [];
  
    mediaRecorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };
  
    mediaRecorder.onstop = async () => {
      setIsRecording(false);
      const audioBlob = new Blob(chunks, { type: "audio/webm" });
      await uploadFile(audioBlob, "audio.webm", "audio"); // Envia o arquivo de áudio após a gravação
    };
  
    mediaRecorder.start();
  };
  

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop(); // Chama o stop apenas se a gravação estiver ativa
    }
  };
  

  return (
    <div className={styles.container}>
      <h2 className={styles.userName}>{userName} batendo papo...</h2>

      <ul className={styles.messages}>
        {messages.map((message, index) => (
          <li
            key={index}
            className={message.userId === userId ? styles.sent : styles.received}
          >
            <span>{message.user?.name || "Desconhecido"}</span>
            {message.tipoMidia === "imagem" ? (
              <img src={message.conteudo} alt="Imagem enviada" className={styles.media} />
            ) : message.tipoMidia === "audio" ? (
              <audio controls>
                <source src={message.conteudo} type="audio/webm" />
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
        <div ref={messagesEndRef} />
      </ul>

      <form className={styles.form} onSubmit={sendMessage}>
        <input
          className={styles.input}
          type="text"
          autoComplete="off"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite uma mensagem..."
        />

        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={styles.microphoneButton}
        >
          {isRecording ? <MdStop color="red"/> : <MdMic />}
        </button>

        <label className={styles.uploadButton}>
          <MdFileUpload />
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        </label>

        {file && <span className={styles.fileName}>{file.name}</span>}

        <button type="submit">
          <MdArrowRight />
        </button>
      </form>
    </div>
  );
}

export default Chat;
