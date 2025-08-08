import { createContext, useContext, useState } from "react";

const CryptoContext = createContext();

export function CryptoProvider({ children }) {
  const [signingPrivateKey, setSigningPrivateKey] = useState(null);
  const [encryptionPrivateKey, setEncryptionPrivateKey] = useState(null);

  return (
    <CryptoContext.Provider
      value={{
        signingPrivateKey,
        setSigningPrivateKey,
        encryptionPrivateKey,
        setEncryptionPrivateKey,
      }}
    >
      {children}
    </CryptoContext.Provider>
  );
}

// Hook para acesso fácil
export function useCrypto() {
  const context = useContext(CryptoContext);
  if (!context) {
    throw new Error("useCrypto deve ser usado dentro de um CryptoProvider");
  }

  return context;
}
