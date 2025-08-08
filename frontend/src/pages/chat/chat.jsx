import styles from "../../components/chat.module.css";
import io from "socket.io-client";

import { useEffect, useState, useRef, useMemo } from "react";
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

<<<<<<< Updated upstream
<<<<<<< Updated upstream
// import decryptePrivateKey from '../../components/decryptePrivateKey'

import forge from 'node-forge';
=======
import { useCrypto } from "../../components/CryptoContext";
// import { useSocket } from "../../components/SocketProvider";
// import { useInitializedSocket } from "../../components/useInitializedSocket";
>>>>>>> Stashed changes

// import decryptePrivateKey from '../../components/decryptePrivateKey'

import {
  generateAESKey,
  encryptWithAES,
  exportKeyToBase64,
  encryptWithPublicKey,
  checkExistingSessionKey,
  storeSessionKeyLocally,
  getLocalSessionKey,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  decryptSessionKey,
  getPublicKeyFromUser,
  decryptMessage,
  decryptOwnMessage,
  decryptWithAES,
  decryptWithPrivateKey,
  importKeyFromBase64,
  decryptPrivateKey,
  importRSAPrivateKey,
} from "../../components/criptografia";

<<<<<<< Updated upstream
const socket = io(`${window.location.protocol}//localhost:5000`, {
  transports: ['websocket','polling'],
  secure:true
});

=======
//import UserPanel from "../../components/userPainel"; // ajuste o caminho conforme seu projeto
>>>>>>> Stashed changes
=======
import { useCrypto } from "../../components/CryptoContext";
// import { useSocket } from "../../components/SocketProvider";
// import { useInitializedSocket } from "../../components/useInitializedSocket";

// import decryptePrivateKey from '../../components/decryptePrivateKey'

import {
  generateAESKey,
  encryptWithAES,
  exportKeyToBase64,
  encryptWithPublicKey,
  checkExistingSessionKey,
  storeSessionKeyLocally,
  getLocalSessionKey,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  decryptSessionKey,
  getPublicKeyFromUser,
  decryptMessage,
  decryptOwnMessage,
  decryptWithAES,
  decryptWithPrivateKey,
  importKeyFromBase64,
  decryptPrivateKey,
  importRSAPrivateKey,
} from "../../components/criptografia";

//import UserPanel from "../../components/userPainel"; // ajuste o caminho conforme seu projeto
>>>>>>> Stashed changes

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
  const navigate = useNavigate();

  const [userIdLogado, setUserIdLogado] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [usuarioCarregado, setUsuarioCarregado] = useState(false);
  const [prontoParaInicializar, setProntoParaInicializar] = useState(false);
  const [destinatario, setDestinatario] = useState(null);
  const [connected, setConnected] = useState(false);

<<<<<<< Updated upstream
<<<<<<< Updated upstream
  const socketRef = useRef(socket); // Usando useRef para manter a referência do socket
  const privateKeyRef = useRef(null);

    // 🔐 Carrega e armazena a chave privada no ref
    // useEffect(() => {
    //   const token = sessionStorage.getItem('token');
    //   decryptePrivateKey(token).then((key) => {
    //     if (key) privateKeyRef.current = key;
    //   });
    // }, []);

  socketRef.current.on("connect", () => {
    console.log("Socket conectado com HTTPS");
  });
  
=======
=======
>>>>>>> Stashed changes
  const {
    encryptionPrivateKey,
    setEncryptionPrivateKey,
    signingPrivateKey,
    setSigningPrivateKey,
  } = useCrypto();
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

  useEffect(() => {
  if (!currentUser?.id) return;

  const destinatarioSalvo = localStorage.getItem(`destinatario_${currentUser.id}`);
  if (destinatarioSalvo) {
    try {
      const parsed = JSON.parse(destinatarioSalvo);
      setDestinatario(parsed);
    } catch (err) {
      console.error("❌ Falha ao restaurar destinatário:", err);
    }
  }
}, [currentUser?.id]);


  const destinatarioRef = useRef(null);
  const socketRef = useRef();

  function clearAllSessionKeys() {
    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith("sessionKey_") &&
        !key.match(/^sessionKey_[0-9a-f-]+$/)
      ) {
        console.log("🚫 Removendo chave inválida:", key);
        localStorage.removeItem(key);
      }
    });
  }

  useEffect(() => {
    clearAllSessionKeys();
  }, []);

  // emoji
  const handleEmojiSelect = (emoji) => {
    setNewMessage((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const [historicoPorDestinatario, setHistoricoPorDestinatario] = useState({});
  console.log("🧠 Historico atual:", historicoPorDestinatario);

   // Funcão auxiliar
  const gerarEncryptionKeyId = (userIdA, userIdB) => {
    return [userIdA, userIdB].sort().join("-");
  };

 const chaveConversa = useMemo(() => {
  if (!userIdLogado || !destinatario?.id) return null;
  return gerarEncryptionKeyId(userIdLogado, destinatario.id);
}, [userIdLogado, destinatario?.id]);
<<<<<<< Updated upstream


<<<<<<< Updated upstream
  //✅ O que isso faz:
  //Recupera o destinatario salvo.
  
 // Verifica se ele ainda está na lista de usuarios recebidos do backend.
  
 // Se sim, usa o destinatário.
  
 // Se não, limpa o localStorage e evita erro no backend.


  useEffect(() => {
    if (userIdLogado && user.length > 0) {
      const destinatarioSalvo = localStorage.getItem("destinatario");
      if (destinatarioSalvo) {
        const parsedDest = JSON.parse(destinatarioSalvo);
        const aindaExiste = user.some(u => u.id === parsedDest.id);
        if (aindaExiste) {
          setDestinatario(parsedDest);
        } else {
          console.warn("⚠️ Destinatário salvo não encontrado na lista de usuários.");
          localStorage.removeItem("destinatario");
          setDestinatario(null);
        }
      }
    }
  }, [userIdLogado, user]);
  
=======
  const mensagensAtuais = useMemo(() => {
    if (!chaveConversa) return [];
    return historicoPorDestinatario[chaveConversa] || [];
  }, [chaveConversa, historicoPorDestinatario]);

  /** ==========================
   *  Gerenciar usuário logado 
   * Responsabilidade: Recuperar usuário da sessão e redirecionar se não estiver logado.
  👍 Bem feito: Leitura única, navigate("/") previne acesso não autenticado.
   *  ==========================
   */
  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setCurrentUser(parsedUser);
      setUserIdLogado(parsedUser.id);
      setUsuarioCarregado(true);
      setProntoParaInicializar(true);

      // Tenta restaurar último destinatário do localStorage
      const userData = JSON.parse(
        localStorage.getItem(`userData_${parsedUser.id}`)
      );
      const ultimoContato = userData?.contacts
        ? Object.values(userData.contacts)[0]
        : null;
      if (ultimoContato) setDestinatario(ultimoContato);

      const senha = sessionStorage.getItem("senhaDeDesbloqueio");

      // Restaurar chave de descriptografia
      const {
        encryptedEncryptionPrivateKey,
        encryptionIv,
        encryptionSalt,
        encryptedSigningPrivateKey,
        signingIv,
        signingSalt,
      } = parsedUser;

      if (
        encryptedEncryptionPrivateKey &&
        encryptionIv &&
        encryptionSalt &&
        senha
      ) {
        decryptPrivateKey(
          encryptedEncryptionPrivateKey,
          senha,
          encryptionIv,
          encryptionSalt
        )
          .then(async (keyBuffer) => {
            const chaveImportada = await window.crypto.subtle.importKey(
              "pkcs8",
              keyBuffer,
              { name: "RSA-OAEP", hash: "SHA-256" },
              true,
              ["decrypt"]
            );
            setEncryptionPrivateKey(chaveImportada);
          })
          .catch((err) => {
            console.error("❌ Falha ao restaurar encryptionPrivateKey:", err);
          });
      }
>>>>>>> Stashed changes
=======


  const mensagensAtuais = useMemo(() => {
    if (!chaveConversa) return [];
    return historicoPorDestinatario[chaveConversa] || [];
  }, [chaveConversa, historicoPorDestinatario]);

  /** ==========================
   *  Gerenciar usuário logado 
   * Responsabilidade: Recuperar usuário da sessão e redirecionar se não estiver logado.
  👍 Bem feito: Leitura única, navigate("/") previne acesso não autenticado.
   *  ==========================
   */
  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setCurrentUser(parsedUser);
      setUserIdLogado(parsedUser.id);
      setUsuarioCarregado(true);
      setProntoParaInicializar(true);

      // Tenta restaurar último destinatário do localStorage
      const userData = JSON.parse(
        localStorage.getItem(`userData_${parsedUser.id}`)
      );
      const ultimoContato = userData?.contacts
        ? Object.values(userData.contacts)[0]
        : null;
      if (ultimoContato) setDestinatario(ultimoContato);

      const senha = sessionStorage.getItem("senhaDeDesbloqueio");

      // Restaurar chave de descriptografia
      const {
        encryptedEncryptionPrivateKey,
        encryptionIv,
        encryptionSalt,
        encryptedSigningPrivateKey,
        signingIv,
        signingSalt,
      } = parsedUser;

      if (
        encryptedEncryptionPrivateKey &&
        encryptionIv &&
        encryptionSalt &&
        senha
      ) {
        decryptPrivateKey(
          encryptedEncryptionPrivateKey,
          senha,
          encryptionIv,
          encryptionSalt
        )
          .then(async (keyBuffer) => {
            const chaveImportada = await window.crypto.subtle.importKey(
              "pkcs8",
              keyBuffer,
              { name: "RSA-OAEP", hash: "SHA-256" },
              true,
              ["decrypt"]
            );
            setEncryptionPrivateKey(chaveImportada);
          })
          .catch((err) => {
            console.error("❌ Falha ao restaurar encryptionPrivateKey:", err);
          });
      }
>>>>>>> Stashed changes

      if (encryptedSigningPrivateKey && signingIv && signingSalt && senha) {
        decryptPrivateKey(
          encryptedSigningPrivateKey,
          senha,
          signingIv,
          signingSalt
        )
          .then(async (keyBuffer) => {
            const chaveImportada = await window.crypto.subtle.importKey(
              "pkcs8",
              keyBuffer,
              { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
              true,
              ["sign"]
            );
            setSigningPrivateKey(chaveImportada);
          })
          .catch((err) => {
            console.error("❌ Falha ao restaurar signingPrivateKey:", err);
          });
      }
    } else {
      navigate("/");
    }
  }, []);
<<<<<<< Updated upstream

  // Restaurar destinatário salvo e solicitar histórico
  // Responsabilidade: Restaurar destinatário do sessionStorage e buscar histórico.
  //👍 Bem colocado: Usa currentUser.id como trigger e evita erro com try/catch

<<<<<<< Updated upstream
  

  // ✅ No frontend:
  // Ao conectar ou reconectar, o cliente deve SEMPRE reenviar o register:
=======
>>>>>>> Stashed changes
=======

  // Restaurar destinatário salvo e solicitar histórico
  // Responsabilidade: Restaurar destinatário do sessionStorage e buscar histórico.
  //👍 Bem colocado: Usa currentUser.id como trigger e evita erro com try/catch

>>>>>>> Stashed changes
  useEffect(() => {
    if (currentUser?.id) {
      const destinatarioSalvo = sessionStorage.getItem(
        `destinatario_${currentUser.id}`
      );
      if (destinatarioSalvo) {
        try {
          const destinatarioObj = JSON.parse(destinatarioSalvo);
          console.log("🔎 destinatario restaurado:", destinatarioObj);

          setDestinatario(destinatarioObj);
          destinatarioRef.current = destinatarioObj;
          console.log("Destinatário restaurado:", destinatarioObj);

          // 🔥 Solicita o histórico imediatamente após restaurar
          if (socketRef.current) {
            console.log(
              "🔄 Solicitando histórico após restaurar destinatário:",
              destinatarioObj.id
            );
            socketRef.current.emit("requestMessages", {
              withUserId: destinatarioObj.id,
            });
          }
        } catch (err) {
          console.error("Erro ao restaurar destinatário:", err);
        }
      }
    }
  }, [currentUser?.id]);

  // Salvar destinatário sempre que mudar
  // Responsabilidade: Persistir mudanças no destinatário.
  //👍 Boa prática: Garante que o estado do app sobreviva a recarregamentos
  useEffect(() => {
    if (currentUser?.id && destinatario) {
      sessionStorage.setItem(
        `destinatario_${currentUser.id}`,
        JSON.stringify(destinatario)
      );
    }
  }, [destinatario, currentUser?.id]);

  //  Sincronizar o destinatarioRef com o estado atual
  // Responsabilidade: Garantir que destinatarioRef sempre aponte para o estado mais recente.
  //👍 Importante: Fundamental para eventos em tempo real que não se beneficiam de re-renderizações.
  useEffect(() => {
    destinatarioRef.current = destinatario;
  }, [destinatario]);

<<<<<<< Updated upstream
<<<<<<< Updated upstream
  // 💡 Explicando a lógica:
  // message.destinatarioId === userId: a mensagem é para mim.

  // message.userId !== userId: eu não sou quem enviou (ou seja, recebi).

  // Isso evita tocar o som por mensagens enviadas por mim (até mesmo em outra aba).

  // 🎯 Lógica principal de recepção + descriptografia
=======
=======
>>>>>>> Stashed changes
  /** ==========================
   *  Inicializar Socket
   *  ==========================
   */
  console.log("🧪 Inicializando socket para", userIdLogado);
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  useEffect(() => {
    const socket = io(`${window.location.protocol}//localhost:5000`, {
      transports: ["websocket", "polling"],
      secure: true,
    });

    socketRef.current = socket;

    const handleConnect = () => {
       console.log("✅ Socket conectado no frontend");
      setConnected(true); // <-- ADICIONE ISSO
      socket.emit("register", userIdLogado);
    };

    const handleDisconnect = () => {
      console.log("🔌 Socket desconectado");
      setConnected(false); // <-- ADICIONE ISSO
    };
<<<<<<< Updated upstream

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on("connect", handleConnect);
    }

    socket.on("disconnect", handleDisconnect);

<<<<<<< Updated upstream
      const isRelevant =
        (newMessage.userId === userId &&
          newMessage.destinatarioId === destinatarioAtual?.id) ||
        (newMessage.userId === destinatarioAtual?.id &&
          newMessage.destinatarioId === userId);

      const isCurrentChatActive =
        destinatarioAtual && newMessage.userId === destinatarioAtual.id;

      if (newMessage.userId !== userId) {
        playNotificationSound();
      }

      // ✅ Descriptografar se for relevante
      if (isRelevant) {
        // Descriptografia 🔐
        try {
          const privateKey = privateKeyRef.current;
          console.log('chave-privada:',privateKey)

          if (!privateKey) {
            console.warn("🔒 Chave privada ainda não carregada");
            return;
          }

          // 1. Descriptografa a sessionKey (com RSA)
          const sessionKeyBytes = privateKey.decrypt(
            forge.util.decode64(newMessage.encryptedSessionKey),
            'RSA-OAEP'
          );

          // 2. Cria a chave simétrica AES
          const aesKey = forge.util.createBuffer(sessionKeyBytes, 'raw');
          console.log('aesKey:',aesKey)

          // 3. Descriptografa o conteúdo da mensagem (com AES)
          const decipher = forge.cipher.createDecipher('AES-CBC', aesKey);
          const iv = forge.util.decode64(newMessage.iv); // Vem da mensagem
          decipher.start({ iv });
          decipher.update(forge.util.createBuffer(forge.util.decode64(newMessage.content)));
          const pass = decipher.finish();

          if (pass) {
            newMessage.content = decipher.output.toString();
            console.log("🔓 Mensagem descriptografada:", newMessage.content);
          } else {
            console.warn("❌ Falha na descriptografia AES");
          }

        } catch (err) {
          console.error("❌ Erro ao descriptografar mensagem:", err);
        }

        // Evita duplicatas
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === newMessage.id);
          return exists ? prev : [...prev, newMessage];
        });

        if (isCurrentChatActive) {
          socket.emit("marcarMensagemComoLida", {
            mensagemId: newMessage.id,
            usuarioId: userId,
          });

          console.log("📘 Marcar como lida:", newMessage.id);
=======
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect();
    };
  }, [userIdLogado]);

 

  /** ==========================
   *  Receber mensagens privadas - destinatario
   *  ==========================
   */
useEffect(() => {
  const socket = socketRef.current;

  console.group("🧩 [useEffect] Iniciando escuta de mensagens socket");
  console.log("🧑‍💻 userIdLogado:", userIdLogado);
  console.log("🎯 destinatario:", destinatario);
  console.log("📡 socket conectado:", !!socket);
  console.groupEnd();

  if (!userIdLogado || !destinatario) return;

  const handlePrivateMessage = async (mensagem) => {
    console.group("📥 Mensagem recebida via socket");
    console.log("🧾 Conteúdo da mensagem:", mensagem);

    const {
      id,
      conteudo,
      fromUserId,
      toUserId,
      encryptedSessionKey,
      encryptionKeyId,
      encryptionIV,
    } = mensagem;

    const souDestinatario = toUserId === userIdLogado;

    console.log("🧭 souDestinatario:", souDestinatario);
    console.log("🆔 fromUserId:", fromUserId);
    console.log("🆔 toUserId:", toUserId);
    console.log("🆔 userIdLogado:", userIdLogado);

    if (souDestinatario && (!encryptionPrivateKey || !encryptedSessionKey)) {
      console.error(
        "❌ Dados insuficientes para descriptografar a sessionKey.",
        {
          encryptionPrivateKey,
          encryptedSessionKey,
          userIdLogado,
          toUserId,
        }
      );
      return;
    }

    const chaveConversa = gerarEncryptionKeyId(fromUserId, toUserId);
    console.log("🔑 Chave de conversa gerada:", chaveConversa);

    try {
      console.log("🧩 ID da chave de sessão:", encryptionKeyId);
      console.log(
        "🔎 Buscando chave de sessão local:",
        "sessionKey_" + encryptionKeyId
      );

      let sessionKey = await getLocalSessionKey(encryptionKeyId);

      console.log("📦 sessionKey retornada de getLocalSessionKey:", sessionKey);

      if (!sessionKey) {
        console.log("🔐 encryptedSessionKey recebida:", encryptedSessionKey);

        if (!encryptedSessionKey || !encryptionKeyId || !encryptionPrivateKey) {
          console.warn("❌ Dados insuficientes para descriptografar a sessionKey.");
          throw new Error("Dados insuficientes");
>>>>>>> Stashed changes
        }
=======

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on("connect", handleConnect);
    }

    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect();
    };
  }, [userIdLogado]);

 

  /** ==========================
   *  Receber mensagens privadas - destinatario
   *  ==========================
   */
useEffect(() => {
  const socket = socketRef.current;

  console.group("🧩 [useEffect] Iniciando escuta de mensagens socket");
  console.log("🧑‍💻 userIdLogado:", userIdLogado);
  console.log("🎯 destinatario:", destinatario);
  console.log("📡 socket conectado:", !!socket);
  console.groupEnd();

  if (!userIdLogado || !destinatario) return;

  const handlePrivateMessage = async (mensagem) => {
    console.group("📥 Mensagem recebida via socket");
    console.log("🧾 Conteúdo da mensagem:", mensagem);

    const {
      id,
      conteudo,
      fromUserId,
      toUserId,
      encryptedSessionKey,
      encryptionKeyId,
      encryptionIV,
    } = mensagem;

    const souDestinatario = toUserId === userIdLogado;

    console.log("🧭 souDestinatario:", souDestinatario);
    console.log("🆔 fromUserId:", fromUserId);
    console.log("🆔 toUserId:", toUserId);
    console.log("🆔 userIdLogado:", userIdLogado);

    if (souDestinatario && (!encryptionPrivateKey || !encryptedSessionKey)) {
      console.error(
        "❌ Dados insuficientes para descriptografar a sessionKey.",
        {
          encryptionPrivateKey,
          encryptedSessionKey,
          userIdLogado,
          toUserId,
        }
      );
      return;
    }

    const chaveConversa = gerarEncryptionKeyId(fromUserId, toUserId);
    console.log("🔑 Chave de conversa gerada:", chaveConversa);

    try {
      console.log("🧩 ID da chave de sessão:", encryptionKeyId);
      console.log(
        "🔎 Buscando chave de sessão local:",
        "sessionKey_" + encryptionKeyId
      );

      let sessionKey = await getLocalSessionKey(encryptionKeyId);

      console.log("📦 sessionKey retornada de getLocalSessionKey:", sessionKey);

      if (!sessionKey) {
        console.log("🔐 encryptedSessionKey recebida:", encryptedSessionKey);

        if (!encryptedSessionKey || !encryptionKeyId || !encryptionPrivateKey) {
          console.warn("❌ Dados insuficientes para descriptografar a sessionKey.");
          throw new Error("Dados insuficientes");
        }
>>>>>>> Stashed changes

        const decryptedRawKey = await decryptWithPrivateKey(
          encryptionPrivateKey,
          encryptedSessionKey
        );

        sessionKey = await importKeyFromBase64(decryptedRawKey);

        const rawKeyBuffer = await window.crypto.subtle.exportKey("raw", sessionKey);
<<<<<<< Updated upstream
        console.log(
          "🔑 SessionKey Destinatario (importada):",
=======
        console.log(
          "🔑 SessionKey Destinatario (importada):",
          arrayBufferToBase64(rawKeyBuffer)
        );

        await storeSessionKeyLocally(encryptionKeyId, {
          rawKey: sessionKey,
          encryptedKey: encryptedSessionKey,
        });

        console.log("✅ Chave de sessão importada e salva.");
      } else {
        console.log("✅ Chave de sessão local encontrada.");

        const cryptoKey = sessionKey?.rawKey || sessionKey;

        if (!(cryptoKey instanceof CryptoKey)) {
          console.error("❌ sessionKey inválida ao exportar:", sessionKey);
          return;
        }

        const rawKeyBuffer = await window.crypto.subtle.exportKey("raw", cryptoKey);
        console.log(
          "🔑 SessionKey Destinatario (local):",
>>>>>>> Stashed changes
          arrayBufferToBase64(rawKeyBuffer)
        );
      }

<<<<<<< Updated upstream
        await storeSessionKeyLocally(encryptionKeyId, {
          rawKey: sessionKey,
          encryptedKey: encryptedSessionKey,
        });

        console.log("✅ Chave de sessão importada e salva.");
      } else {
<<<<<<< Updated upstream
        console.log("📨 Mensagem recebida mas ignorada (chat inativo):", newMessage);

        // ✅ Incrementa contador de mensagens não lidas
        setUnreadCounts((prev) => ({
          ...prev,
          [newMessage.userId]: (prev[newMessage.userId] || 0) + 1,
        }));
=======
        console.log("✅ Chave de sessão local encontrada.");

        const cryptoKey = sessionKey?.rawKey || sessionKey;

        if (!(cryptoKey instanceof CryptoKey)) {
          console.error("❌ sessionKey inválida ao exportar:", sessionKey);
          return;
        }

        const rawKeyBuffer = await window.crypto.subtle.exportKey("raw", cryptoKey);
        console.log(
          "🔑 SessionKey Destinatario (local):",
          arrayBufferToBase64(rawKeyBuffer)
        );
      }

      console.log("🔍 Verificando se conteudo é base64 válido:", conteudo);
      console.log("🧊 IV base64 recebido:", encryptionIV);

      const cryptoKey = sessionKey?.rawKey || sessionKey;

      if (!(cryptoKey instanceof CryptoKey)) {
        console.error("❌ sessionKey não é CryptoKey:", sessionKey);
        return;
>>>>>>> Stashed changes
      }

=======
      console.log("🔍 Verificando se conteudo é base64 válido:", conteudo);
      console.log("🧊 IV base64 recebido:", encryptionIV);

      const cryptoKey = sessionKey?.rawKey || sessionKey;

      if (!(cryptoKey instanceof CryptoKey)) {
        console.error("❌ sessionKey não é CryptoKey:", sessionKey);
        return;
      }

>>>>>>> Stashed changes
      console.log("🔎 cryptoKey:", cryptoKey);
      console.log("🔎 Tipo:", cryptoKey?.type);
      console.log("🔎 Algoritmo:", cryptoKey?.algorithm);
      console.log("🔎 Usages:", cryptoKey?.usages);
      console.log("🔎 Conteúdo base64:", conteudo);
      console.log("🔎 encryptionIV:", encryptionIV);

      const decryptedContent = await decryptWithAES(cryptoKey, conteudo, encryptionIV);

      if (!decryptedContent || !(decryptedContent instanceof ArrayBuffer)) {
        throw new Error("Conteúdo descriptografado inválido.");
      }

      const plainText = new TextDecoder().decode(decryptedContent);
      console.log("✅ Mensagem descriptografada:", plainText);

      console.log("📚 Atualizando histórico com nova mensagem");
      setHistoricoPorDestinatario((prev) => {
        const mensagensExistentes = prev[chaveConversa] || [];
        const jaExiste = mensagensExistentes.some((m) => m.id === id);
        if (jaExiste) {
          console.log("🔁 Mensagem já existia no histórico. Ignorando.");
          return prev;
        }

        console.log("➕ Adicionando nova mensagem ao histórico.");
        return {
          ...prev,
          [chaveConversa]: [
            ...mensagensExistentes,
            { ...mensagem, plainText },
          ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
        };
      });
    } catch (error) {
      console.error("❌ Erro ao processar mensagem recebida:", error);

      console.log("⚠️ Salvando mensagem como inválida (plainText null)");
      setHistoricoPorDestinatario((prev) => {
        const mensagensExistentes = prev[chaveConversa] || [];
        const jaExiste = mensagensExistentes.some((m) => m.id === id);
        if (jaExiste) return prev;
<<<<<<< Updated upstream

        return {
          ...prev,
          [chaveConversa]: [
            ...mensagensExistentes,
            { ...mensagem, plainText: null },
          ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
        };
      });
    }

    console.groupEnd();
  };

  socket.on("receivePrivateMessage", handlePrivateMessage);
  return () => {
    socket.off("receivePrivateMessage", handlePrivateMessage);
  };
}, [encryptionPrivateKey, signingPrivateKey, userIdLogado, destinatario]);

<<<<<<< Updated upstream
    return () => {
      socket.off("connect", reemitRegister);
      socket.off("receivePrivateMessage", handleReceiveMessage);
    };
  }, [userId]);
  
=======
>>>>>>> Stashed changes
=======

        return {
          ...prev,
          [chaveConversa]: [
            ...mensagensExistentes,
            { ...mensagem, plainText: null },
          ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
        };
      });
    }

    console.groupEnd();
  };

  socket.on("receivePrivateMessage", handlePrivateMessage);
  return () => {
    socket.off("receivePrivateMessage", handlePrivateMessage);
  };
}, [encryptionPrivateKey, signingPrivateKey, userIdLogado, destinatario]);

>>>>>>> Stashed changes

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
<<<<<<< Updated upstream

    const pronto =
      socket.connected &&
      userIdLogado &&
      destinatario?.id &&
      encryptionPrivateKey;

    if (!pronto) return;

=======

    const pronto =
      socket.connected &&
      userIdLogado &&
      destinatario?.id &&
      encryptionPrivateKey;

    if (!pronto) return;

>>>>>>> Stashed changes
    console.log("✅ Reativos: solicitando histórico");

    socket.emit("requestMessages", {
      fromUserId: userIdLogado,
      toUserId: destinatario.id,
    });
  }, [
    userIdLogado,
    destinatario?.id,
    encryptionPrivateKey,
    socketRef.current?.connected,
  ]);

  /** ==========================
   *  📥 Solicitar e receber histórico de mensagens
   *  ==========================
   */
  useEffect(() => {

     if (!userIdLogado || !destinatario?.id || !encryptionPrivateKey) return;

    const socket = socketRef.current;
    if (!socket) return;

    const solicitarMensagens = () => {
      const pronto =
        socket.connected &&
        userIdLogado &&
        destinatario?.id &&
        encryptionPrivateKey;

      if (!pronto) {
        console.warn("🚫 Dados insuficientes para solicitar mensagens.", {
          userId: userIdLogado,
          destinatarioId: destinatario?.id,
          connected: socket.connected,
        });
        return;
      }
<<<<<<< Updated upstream

      console.log(
        "🔍 Solicitando histórico de",
        userIdLogado,
        "para",
        destinatario?.id
      );

=======

      console.log(
        "🔍 Solicitando histórico de",
        userIdLogado,
        "para",
        destinatario?.id
      );

>>>>>>> Stashed changes
      socket.emit("requestMessages", {
        fromUserId: userIdLogado,
        toUserId: destinatario.id,
      });
    };

    const descriptografarMensagens = async (mensagens) => {
      const descriptografadas = [];

      for (const mensagem of mensagens) {
        const {
          conteudo,
          encryptedSessionKey,
          encryptionIV,
          originalPlainText,
          userId: remetenteId,
        } = mensagem;

        const souRemetente = remetenteId === userIdLogado;
        let plainText = null;

        const encryptionKeyId = gerarEncryptionKeyId(userIdLogado, remetenteId);



        try {
          if (souRemetente && originalPlainText) {
            plainText = originalPlainText;
          } else {
            let aesKey = await getLocalSessionKey(encryptionKeyId);

            if (!aesKey && encryptedSessionKey && encryptionPrivateKey) {
              aesKey = await decryptSessionKey(
                encryptedSessionKey,
                encryptionPrivateKey
              );
              await storeSessionKeyLocally(encryptionKeyId, {
                rawKey: aesKey,
                encryptedKey: encryptedSessionKey,
              });
            }

            console.log("🔐 Tentando descriptografar com chave AES:", aesKey);
console.log("🧾 Conteúdo:", conteudo);
console.log("🧾 IV:", encryptionIV);

if (!(aesKey instanceof CryptoKey)) {
  console.error("❌ aesKey não é um CryptoKey válido!");
  return;
}
<<<<<<< Updated upstream


=======


>>>>>>> Stashed changes
            if (aesKey && encryptionIV && conteudo) {
              plainText = await decryptMessage({
                conteudo,
                encryptionIV,
                aesKey,
              });
            }
          }
        } catch (err) {
          console.error(
            "❌ Falha ao descriptografar mensagem do histórico:",
            err
          );
        }

        descriptografadas.push({ ...mensagem, plainText });
      }

      return descriptografadas;
    };

    const handleLoadMessages = async (messages) => {
      if (!messages || messages.length === 0) return;

      const descriptografadas = await descriptografarMensagens(messages);

      const primeiro = descriptografadas[0];
      const chaveConversa = gerarEncryptionKeyId(
        primeiro.fromUserId,
        primeiro.toUserId
      );
<<<<<<< Updated upstream

      setHistoricoPorDestinatario((prev) => ({
        ...prev,
        [chaveConversa]: descriptografadas.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        ),
      }));
    };

    // Solicita imediatamente se o socket já estiver conectado
    if (socket.connected) {
      solicitarMensagens();
    } else {
      socket.on("connect", solicitarMensagens);
    }

    socket.on("loadMessages", handleLoadMessages);

=======

      setHistoricoPorDestinatario((prev) => ({
        ...prev,
        [chaveConversa]: descriptografadas.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        ),
      }));
    };

    // Solicita imediatamente se o socket já estiver conectado
    if (socket.connected) {
      solicitarMensagens();
    } else {
      socket.on("connect", solicitarMensagens);
    }

    socket.on("loadMessages", handleLoadMessages);

>>>>>>> Stashed changes
    return () => {
      socket.off("connect", solicitarMensagens);
      socket.off("loadMessages", handleLoadMessages);
    };
  }, [userIdLogado, destinatario?.id, encryptionPrivateKey]);

  /** ==========================
   *  Atualizar status "lida"
   *  ==========================
   */
  useEffect(() => {
    if (!destinatario?.id || !userIdLogado) return;
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;

    socket.emit("marcar_como_lida", {
      remetenteId: destinatario.id,
      destinatarioId: userIdLogado,
    });

    socket.emit("entrouNaConversa", {
      userId: userIdLogado,
      conversandoComId: destinatario.id,
    });
  }, [destinatario, userIdLogado]);

  /** ==========================
   *  Mensagens marcadas como lidas
   *  ==========================
   */
  /** ==========================
   *  🔔 Nova mensagem não lida
   *  ==========================
   */
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleNovaMensagemNaoLida = async ({ fromUserId, mensagem }) => {
      console.log("📩 Nova mensagem não lida de:", fromUserId, mensagem);
      console.log("🚨 Mensagem recebida via socket:", mensagem);
      console.log("🟦 Histórico antes:", historicoPorDestinatario);

      // Atualiza contador de não lidas
      setUnreadCounts((prev) => ({
        ...prev,
        [fromUserId]: (prev[fromUserId] || 0) + 1,
      }));

     const chaveConversa = gerarEncryptionKeyId(fromUserId, userIdLogado);


      // 🔓 Descriptografar o conteúdo
      let plainText = null;
      try {
        const sessionKey = await getLocalSessionKey(mensagem.encryptionKeyId);
        if (sessionKey) {
          plainText = await decryptWithAES(
            sessionKey?.rawKey || sessionKey,
            mensagem.conteudo,
            mensagem.encryptionIV
          );
        } else {
          console.warn(
            "⚠️ Chave de sessão ausente, mensagem não pode ser lida."
          );
        }
      } catch (err) {
        console.error("❌ Falha ao descriptografar mensagem:", err);
      }
      console.log("🔓 plainText:", plainText);

      setHistoricoPorDestinatario((prev) => {
        const mensagensExistentes = prev[chaveConversa] || [];
        const jaExiste = mensagensExistentes.some((m) => m.id === mensagem.id);
        if (jaExiste) return prev;

        return {
          ...prev,
          [chaveConversa]: [
            ...mensagensExistentes,
            { ...mensagem, plainText },
          ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
        };
      });

      playNotificationSound();
    };

    socket.on("nova_mensagem_nao_lida", handleNovaMensagemNaoLida);

    return () => {
      socket.off("nova_mensagem_nao_lida", handleNovaMensagemNaoLida);
    };
  }, [userIdLogado]);

  // 🔄 Resetar histórico ao trocar de usuário logado
  useEffect(() => {
    setHistoricoPorDestinatario({});
  }, [userIdLogado]);

  /** ==========================
   *  Scroll automático
   *  ==========================
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [destinatario?.id]);

  /** ==========================
   *  Enviar mensagem - remetente
   *  ==========================
   */

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!destinatario?.id || !userIdLogado) return;

    const socket = socketRef.current;
    if (!socket) {
      console.warn("⚠️ Socket não está disponível no momento.");
      return;
    }

    if (!newMessage.trim()) return;

    try {
      const encryptionKeyId = gerarEncryptionKeyId(
        userIdLogado,
        destinatario.id
      );

      let sessionKey;
      let encryptedSessionKey;
      const localSessionKey = await getLocalSessionKey(encryptionKeyId);
<<<<<<< Updated upstream

      if (localSessionKey) {
        console.log("✅ SessionKey encontrada localmente.");
        sessionKey = localSessionKey.rawKey;
        encryptedSessionKey = localSessionKey.encryptedKey;
      } else {
        console.log("🚀 Gerando nova SessionKey...");
        sessionKey = await generateAESKey();
        const exportedKey = await exportKeyToBase64(sessionKey);

=======

      if (localSessionKey) {
        console.log("✅ SessionKey encontrada localmente.");
        sessionKey = localSessionKey.rawKey;
        encryptedSessionKey = localSessionKey.encryptedKey;
      } else {
        console.log("🚀 Gerando nova SessionKey...");
        sessionKey = await generateAESKey();
        const exportedKey = await exportKeyToBase64(sessionKey);

>>>>>>> Stashed changes
        encryptedSessionKey = await encryptWithPublicKey(
          destinatario.publicKeys.encryption,
          exportedKey
        );
<<<<<<< Updated upstream

        await storeSessionKeyLocally(encryptionKeyId, {
          rawKey: sessionKey,
          encryptedKey: encryptedSessionKey,
        });
      }

      const { encryptedContent, encryptionIV } = await encryptWithAES(
        sessionKey,
        newMessage.trim()
      );

      const signatureBuffer = await crypto.subtle.sign(
        { name: "RSASSA-PKCS1-v1_5" },
        signingPrivateKey,
        base64ToArrayBuffer(encryptedContent)
      );

=======

        await storeSessionKeyLocally(encryptionKeyId, {
          rawKey: sessionKey,
          encryptedKey: encryptedSessionKey,
        });
      }

      const { encryptedContent, encryptionIV } = await encryptWithAES(
        sessionKey,
        newMessage.trim()
      );

      const signatureBuffer = await crypto.subtle.sign(
        { name: "RSASSA-PKCS1-v1_5" },
        signingPrivateKey,
        base64ToArrayBuffer(encryptedContent)
      );

>>>>>>> Stashed changes
      const signature = arrayBufferToBase64(signatureBuffer);
      const mensagemId = crypto.randomUUID();

      const messageData = {
        id: mensagemId,
        conteudo: encryptedContent,
        fromUserId: userIdLogado,
        toUserId: destinatario.id,
        encryptionIV,
        signature,
        encryptionKeyId,
        encryptedSessionKey,
        tipoMidia: "texto",
        timestamp: new Date().toISOString(),
      };

      // const chaveConversa = gerarEncryptionKeyId(userIdLogado, destinatario.id);

      // setHistoricoPorDestinatario((prev) => ({
      //   ...prev,
      //   [chaveConversa]: [
      //     ...(prev[chaveConversa] || []),
      //     {
      //       ...messageData,
      //       plainText: newMessage.trim(),
      //       user: { name: currentUser.name },
      //     },
      //   ],
      // }));

      console.log("✅ Emitindo socket com dados:", messageData);
      socket.emit("sendPrivateMessage", messageData);

      setNewMessage("");
    } catch (error) {
      console.error("❌ Erro no envio da mensagem:", error);
    }
  };

  const uploadFile = async (file, fileName, tipoMidia) => {
    const formData = new FormData();
    formData.append("file", file, fileName);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    formData.append("fromUserId", userId); // ✅ nome correto
    formData.append("toUserId", destinatario.id); // ✅ agora inclui o destinatário

    try {
      const response = await api.post("https://localhost:5000/upload", formData);
      socket.emit("sendPrivateMessage", {
=======
    formData.append("fromUserId", userIdLogado);
    formData.append("toUserId", destinatario.id);

    try {
      const response = await api.post("http://localhost:5000/upload", formData);
      socketRef.current?.emit("sendPrivateMessage", {
>>>>>>> Stashed changes
=======
    formData.append("fromUserId", userIdLogado);
    formData.append("toUserId", destinatario.id);

    try {
      const response = await api.post("http://localhost:5000/upload", formData);
      socketRef.current?.emit("sendPrivateMessage", {
>>>>>>> Stashed changes
        conteudo: response.data.midiaUrl,
        fromUserId: userIdLogado,
        toUserId: destinatario.id,
        tipoMidia,
      });
    } catch (error) {
      console.error("❌ Erro ao enviar arquivo:", error);
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
    if (isRecording) return;

    setIsRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

    mediaRecorderRef.current = mediaRecorder;
    const chunks = [];

    mediaRecorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      setIsRecording(false);
      const audioBlob = new Blob(chunks, { type: "audio/webm" });
      await uploadFile(audioBlob, "audio.webm", "audio");
    };

    mediaRecorder.start();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const [openMenuIndex, setOpenMenuIndex] = useState(null);

  const toggleMenu = (index) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  const updateMessage = async (messageId, newText) => {
    if (!newText.trim()) return;
    if (!messageId || !newText) {
      console.error("Erro: ID ou novo texto está indefinido.");
      return;
    }

    try {
      const response = await api.put(`/messages/update/${messageId}`, {
        novoConteudo: newText,
      });

      if (response.status === 200) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? { ...msg, conteudo: newText } : msg
          )
        );
        setEditingMessageId(null);
        setEditedText("");
      } else {
        console.error("❌ Erro ao atualizar mensagem");
      }
    } catch (error) {
      console.error(
        "❌ Erro ao se comunicar com o servidor:",
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
          console.error("❌ Erro ao excluir mensagem");
        }
      } catch (error) {
        console.error("❌ Erro ao se comunicar com o servidor:", error);
      }
    }
  };

  console.log("ID do usuário logado:", userIdLogado);
  console.log("currentUser", currentUser);

  // Evita que o componente renderize prematuramente
  if (!usuarioCarregado) {
    return <div>🔐 Carregando informações do usuário...</div>;
  }

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

  const obterClasseDaMensagem = (mensagem) => {
    const remetenteId = mensagem.fromUserId || mensagem.userId;
    return remetenteId === userIdLogado ? styles.sent : styles.received;
  };

  return (
    <div className={styles.container}>
      <div className={styles.chat_layout}>
        {/* Sidebar - Lista de usuários */}
        {currentUser && (
          <UserList
            onSelectUser={(user) => {
              if (user.id === currentUser.id) {
                setDestinatario(null);
                localStorage.removeItem(`destinatario_${currentUser.id}`);
                return;
              }

              localStorage.setItem(
                `destinatario_${currentUser.id}`,
                JSON.stringify(user)
              );
              setDestinatario(user);

              setUnreadCounts((prev) => {
                const newCounts = { ...prev };
                delete newCounts[user.id];
                return newCounts;
              });
            }}
            userIdLogado={currentUser.id}
            selectedUserId={destinatario?.id}
            destinatario={destinatario}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            unreadCounts={unreadCounts}
          />
        )}

        {/* Chat principal */}
        <div className={styles.chat_content}>
          {/* Header do chat */}
          <div className={styles.chat_header}>
            <span className={styles.userName}>
              <img
                className={styles.user_avatar}
                src={
                  destinatario?.avatar?.startsWith("http")
                    ? destinatario.avatar
                    : `https://localhost:5000${destinatario?.avatar}`
                }
                alt="avatar do usuario"
                onError={(e) => {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
                  e.target.src = "https://thumbs.dreamstime.com/b/%C3%ADcone-de-perfil-avatar-padr%C3%A3o-imagem-usu%C3%A1rio-m%C3%ADdia-social-210115353.jpg";
                }}
              />

              {destinatario?.name || "desconhecido"}
=======
=======
>>>>>>> Stashed changes
                  e.target.src =
                    "https://thumbs.dreamstime.com/b/%C3%ADcone-de-perfil-avatar-padr%C3%A3o-imagem-usu%C3%A1rio-m%C3%ADdia-social-210115353.jpg";
                }}
              />
              {destinatario?.name || "Desconhecido"}
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
            </span>

            <div className={styles.headerActions}>
              <label className={styles.uploadButton}>
                <MdFileUpload title="Upload de arquivos" />
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>
              {file && <span className={styles.fileName}>{file.name}</span>}

              <VideoChat
                userId={userIdLogado}
                selectedUserId={destinatario?.id}
              />
            </div>
          </div>

          {/* Lista de mensagens */}
          <ul className={styles.messages}>
            {mensagensAtuais.length === 0 && <p>Nenhuma mensagem</p>}
            {mensagensAtuais.map((message, index) => (
              <li key={message.id} className={obterClasseDaMensagem(message)}>
                <div className={styles.messageHeader}>
                  <div>
                    {message.user?.name && (
                      <strong>{message.user.name}</strong> // apenas o nome
                    )}
                    {/* <div>
                      {message.plainText || "Mensagem não pôde ser lida."}
                    </div> */}
                  </div>

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
                        <button onClick={() => setEditingMessageId(message.id)}>
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
                          <span className={styles.pdfIcon}>📄</span>
                          <span className={styles.pdfLabel}>
                            Visualização do PDF
                          </span>
                        </div>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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

                      {/* 🕓 Hora da mensagem */}
                      <div className={styles.messageTime}>
                        {formatTime(message.timestamp)}
                      </div>
=======
=======
>>>>>>> Stashed changes
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
                        {message.plainText || message.conteudo}
                        {message.userId === userIdLogado && (
                          <span className={styles.statusIcon}>
                            {renderStatusIcon(message.status)}
                          </span>
                        )}
                      </p>
                    )}

                    <div className={styles.messageTime}>
                      {formatTime(message.timestamp)}
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
                    </div>
                  </div>
                )}
              </li>
            ))}
            <div ref={messagesEndRef} />
          </ul>

          {/* Formulário de envio */}
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
