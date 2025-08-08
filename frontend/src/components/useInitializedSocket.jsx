import { useEffect, useState } from "react";
import { useSocket } from "./SocketProvider"; // ajuste o caminho se necessário

export const useInitializedSocket = (userId, encryptionPrivateKey) => {
  const { socket } = useSocket();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (socket && userId && encryptionPrivateKey) {
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  }, [socket, userId, encryptionPrivateKey]);

  return { socket, isReady };
};
