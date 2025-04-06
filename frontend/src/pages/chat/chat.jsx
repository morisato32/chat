import styles from "../../components/chat.module.css";
import io from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import api from "../../services/api";
import {
  MdFileUpload,
  MdArrowRight,
  MdMic,
  MdStop,
  MdMoreVert,
  
} from "react-icons/md";

import { useNavigate } from "react-router-dom";

import VideoChat from "../../components/videoChat"

const socket = io("http://localhost:5000");

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedText, setEditedText] = useState(""); // Ao definir o estado, garanta que ele comece com "" para evitar valores undefined:
  const navigate = useNavigate();

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

  if (!user.token || !user) {
    navigate("/");
  }

  const sendMessage = async (e) => {
    e.preventDefault();

    if (file) {
      await uploadFile(file, file.name, getFileType(file.type));
      setFile(null);
      return;
    }

    if (newMessage.trim()) {
      socket.emit("sendMessage", {
        conteudo: newMessage,
        userId,
        tipoMidia: "texto",
      });
      setNewMessage("");
    }
  };

  const uploadFile = async (file, fileName, tipoMidia) => {
    const formData = new FormData();
    formData.append("file", file, fileName);
    formData.append("userId", userId);

    try {
      const response = await api.post("http://localhost:5000/upload", formData);
      socket.emit("sendMessage", {
        conteudo: response.data.midiaUrl,
        userId,
        tipoMidia,
      });
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
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop(); // Chama o stop apenas se a gravação estiver ativa
    }
  };

  // Estados para controlar o menu suspenso
  // inicializa uma variável de estado com o valor null. Isso significa que, inicialmente, nenhum menu está aberto.
  const [openMenuIndex, setOpenMenuIndex] = useState(null);

  const toggleMenu = (index) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  const updateMessage = async (messageId, newText) => {
    console.log("Tentando atualizar mensagem:", messageId, "para:", newText); // DEBUG

    if (!newText.trim()) return; // Evita salvar mensagens vazias

    if (!messageId || !newText) {
      console.error("Erro: ID ou novo texto está indefinido.");
      return;
    }

    try {
      const response = await api.put(`/messages/update/${messageId}`, {
        novoConteudo: newText, // Envia o novo texto para o backend // ✅ Agora enviamos "novoConteudo", que o backend espera
      });
      console.log(response);

      if (response.status === 200) {
        // Atualiza o estado das mensagens localmente após o sucesso
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? { ...msg, conteudo: newText } : msg
          )
        );
        setEditingMessageId(null); // Sai do modo de edição
        setEditedText(""); // Limpa o campo de edição
      } else {
        console.error("Erro ao atualizar mensagem");
      }
    } catch (error) {
      console.error(
        "Erro ao se comunicar com o servidor",
        error.response?.data || error
      );
    }
  };

  const deleteMessage = async (index, messageId) => {
    if (confirm("Tem certeza que deseja excluir esta mensagem?")) {
      try {
        const response = await api.delete(`/messages/delete/${messageId}`);

        if (response.status === 200) {
          setMessages((prevMessages) =>
            prevMessages.filter((_, i) => i !== index)
          );
        } else {
          console.error("Erro ao excluir mensagem");
        }
      } catch (error) {
        console.error("Erro ao se comunicar com o servidor", error);
      }
    }
  };
  

  return (
    <div className={styles.container}>
      
      <h2 className={styles.userName}>{userName} batendo papo...</h2>
      <label className={styles.uploadButton}>
          <MdFileUpload />
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        </label>

        {file && <span className={styles.fileName}>{file.name}</span>}

      
      <VideoChat/>

      <ul className={styles.messages}>
        {messages.map((message, index) => (
          <li
            key={message.id}
            className={
              message.userId === userId ? styles.sent : styles.received
            }
          >
            <div className={styles.messageHeader}>
              <span>{message.user?.name || "Desconhecido"}</span>
              <div className={styles.moreOptionsContainer}>
                <MdMoreVert
                  className={styles.moreOptions}
                  onClick={() => toggleMenu(index)}
                />
                {openMenuIndex === index && (
                  <div className={styles.dropdownMenu}>
                    <button onClick={() => deleteMessage(index, message.id)}>
                      Excluir
                    </button>
                    <button onClick={() => setEditingMessageId(message.id)}>
                      Editar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Campo de edição dentro da mensagem */}
            {editingMessageId === message.id ? (
              <div className={styles.editContainer}>
                <input
                  type="text"
                  value={editedText || ""} //Garanta que editedText nunca seja undefined ou null, definindo um valor padrão ("").
                  onChange={(e) => setEditedText(e.target.value)}
                />
                <button onClick={() => updateMessage(message.id, editedText)}>
                  {console.log(editedText)}
                  Salvar
                </button>
                <button onClick={() => setEditingMessageId(null)}>
                  Cancelar
                </button>
              </div>
            ) : (
              <div>
                {message.tipoMidia === "imagem" ? (
                  <img
                    src={message.conteudo}
                    alt="Imagem enviada"
                    className={styles.media}
                  />
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
              </div>
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

        {!newMessage && !file ? (
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={styles.chat_microfone}
          >
            {isRecording ? <MdStop color="red" /> : <MdMic />}
          </button>
        ) : (
          <button className= {styles.chat_button} type="submit">
            <MdArrowRight />
          </button>
        )}

       
      </form>
    </div>
  );
}

export default Chat;