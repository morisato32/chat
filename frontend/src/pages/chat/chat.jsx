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
  MdEmojiEmotions,
  MdCheck,
  MdDoneAll,
} from "react-icons/md";

import { useNavigate } from "react-router-dom";

import VideoChat from "../../components/videoChat";

import UserList from "../../components/UserList";

import EmojiPicker from "../../components/EmojiPicker";

import playNotificationSound from "../../components/notificacaoDaMensagem";

import UserPanel from "../../components/userPainel"; // ajuste o caminho conforme seu projeto

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [destinatario, setDestinatario] = useState(null);
  const [userIdLogado, setUserIdLogado] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const socketRef = useRef(socket);  // Usando useRef para manter a referência do socket
 

  useEffect(() => {
    // Verifica se já existe no sessionStorage
    let user = sessionStorage.getItem("user");

    // Se não tiver no sessionStorage, tenta recuperar do localStorage
    if (!user) {
      user = localStorage.getItem("user");

      if (user) {
        sessionStorage.setItem("user", user); // Restaura para sessionStorage
      }
    }

    if (user) {
      const parsedUser = JSON.parse(user);
      console.log("Usuário carregado:", parsedUser); // 👈 veja se avatar aparece aqui
      setCurrentUser(parsedUser);
      setUserIdLogado(parsedUser.id);
    } else {
      // Redireciona para login se não tiver user
      navigate("/");
    }
  }, []);

  const navigate = useNavigate();

  // emoji
  const handleEmojiSelect = (emoji) => {
    setNewMessage((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  // 🧠 Por que mudar a dependência do useEffect?
  // Com [], ele roda só uma vez no carregamento da página.

  // Mas userId e destinatario podem vir depois (async ou mudança de estado).

  // Colocando [socket, userId, destinatario], você garante que o requestMessages será reenviado quando o usuário for selecionado.

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  // Recuperar ao carregar o componente
  // No Chat.jsx ou onde você controla o estado do destinatario:
  useEffect(() => {
    if (userIdLogado) {
      const destinatarioSalvo = localStorage.getItem("destinatario");
      if (destinatarioSalvo) {
        setDestinatario(JSON.parse(destinatarioSalvo));
      }
    }
  }, [userIdLogado]);

  // 🧠 Dica extra
  // Se você quiser manter localStorage sincronizado automaticamente com o estado React:
  useEffect(() => {
    if (destinatario) {
      localStorage.setItem("destinatario", JSON.stringify(destinatario));
    }
  }, [destinatario]);

  const userId = user.id || null;
  const userName = user.name || "Usuário Desconhecido";

  if (!user || !user.token) {
    navigate("/");
  }

  useEffect(() => {
    if (socket && userId) {
      socket.emit("registrarUsuario", userId);
    }
  }, [userId]);

  useEffect(() => {
    if (!socket || !userId || !destinatario?.id) return;
  
    socketRef.current = socket; // Garante que a referência seja a mais recente

    console.log("destinatario?.id:", destinatario?.id);

  
    // 🔄 Solicita mensagens antigas da conversa atual
    socket.emit("requestMessages", {
      fromUserId: userId,
      toUserId: destinatario.id,
    });
  
    // 📥 Handler para carregar mensagens antigas
    const handleLoadMessages = (messages) => {
      setMessages(messages);
    };
  
    // 📩 Handler para mensagens recebidas em tempo real
    const handleReceiveMessage = (message) => {
      console.log("📩 Mensagem recebida (receivePrivateMessage):", message);
  
      const isRelevant =
        (message.userId === userId && message.destinatarioId === destinatario.id) ||
        (message.userId === destinatario.id && message.destinatarioId === userId);
  
        console.log("Mensagem relevante?", isRelevant,message); // Verifica se a mensagem passou no filtro
      if (isRelevant) {
        setMessages((prevMessages) => [...prevMessages, message]);
        console.log("✅ Mensagem adicionada:", message);
      }
  
      // 🔊 Notificação sonora se for do outro usuário
      if (message.userId !== userId) {
        playNotificationSound();
      }
  
      // ✅ Marca como lida se veio do destinatário atual
      if (message.userId === destinatario.id) {
        socket.emit("marcarMensagemComoLida", {
          mensagemId: message.id,
          usuarioId: userId,
        });
      }
    };
  
    // ⏬ Subscrição dos eventos
    socket.on("loadMessages", handleLoadMessages);
    socket.on("receivePrivateMessage", handleReceiveMessage);
  
    // 🧹 Cleanup ao desmontar
    return () => {
      socket.off("loadMessages", handleLoadMessages);
      socket.off("receivePrivateMessage", handleReceiveMessage);
    };
  }, [userId, destinatario, socket]);

  useEffect(() => {
    console.log("🧾 Todas mensagens:", messages);
  }, [messages]);
  
  

  // status da mensagem

  // Quando abre a conversa com alguém, marca as mensagens como lidas
  useEffect(() => {
    if (!destinatario?.id) return;

    socket.emit("marcar_como_lida", {
      remetenteId: destinatario.id, // <- Quem enviou a mensagem (userId no banco)
      destinatarioId: userId, // <- eu (o logado) estou lendo agora
    });

    socket.emit("entrouNaConversa", {
      userId: userId,
      conversandoComId: destinatario.id,
    });

    console.log(
      "📤 Emitido 'marcar_como_lida' de:",
      userId,
      "para:",
      destinatario.id
    );
  }, [destinatario, userId]);

  // Quando o servidor responde com as mensagens marcadas como lidas
  useEffect(() => {
    socket.on("mensagens_lidas", ({ de, mensagens }) => {
      console.log("🔵 Mensagens lidas recebidas de:", de, mensagens);

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.userId === userId &&
          msg.destinatarioId === de &&
          mensagens.some((m) => m.id === msg.id)
            ? { ...msg, status: "LIDA" }
            : msg
        )
      );
    });

    return () => {
      socket.off("mensagens_lidas");
    };
  }, [userId]);

  const renderStatusIcon = (status) => {
    switch (status) {
      case "ENVIADA":
        return (
          <span title="Enviada">
            <MdCheck style={{ color: "#333" }} />
          </span>
        );
      case "ENTREGUE":
        return (
          <span title="Entregue">
            <MdDoneAll style={{ color: "#333" }} />
          </span>
        );
      case "LIDA":
        return (
          <span title="Lida">
            <MdDoneAll style={{ color: "dodgerblue" }} />
          </span>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (file) {
      await uploadFile(file, file.name, getFileType(file.type));
      setFile(null);
      return;
    }

    if (newMessage.trim()) {
      console.log("Enviando mensagem para:", destinatario?.id);

      socket.emit("sendPrivateMessage", {
        conteudo: newMessage,
        fromUserId: userId,
        toUserId: destinatario?.id,
        tipoMidia: "texto",
      });
      setNewMessage("");
    }

    console.log("Emitindo sendPrivateMessage:", {
      conteudo: newMessage,
      fromUserId: userId,
      toUserId: destinatario.id,
      tipoMidia: "texto",
    });
  };

  const uploadFile = async (file, fileName, tipoMidia) => {
    const formData = new FormData();
    formData.append("file", file, fileName);
    formData.append("userId", userId);

    try {
      const response = await api.post("http://localhost:5000/upload", formData);
      socket.emit("sendPrivateMessage", {
        conteudo: response.data.midiaUrl,
        fromUserId: userId,
        toUserId: destinatario.id,
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
    if (mimeType === "application/pdf") return "pdf";
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
      console.log('novaMensagem:',response);

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
  console.log("ID do usuário logado:", userIdLogado);
  console.log("currentUser", currentUser);

  return (
    <div className={styles.container}>
      <div className={styles.chat_layout}>
        {/* Lado esquerdo - Lista de usuários */}

        <>
          {/* {currentUser && (
        <>
          <UserPanel
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            socketRef={socketRef}
          /> */}

          {currentUser && (
            <UserList
              onSelectUser={(user) => {
                localStorage.setItem("destinatario", JSON.stringify(user));
                setDestinatario(user);
              }}
              userIdLogado={currentUser.id}
              selectedUserId={destinatario?.id}
              destinatario={destinatario}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              
            />
          )}
        </>

        {/* <UserPanel currentUser={currentUser} onAvatarUpdated={handleAvatarUpdate} /> */}

        {/* Lado direito - Conteúdo do chat */}
        <div className={styles.chat_content}>
          <div className={styles.chat_header}>
            <span className={styles.userName}>
              {destinatario?.name || "desconhecido"}
            </span>

            <div className={styles.headerActions}>
              <label className={styles.uploadButton}>
                <MdFileUpload title="upload de arquivos" />
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>

              {file && <span className={styles.fileName}>{file.name}</span>}

              <VideoChat
                userId={userIdLogado}
                selectedUserId={destinatario?.id}
                userName={userName}
              />
            </div>
          </div>

          <ul className={styles.messages}>
            {messages
             .filter((message) => {
              console.log("📨 Filtro de mensagens:", {
                userId,
                destinatarioId: destinatario?.id,
                msgUserId: message.userId,
                msgDestinatarioId: message.destinatarioId
              });
        
              return (
                (message.userId === userId &&
                  message.destinatarioId === destinatario?.id) ||
                (message.userId === destinatario?.id &&
                  message.destinatarioId === userId)
              );
            })
              .map((message, index) => (
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
                          <button
                            onClick={() => deleteMessage(index, message.id)}
                          >
                            Excluir
                          </button>
                          <button
                            onClick={() => setEditingMessageId(message.id)}
                          >
                            Editar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {editingMessageId === message.id ? (
                    <div className={styles.editContainer}>
                      <input
                        type="text"
                        value={editedText || ""}
                        onChange={(e) => setEditedText(e.target.value)}
                      />
                      <button
                        onClick={() => updateMessage(message.id, editedText)}
                      >
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
                      ) : message.tipoMidia === "pdf" ? (
                        <div className={styles.pdfContainer}>
                          <div className={styles.pdfHeader}>
                            <span className={styles.pdfIcon}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="40"
                                height="40"
                                viewBox="0 0 64 64"
                              >
                                <defs>
                                  <linearGradient
                                    id="grad"
                                    x1="0%"
                                    y1="0%"
                                    x2="100%"
                                    y2="100%"
                                  >
                                    <stop
                                      offset="0%"
                                      style={{
                                        stopColor: "#f44336",
                                        stopOpacity: 1,
                                      }}
                                    />
                                    <stop
                                      offset="100%"
                                      style={{
                                        stopColor: "#c62828",
                                        stopOpacity: 1,
                                      }}
                                    />
                                  </linearGradient>
                                </defs>
                                <g>
                                  <path
                                    d="M8 4h32l16 16v40c0 2.2-1.8 4-4 4H8c-2.2 0-4-1.8-4-4V8c0-2.2 1.8-4 4-4z"
                                    fill="url(#grad)"
                                  />
                                  <path d="M40 4v16h16L40 4z" fill="#e57373" />
                                  <text
                                    x="14"
                                    y="50"
                                    fontSize="18"
                                    fontWeight="bold"
                                    fill="white"
                                    fontFamily="Arial, sans-serif"
                                  >
                                    PDF
                                  </text>
                                </g>
                              </svg>
                            </span>

                            <span className={styles.pdfLabel}>
                              Visualização do PDF
                            </span>
                          </div>

                          <div className={styles.pdfBox}>
                            <iframe
                              src={message.conteudo}
                              title="Visualizador de PDF"
                              className={styles.pdfIframe}
                              frameBorder="0"
                            ></iframe>
                          </div>

                          <a
                            href={message.conteudo}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.pdfDownload}
                          >
                            📥 Baixar PDF
                          </a>
                        </div>
                      ) : (
                        <p className={styles.iconEcheckList}>
                          {message.conteudo}
                          {message.userId === userId && (
                            <span className={styles.statusIcon}>
                              {renderStatusIcon(message.status)}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  )}
                </li>
              ))}
            <div ref={messagesEndRef} />
          </ul>

          <form className={styles.form} onSubmit={sendMessage}>
            <span
              type="button"
              className={styles.emojiButton}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <MdEmojiEmotions />
            </span>

            {showEmojiPicker && <EmojiPicker onSelect={handleEmojiSelect} />}

            <input
              disabled={!destinatario}
              className={styles.input}
              type="text"
              autoComplete="off"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                destinatario
                  ? "Digite uma mensagem..."
                  : "Selecione um usuário para começar a conversar"
              }
            />

            {!newMessage && !file ? (
              <span
                className={styles.chat_microfone}
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? <MdStop color="red" /> : <MdMic />}
              </span>
            ) : (
              <button className={styles.chat_button} type="submit">
                <MdArrowRight />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;