import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

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

  // Converte string Base64 para Uint8Array
  const base64ToUint8Array = (base64) => {
    try {
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
        };

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
    } finally {
      setIsLoading(false);
    }
  };

  // Renderização do componente
  return (
    <div className="container">
      {/* Exibe mensagens de erro */}
      {error && (
        <div className="error-message">
          {error.includes("Contate o suporte") ? (
            <>
              {error} <Link to="/suporte">Clique aqui para contato</Link>
            </>
          ) : (
            error
          )}
        </div>
      )}
      
      {/* Formulário de login */}
      <form className="form" onSubmit={loginUser}>
        <h1>Login</h1>
        
        {/* Campo de email */}
        <input
          placeholder="Email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          autoComplete="username"
        />
        
        {/* Campo de senha */}
        <input
          placeholder="Senha"
          name="senha"
          type="password"
          required
          value={formData.senha}
          onChange={handleChange}
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
          {isLoading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

export default Login;