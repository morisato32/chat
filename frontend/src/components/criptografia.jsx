// utils/cryptoUtils.js

// AES-GCM
const AES_ALGO = "AES-GCM";
const AES_KEY_LENGTH = 256; // bits
const AES_IV_LENGTH = 12; // bytes = 96 bits

// RSA-OAEP
const RSA_ALGO = {
  name: "RSA-OAEP",
  hash: "SHA-256",
};

// =======================
// 🔐 AES Functions
// =======================

// Gera nova chave AES-GCM
export async function generateAESKey() {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  console.log("🔑 CryptoKey gerada:", key);

  return key; // ✅ AGORA SIM ELA PODE SER USADA DEPOIS
}

// Exporta chave AES para base64 (para ser criptografada)
// Mais segura e compatível para exportar chaves grandes
export async function exportKeyToBase64(key) {
  console.log("📦 Recebido para exportação:", key);

  if (!(key instanceof CryptoKey)) {
    throw new Error("❌ Objeto passado não é uma CryptoKey válida");
  }

  const raw = await crypto.subtle.exportKey("raw", key);
  const bytes = new Uint8Array(raw);

  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}


// Importa chave AES de base64
export async function importAESKeyFromBase64(base64Key) {
  const binary = Uint8Array.from(atob(base64Key), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "raw",
    binary,
    { name: "AES-GCM" }, // garantido que está correto
    true,
    ["encrypt", "decrypt"]
  );
}

// Criptografa com AES-GCM
export async function encryptWithAES(key, message) {
  const encoder = new TextEncoder();  // ✅ Converte string para Uint8Array
  const data = encoder.encode(message); // ✅ Codifica mensagem
  const iv = crypto.getRandomValues(new Uint8Array(12)); // ✅ GCM requer IV de 12 bytes

  const encrypted = await crypto.subtle.encrypt(   // ✅ Criptografa com AES-GCM
    { name: "AES-GCM", iv },
    key,
    data
  );

  return {
    encryptedContent: arrayBufferToBase64(encrypted),  // ✅ Converte para Base64 para envio
     encryptionIV: arrayBufferToBase64(iv),  // ✅ IV também convertido para Base64
  };
}

// export async function decryptWithAES(key, encryptedBase64, ivBase64) {
//   try {
//     // Converte base64 para ArrayBuffer
//     const encryptedArrayBuffer = base64ToArrayBuffer(encryptedBase64);
//     const iv = base64ToArrayBuffer(ivBase64);

//     // Descriptografa com AES-GCM
//     const decrypted = await window.crypto.subtle.decrypt(
//       { name: "AES-GCM", iv },
//       key,
//       encryptedArrayBuffer
//     );

//     return decrypted; // ArrayBuffer (deve ser convertido com TextDecoder se quiser string)
//   } catch (e) {
//     console.error("❌ Erro na descriptografia AES:", e);
//     console.log("🔍 encryptedBase64:", encryptedBase64);
//     console.log("🔍 ivBase64:", ivBase64);
//     return null;
//   }
// }

export const decryptWithAES = async (aesKey, conteudo, iv) => {
  if (!(aesKey instanceof CryptoKey)) {
    console.error("❌ aesKey não é um CryptoKey válido!", aesKey);
    throw new Error("Chave AES inválida");
  }

  try {
    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: base64ToArrayBuffer(iv),
      },
      aesKey,
      base64ToArrayBuffer(conteudo)
    );

    return decryptedContent;
  } catch (err) {
    console.error("❌ Erro ao descriptografar conteúdo AES:", err);
    throw err;
  }
};



 



// =======================
// 🔒 RSA Functions
// =======================

// Importa chave pública RSA (PEM para CryptoKey)
export async function importRSAPublicKey(pem) {
  const b64 = pem.replace(
    /-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\n/g,
    ""
  );
  const binary = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("spki", binary, RSA_ALGO, true, ["encrypt"]);
}

// Importa chave privada RSA (PEM para CryptoKey)
export async function importRSAPrivateKey(pem) {
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = pem
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s+/g, "");
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  return await crypto.subtle.importKey(
    "pkcs8",
    binaryDer.buffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["decrypt"]
  );
}


// Importa chave privada para assinatura (RSASSA-PKCS1-v1_5)
export async function importRSASigningPrivateKey(pem) {
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = pem
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s+/g, "");
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  return await crypto.subtle.importKey(
    "pkcs8",
    binaryDer.buffer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );
}


// Criptografa uma chave de sessão (AES) com a chave pública RSA
export async function encryptWithPublicKey(publicKeyPem, base64SessionKey) {
  const publicKey = await importRSAPublicKey(publicKeyPem);
  const sessionKeyBytes = Uint8Array.from(atob(base64SessionKey), (c) =>
    c.charCodeAt(0)
  );
  const encrypted = await crypto.subtle.encrypt(
    RSA_ALGO,
    publicKey,
    sessionKeyBytes
  );
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

// Descriptografa a sessionKey usando chave privada
export async function decryptSessionKey(encryptedSessionKey, privateKey) {
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey,
    base64ToArrayBuffer(encryptedSessionKey)
  );

  // Importa como chave AES-GCM a partir do buffer bruto (raw key)
  return await window.crypto.subtle.importKey(
    "raw",
    decryptedBuffer,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  );
}

// =======================
// 🧠 SessionKey Cache (por destinatário)
// =======================

const sessionKeyStore = {};

export const gerarEncryptionKeyId = (userIdA, userIdB) => {
  return [userIdA, userIdB].sort().join("-");
};

// Verifica se já temos a sessionKey local
export async function checkExistingSessionKey(encryptionKeyId) {
  return sessionKeyStore[encryptionKeyId]?.encryptedKey || null;
}



// Armazena sessionKey para reuso
// 🔐 Armazena localmente uma chave de sessão AES, associada a um ID único (encryptionKeyId)
// No armazenamento local
export async function storeSessionKeyLocally(encryptionKeyId, { rawKey, encryptedKey }) {
  const exportedKey = await exportKeyToBase64(rawKey); // ✅ Esperar a Promise

  const keyData = {
    encryptedKey,     // Opcional, se for necessário para reenvio
    exportedKey,      // Base64 já resolvida
  };

  localStorage.setItem(`sessionKey_${encryptionKeyId}`, JSON.stringify(keyData));
}



export async function getLocalSessionKey(encryptionKeyId) {
  const data = localStorage.getItem(`sessionKey_${encryptionKeyId}`);
  if (!data) return null;

  try {
    const { exportedKey, encryptedKey } = JSON.parse(data);

    const rawKey = await importKeyFromBase64(exportedKey);

    return {
      rawKey,
      encryptedKey,
    };
  } catch (e) {
    console.warn("🔑 Erro ao importar sessionKey:", e);
    return null;
  }
}



// converte de arrayBuffer para base64
export function arrayBufferToBase64(buffer) {
  const binary = String.fromCharCode(...new Uint8Array(buffer));
  return window.btoa(binary);
}



export async function importRSAVerificationKey(pem) {
  if (typeof pem !== "string") {
    throw new Error("❌ Chave pública PEM esperada como string.");
  }

  const b64 = pem.replace(
    /-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\n/g,
    ""
  );
  const binaryDer = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

  return crypto.subtle.importKey(
    "spki",
    binaryDer.buffer,
    {
      name: "RSA-PSS",
      hash: "SHA-256",
    },
    true,
    ["verify"]
  );
}

const publicKeyCache = new Map();

export async function getPublicKeyFromUser(userId) {
  if (publicKeyCache.has(userId)) {
    return publicKeyCache.get(userId);
  }

  const response = await fetch(`/api/users/${userId}/public-key`);
  if (!response.ok) return null;

  const data = await response.json();
  publicKeyCache.set(userId, data);
  return data;
}

export const isValidBase64 = (base64) => {
  if (typeof base64 !== "string" || base64.trim() === "") return false;

  // Verifica se só tem caracteres válidos (letras, números, +, /, =)
  const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;
  if (!base64Pattern.test(base64)) return false;

  // Deve ter tamanho múltiplo de 4
  if (base64.length % 4 !== 0) return false;

  // Teste real com atob() (pode lançar erro)
  try {
    atob(base64);
    return true;
  } catch (e) {
    return e;
  }
};


export const base64ToArrayBuffer = (base64) => {
  try {
    if (!base64 || typeof base64 !== "string") {
      throw new Error("Entrada inválida: base64 precisa ser uma string.");
    }

     if (!isValidBase64(base64)) {
      throw new Error("Base64 inválido.");
    }

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (e) {
    console.error("❌ Erro ao converter base64 para ArrayBuffer:", e);
    console.log("📦 Base64 recebido:", base64);
    return null;
  }
};


export const arrayBufferToString = (buffer) => {
  return new TextDecoder().decode(buffer);
};

export const decryptMessage = async ({ conteudo, iv, aesKey }) => {
  try {
    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: base64ToArrayBuffer(iv), // certifique-se que o IV está em formato correto (Uint8Array)
      },
      aesKey,
      base64ToArrayBuffer(conteudo)
    );

    const decoder = new TextDecoder();
    const mensagem = decoder.decode(decryptedContent);
    console.log("✅ Mensagem descriptografada:", mensagem);
    return mensagem; // ✅ return adicionado aqui
  } catch (err) {
    console.error("❌ Erro ao descriptografar conteúdo AES:", err);
  }
};

export async function importKeyFromBase64(base64Key) {
  try {
    if (!base64Key || typeof base64Key !== "string") {
      throw new Error("Chave base64 inválida ou vazia.");
    }

    // Remove espaços em branco extras ou caracteres inválidos
    const cleanedBase64 = base64Key.trim();

    const rawKey = Uint8Array.from(atob(cleanedBase64), (c) =>
      c.charCodeAt(0)
    );

    return await window.crypto.subtle.importKey(
      "raw",
      rawKey,
      { name: "AES-GCM" },
      true,
      ["encrypt", "decrypt"]
    );
  } catch (err) {
    console.error("❌ Erro ao importar chave AES de base64:", err);
    throw err;
  }
}


export async function decryptWithPrivateKey(privateKey, encryptedData) {
  const decodedData = Uint8Array.from(atob(encryptedData), (c) =>
    c.charCodeAt(0)
  );
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey,
    decodedData
  );
  return btoa(String.fromCharCode(...new Uint8Array(decrypted)));
}

export async function verifyKeyPair(publicKeyPem, privateKey) {
  try {
    const testData = new TextEncoder().encode("test-crypto");
    const publicKey = await importRSAPublicKey(publicKeyPem);

    // Criptografa com a chave pública
    const encrypted = await crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      publicKey,
      testData
    );

    // Descriptografa com a chave privada
    const decrypted = await crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      encrypted
    );

    const result = new TextDecoder().decode(decrypted) === "test-crypto";
    console.log(
      "Verificação do par de chaves:",
      result ? "✅ Válido" : "❌ Inválido"
    );
    return result;
  } catch (error) {
    console.error("Erro na verificação do par de chaves:", error);
    return false;
  }
}

export async function decryptOwnMessage(mensagem) {
  const { conteudo, tipoMidia } = mensagem;

  // Se for texto, considera conteudo já como plainText
  if (tipoMidia === "texto") {
    return conteudo;
  }

  // Se for mídia (ex.: arquivos base64), você pode tratar de forma diferente no futuro
  return conteudo;
}



export async function decryptPrivateKey(
  encryptedKeyBase64,
  password,
  ivBase64,
  saltBase64
) {
  const encoder = new TextEncoder();
  const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
  const salt = Uint8Array.from(atob(saltBase64), (c) => c.charCodeAt(0));
  const encryptedKeyBuffer = Uint8Array.from(
    atob(encryptedKeyBase64),
    (c) => c.charCodeAt(0)
  );

  // Derivar chave AES a partir da senha
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    aesKey,
    encryptedKeyBuffer
  );

  return decrypted; // retorna o ArrayBuffer da chave privada descriptografada
}






