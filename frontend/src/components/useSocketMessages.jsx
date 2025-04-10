import { useEffect } from "react";

export function useSocketMessages(socket, userId, selectedUser, setMessages) {
  useEffect(() => {
    if (!selectedUser) return;

    // Emitir evento para buscar mensagens antigas
    socket.emit("requestMessages", {
      fromUserId: userId,
      toUserId: selectedUser.id,
    });

    // Handlers
    const handleLoadMessages = (messages) => setMessages(messages);

    const handleReceiveMessage = (message) => {
      const isMessageForThisChat =
        (message.userId === userId && message.destinatarioId === selectedUser.id) ||
        (message.userId === selectedUser.id && message.destinatarioId === userId);


// recebe as mensagens em tempo real
      if (isMessageForThisChat) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    };

    // recebe as mensagens iniciais
    socket.on("loadMessages", handleLoadMessages);
    socket.on("receiveMessage", handleReceiveMessage);

    // Limpa ao desmontar ou mudar o usuário selecionado
    return () => {
      socket.off("loadMessages", handleLoadMessages);
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [socket, userId, selectedUser, setMessages]);
}
