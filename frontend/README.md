# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## 🔐 Arquitetura Criptográfica (E2EE)

## graph TD
    A[Cliente] -->|Cadastro| B[Geração de Chaves]
    B --> C[Armazenamento Seguro]
    A -->|Login| D[Descriptografia]
    D --> E[Comunicação Criptografada]


## 1. Geração de Chaves RSA (Frontend)
## // Configuração RSA-2048
const rsaKeyPair = await crypto.subtle.generateKey(
  {
    name: "RSASSA-PKCS1-v1_5",
    modulusLength: 2048, // 2048 bits (padrão OWASP)
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
    hash: "SHA-256"
  },
  true, // Extratível
  ["sign", "verify"] // Usos permitidos
);


## 2. Derivação de Chave AES (PBKDF2)
javascript
const deriveAESKey = async (senha, salt) => {
  const iterations = 100000; // Nível OWASP 2023
  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256"
    },
    await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(senha),
      "PBKDF2",
      false,
      ["deriveKey"]
    ),
    { name: "AES-GCM", length: 256 }, // AES-256
    false,
    ["encrypt", "decrypt"]
  );
};


## 3. Criptografia da Chave Privada
Parâmetros AES-GCM:

javascript
{
  algorithm: {
    name: "AES-GCM",
    iv: crypto.getRandomValues(new Uint8Array(12)), // 96 bits IV
    tagLength: 128 // Tamanho da tag de autenticação
  },
  key: derivedAESKey, // Chave derivada via PBKDF2
  data: privateKeyBytes // PKCS#8 em ArrayBuffer
}


## 4. Armazenamento Seguro no Backend
Estrutura mínima no banco de dados:

typescript
interface UserCryptoData {
  publicKey: string; // PEM formatado
  encryptedPrivateKey: string; // Base64
  iv: string; // Base64 (12 bytes)
  salt: string; // Base64 (16 bytes)
  signature: string; // Assinatura do email
}


## 5. Fluxo de Login Seguro
Diagram
Code
sequenceDiagram
    Cliente->>Servidor: POST /login (email, senha)
    Servidor-->>Cliente: Dados criptográficos
    Cliente->>Cliente: Deriva chave AES (PBKDF2)
    Cliente->>Cliente: Descriptografa chave privada
    Cliente->>Cliente: Verifica assinatura
    Cliente->>Servidor: Requisições autenticadas


## 6. Assinatura Digital (E-mail)
javascript
const signEmail = async (email, privateKey) => {
  return await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    privateKey,
    new TextEncoder().encode(email.trim().toLowerCase())
  );
};


## ⚠️ Requisitos de Segurança Crítica
Senha de Desbloqueio:

Mínimo 12 caracteres

Armazenada apenas no cliente

Sem recuperação (perdeu = recriação de chaves)


## 🔄 Migrações Futuras
Algoritmos Recomendados:

markdown
- [ ] Substituir PBKDF2 por Argon2id
- [ ] Migrar para RSA-PSS (RFC 8017)
- [ ] Adotar CURVE25519 para ECDH

