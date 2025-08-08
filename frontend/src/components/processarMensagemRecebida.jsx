 const base64ToArrayBuffer = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};


export const processarMensagemRecebida = async ({
  mensagem,
  userId,
  destinatarioAtual,
  encryptionPrivateKey,
  setMessages,
  socket,
  getPublicKeyFromUser,
  decryptSessionKey,
  decryptMessage,
  playNotificationSound,
  setUnreadCounts,
}) => {
  const isRelevant =
    (mensagem.userId === userId && mensagem.destinatarioId === destinatarioAtual?.id) ||
    (mensagem.userId === destinatarioAtual?.id && mensagem.destinatarioId === userId);

  const isCurrentChatActive =
    destinatarioAtual && mensagem.userId === destinatarioAtual.id;

  if (mensagem.userId !== userId) {
    playNotificationSound();
  }

  if (!isRelevant) {
    setUnreadCounts((prev) => ({
      ...prev,
      [mensagem.userId]: (prev[mensagem.userId] || 0) + 1,
    }));
    return;
  }

  try {
    console.group("🔒 Processo de descriptografia");

    const {
      conteudo,
      encryptedSessionKey,
      userId: remetenteId,
      encryptionIV: iv,
      signature,
    } = mensagem;

    if (mensagem.destinatarioId !== userId || !encryptedSessionKey) {
      console.warn("⛔ Mensagem ignorada (chave ausente ou destinatário errado):", mensagem);
      return;
    }

    const aesKey = await decryptSessionKey(encryptionPrivateKey, encryptedSessionKey);

    if (signature) {
      const publicKey = await getPublicKeyFromUser(remetenteId);
      const isValid = await crypto.subtle.verify(
        { name: "RSASSA-PKCS1-v1_5" },
        publicKey,
        base64ToArrayBuffer(signature),
        base64ToArrayBuffer(conteudo)
      );
      if (!isValid) {
        console.warn("🚫 Assinatura inválida.");
        return;
      }
    }

    const plainText = await decryptMessage({ conteudo, encryptionIV: iv, aesKey });

    if (!plainText) return;

    setMessages((prev) => {
      const exists = prev.some((m) => m.id === mensagem.id);
      if (exists) return prev;
      const updated = [...prev, { ...mensagem, plainText }];
      return updated.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });

    if (isCurrentChatActive) {
      socket.emit("marcar_como_lida", {
        mensagemId: mensagem.id,
        usuarioId: userId,
      });
    }
  } catch (err) {
    console.error("Erro ao processar mensagem:", err);
  } finally {
    console.groupEnd();
  }
};