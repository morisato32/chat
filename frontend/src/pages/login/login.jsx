import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
<<<<<<< Updated upstream
<<<<<<< Updated upstream

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
    senhaDeDesbloqueio: "",
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Atualiza os dados do formulário conforme o usuário digita
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Deriva uma chave AES a partir da senha usando PBKDF2
  const deriveKeyFromPassword = async (password, salt) => {
    try {
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
      );
      
      return await crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt,
          iterations: 100000, // Número seguro de iterações
          hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 }, // Configuração AES
        false,
        ["decrypt"]
      );
    } catch (error) {
      throw new Error("Falha ao processar senha de desbloqueio");
    }
  };
=======
import { useCrypto } from "../../components/CryptoContext";

function Login() {
  const navigate = useNavigate();
  const { setSigningPrivateKey, setEncryptionPrivateKey } = useCrypto();

  const [formData, setFormData] = useState({
    email: "",
    senha: "",
    senhaDeDesbloqueio: "",
  });

=======
import { useCrypto } from "../../components/CryptoContext";

function Login() {
  const navigate = useNavigate();
  const { setSigningPrivateKey, setEncryptionPrivateKey } = useCrypto();

  const [formData, setFormData] = useState({
    email: "",
    senha: "",
    senhaDeDesbloqueio: "",
  });

>>>>>>> Stashed changes
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Utilitários Criptográficos ---
  const base64ToUint8Array = (base64) => {
    const cleaned = base64
      .replace(/-----[^-]+-----/g, "")
      .replace(/\s+/g, "")
      .trim();
    const binary = atob(cleaned);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  };

  const deriveKeyFromPassword = async (password, salt) => {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
  };

  const decryptPrivateKey = async (
    encryptedKeyB64,
    password,
    ivB64,
    saltB64
  ) => {
    const [encryptedKey, iv, salt] = [
      base64ToUint8Array(encryptedKeyB64),
      base64ToUint8Array(ivB64),
      base64ToUint8Array(saltB64),
    ];

    const aesKey = await deriveKeyFromPassword(password, salt);
    return crypto.subtle.decrypt({ name: "AES-GCM", iv }, aesKey, encryptedKey);
  };

  const importPrivateKey = async (keyBuffer, keyType) => {
    const algorithm = keyType === "signing" ? "RSASSA-PKCS1-v1_5" : "RSA-OAEP";
    return crypto.subtle.importKey(
      "pkcs8",
      keyBuffer,
      { name: algorithm, hash: "SHA-256" },
      true,
      keyType === "signing" ? ["sign"] : ["decrypt"]
    );
  };

  // --- Funções de Gerenciamento de Dados do Usuário ---
  const getUserData = (userId) => {
    const data = localStorage.getItem(`userData_${userId}`);
    return data ? JSON.parse(data) : null;
  };

  const saveUserData = (userId, data) => {
    localStorage.setItem(`userData_${userId}`, JSON.stringify(data));
  };

  const addContact = (userId, contact) => {
    const userData = getUserData(userId) || {
      id: userId,
      contacts: {},
      sessionKeys: {},
    };

    userData.contacts[contact.id] = {
      id: contact.id,
      name: contact.name,
      email: contact.email,
      avatar: contact.avatar,
      publicKeys: {
        encryption: contact.publicEncryptionKey,
        signing: contact.publicSigningKey,
      },
    };

    saveUserData(userId, userData);
  };

  const migrateStorage = () => {
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith("destinatario_")) {
        const userId = key.split('_')[1];
        const data = JSON.parse(localStorage.getItem(key));
        
        if (data && data.id) {
          // Cria nova estrutura se não existir
          let userData = getUserData(userId) || {
            id: userId,
            contacts: {},
            sessionKeys: {},
          };
          
          // Adiciona contato à nova estrutura
          userData.contacts[data.id] = {
            id: data.id,
            name: data.name,
            email: data.email,
            avatar: data.avatar,
            publicKeys: {
              encryption: data.publicEncryptionKey,
              signing: data.publicSigningKey,
            },
          };
          
          saveUserData(userId, userData);
          localStorage.removeItem(key);
        }
      }
    });
  };

  // --- Fluxo principal de login ---
  const loginUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

  // Converte string Base64 para Uint8Array
  const base64ToUint8Array = (base64) => {
    try {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      if (!base64) throw new Error("Dado Base64 vazio");
      
      // Remove cabeçalhos e espaços
      const cleanedBase64 = base64
        .toString()
        .trim()
        .replace(/-----BEGIN [A-Z ]+-----/g, "")
        .replace(/-----END [A-Z ]+-----/g, "")
        .replace(/\s+/g, "");

      if (!/^[a-zA-Z0-9+/]*={0,2}$/.test(cleanedBase64)) {
        throw new Error("Formato Base64 inválido");
      }

      // Decodifica Base64 para bytes
      const binaryString = atob(cleanedBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } catch (error) {
      throw new Error("Formato de dados inválido");
    }
  };

  // Descriptografa a chave privada usando AES-GCM
  const decryptPrivateKey = async (encryptedKeyB64, password, ivB64, saltB64) => {
    try {
      // Converte todos os parâmetros para buffers
      const [encryptedKey, iv, salt] = await Promise.all([
        base64ToUint8Array(encryptedKeyB64),
        base64ToUint8Array(ivB64),
        base64ToUint8Array(saltB64)
      ]);

      // Deriva a chave de criptografia da senha
      const aesKey = await deriveKeyFromPassword(password, salt);
      
      // Executa a descriptografia
      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        aesKey,
        encryptedKey
      );

      return decrypted;
    } catch (error) {
      throw new Error("Falha ao descriptografar. Verifique sua senha de desbloqueio.");
    }
  };

  // Importa a chave privada no formato PKCS#8
  const importPrivateKey = async (privateKeyBuffer) => {
    try {
      return await crypto.subtle.importKey(
        "pkcs8", // Formato da chave privada
        privateKeyBuffer,
        {
          name: "RSASSA-PKCS1-v1_5", // Algoritmo RSA
          hash: "SHA-256",
        },
        true, // Extratível
        ["sign"] // Usos permitidos
      );
    } catch (error) {
      throw new Error("Formato de chave inválido. Pode ser senha de desbloqueio incorreta.");
    }
  };

  // Manipula o envio do formulário de login
  const loginUser = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
  
    try {
      // Validação básica dos campos
      if (!formData.email.trim() || !formData.senha || !formData.senhaDeDesbloqueio) {
        throw new Error("Preencha todos os campos");
      }

      // Requisição para o endpoint de login
      const response = await api.post("/login", {
        email: formData.email.trim().toLowerCase(),
        senha: formData.senha
      });

      // Verifica se a resposta contém o token
      if (response.data.token) {
        const userData = {
          token: response.data.token,
          id: response.data.userId,
          name: response.data.name,
          avatar:response.data.avatar,
          email: formData.email.trim().toLowerCase(),
          publicKey: response.data.publicKey,
          encryptedPrivateKey: response.data.encryptedPrivateKey,
          iv: response.data.iv,
          salt: response.data.salt,
          signature: response.data.signature
=======
      const { email, senha, senhaDeDesbloqueio } = formData;
      if (!email || !senha || !senhaDeDesbloqueio)
        throw new Error("Preencha todos os campos.");

      const response = await api.post("/login", {
        email: email.trim().toLowerCase(),
        senha,
      });

=======
      const { email, senha, senhaDeDesbloqueio } = formData;
      if (!email || !senha || !senhaDeDesbloqueio)
        throw new Error("Preencha todos os campos.");

      const response = await api.post("/login", {
        email: email.trim().toLowerCase(),
        senha,
      });

>>>>>>> Stashed changes
      const {
        token,
        userId,
        name,
        avatar,
        publicSigningKey,
        publicEncryptionKey,
        encryptedSigningPrivateKey,
        signingIv,
        signingSalt,
        encryptedEncryptionPrivateKey,
        encryptionIv,
        encryptionSalt,
        signature,
      } = response.data;

      // --- Descriptografar e importar as chaves privadas ---
      const signingKeyBuffer = await decryptPrivateKey(
        encryptedSigningPrivateKey,
        senhaDeDesbloqueio,
        signingIv,
        signingSalt
      );
      const encryptionKeyBuffer = await decryptPrivateKey(
        encryptedEncryptionPrivateKey,
        senhaDeDesbloqueio,
        encryptionIv,
        encryptionSalt
      );

      const signingPrivateKey = await importPrivateKey(
        signingKeyBuffer,
        "signing"
      );
      const encryptionPrivateKey = await importPrivateKey(
        encryptionKeyBuffer,
        "encryption"
      );

      // --- Armazenar chaves privadas no contexto ---
      setSigningPrivateKey(signingPrivateKey);
      setEncryptionPrivateKey(encryptionPrivateKey);

      // --- Armazenar dados públicos na sessionStorage ---
      const userSessionData = {
        token,
        id: userId,
        name,
        avatar,
        email: email.trim().toLowerCase(),
        publicSigningKey,
        publicEncryptionKey,
        encryptedSigningPrivateKey,
        signingIv,
        signingSalt,
        encryptedEncryptionPrivateKey,
        encryptionIv,
        encryptionSalt,
        signature,
      };
      
      sessionStorage.setItem("user", JSON.stringify(userSessionData));

      // --- Migrar dados antigos para nova estrutura ---
      migrateStorage();

      // --- Inicializar estrutura de dados do usuário ---
      let userData = getUserData(userId);
      if (!userData) {
        userData = {
          id: userId,
          contacts: {},
          sessionKeys: {},
          // Adicionar informações básicas do próprio usuário
          profile: {
            name,
            avatar,
            email: email.trim().toLowerCase(),
          }
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        };
        saveUserData(userId, userData);
      }
      

<<<<<<< Updated upstream
<<<<<<< Updated upstream
        // Armazena os dados do usuário na sessão
        sessionStorage.setItem("user", JSON.stringify(userData));
        // Quando o usuário fizer logout
        sessionStorage.removeItem('userData'); 

        
        // Redireciona para a página principal
        navigate("/chat");
      } else {
        throw new Error("Falha ao realizar login. Verifique seus dados.");
      }

    } catch (error) {
      // Tratamento de erros específicos
      let errorMessage = "Erro durante o login";
      if (error.message.includes("senha") || error.message.includes("desbloqueio")) {
        errorMessage = "Senha de desbloqueio incorreta";
      } else if (error.message.includes("criptografia")) {
        errorMessage = "Problema de segurança. Contate o suporte.";
      } else if (error.response?.status === 401) {
        errorMessage = "Credenciais inválidas";
      }

      setError(errorMessage);
=======
      // --- Buscar e armazenar o último contato ---
      try {
        const contatoResponse = await api.get(
          `/users/${userId}/ultimo-contato`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (contatoResponse.data) {
          addContact(userId, contatoResponse.data);
        }
      } catch (err) {
        console.warn("Nenhum contato anterior encontrado.", err);
      }

      sessionStorage.setItem("senhaDeDesbloqueio", senhaDeDesbloqueio);


      navigate("/chat");
    } catch (error) {
=======
      // --- Buscar e armazenar o último contato ---
      try {
        const contatoResponse = await api.get(
          `/users/${userId}/ultimo-contato`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (contatoResponse.data) {
          addContact(userId, contatoResponse.data);
        }
      } catch (err) {
        console.warn("Nenhum contato anterior encontrado.", err);
      }

      sessionStorage.setItem("senhaDeDesbloqueio", senhaDeDesbloqueio);


      navigate("/chat");
    } catch (error) {
>>>>>>> Stashed changes
      console.error(error);
      let msg = "Erro durante o login.";
      if (error.message.includes("desbloqueio")) {
        msg = "Senha de desbloqueio incorreta.";
      } else if (error.response?.status === 401) {
        msg = "Credenciais inválidas.";
      }
      setError(msg);
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    } finally {
      setIsLoading(false);
    }
  };

  // Renderização do componente
  return (
    <div className="container">
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      {/* Exibe mensagens de erro */}
      {error && (
        <div className="error-message">
          {error.includes("Contate o suporte") ? (
=======
      {error && (
        <div className="error-message">
          {error.includes("suporte") ? (
>>>>>>> Stashed changes
=======
      {error && (
        <div className="error-message">
          {error.includes("suporte") ? (
>>>>>>> Stashed changes
            <>
              {error} <Link to="/suporte">Clique aqui para contato</Link>
            </>
          ) : (
            error
          )}
        </div>
      )}
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      
      {/* Formulário de login */}
      <form className="form" onSubmit={loginUser}>
        <h1>Login</h1>
        
        {/* Campo de email */}
=======

      <form className="form" onSubmit={loginUser}>
        <h1>Login</h1>

>>>>>>> Stashed changes
=======

      <form className="form" onSubmit={loginUser}>
        <h1>Login</h1>

>>>>>>> Stashed changes
        <input
          placeholder="Email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
<<<<<<< Updated upstream
<<<<<<< Updated upstream
          autoComplete="username"
        />
        
        {/* Campo de senha */}
=======
        />

>>>>>>> Stashed changes
=======
        />

>>>>>>> Stashed changes
        <input
          placeholder="Senha"
          name="senha"
          type="password"
          required
          value={formData.senha}
          onChange={handleChange}
<<<<<<< Updated upstream
<<<<<<< Updated upstream
          autoComplete="current-password"
        />
        
        {/* Campo de senha de desbloqueio */}
        <input
          placeholder="Senha de desbloqueio"
          name="senhaDeDesbloqueio"
          type="password"
          required
          value={formData.senhaDeDesbloqueio}
          onChange={handleChange}
          autoComplete="off"
        />
        
        {/* Aviso sobre a senha de desbloqueio */}
        <small style={{ marginBottom: "10px", color: "#888" }}>
          Esta senha protege sua chave criptográfica. Se você a perder, não poderá acessar suas mensagens.
        </small>
        
        {/* Link para cadastro */}
        <p className="cadastroLogar">
          Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>
        
        {/* Botão de submit */}
        <button 
          type="submit" 
          disabled={isLoading}
          aria-busy={isLoading}
        >
=======
        />

        <input
          placeholder="Senha de desbloqueio"
          name="senhaDeDesbloqueio"
          type="password"
          required
          value={formData.senhaDeDesbloqueio}
          onChange={handleChange}
        />

        <small style={{ marginBottom: "10px", color: "#888" }}>
          Esta senha protege sua chave criptográfica. Se você a perder, não
          poderá acessar suas mensagens.
        </small>

        <p className="cadastroLogar">
          Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>

        <button type="submit" disabled={isLoading} aria-busy={isLoading}>
>>>>>>> Stashed changes
=======
        />

        <input
          placeholder="Senha de desbloqueio"
          name="senhaDeDesbloqueio"
          type="password"
          required
          value={formData.senhaDeDesbloqueio}
          onChange={handleChange}
        />

        <small style={{ marginBottom: "10px", color: "#888" }}>
          Esta senha protege sua chave criptográfica. Se você a perder, não
          poderá acessar suas mensagens.
        </small>

        <p className="cadastroLogar">
          Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>

        <button type="submit" disabled={isLoading} aria-busy={isLoading}>
>>>>>>> Stashed changes
          {isLoading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

export default Login;