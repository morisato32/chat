import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../../src/index.css";

function Cadastro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    senha: "",
    senhaDeDesbloqueio: "",
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateRSAKeyPair = async () => {
    return await crypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: "SHA-256",
      },
      true,
      ["sign", "verify"]
    );
  };

  const exportPublicKey = async (key) => {
    const exported = await crypto.subtle.exportKey("spki", key);
    const pem = btoa(String.fromCharCode(...new Uint8Array(exported)));
    return `-----BEGIN PUBLIC KEY-----\n${pem
      .match(/.{1,64}/g)
      .join("\n")}\n-----END PUBLIC KEY-----`;
  };

  const exportPrivateKey = async (key) => {
    const exported = await crypto.subtle.exportKey("pkcs8", key);
    return new Uint8Array(exported);
  };

  const deriveKeyFromPassword = async (password, salt) => {
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
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );
  };

  const encryptPrivateKey = async (privateKeyBytes, password) => {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const aesKey = await deriveKeyFromPassword(password, salt);
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      aesKey,
      privateKeyBytes
    );
    return { encrypted, iv, salt };
  };

  const signEmail = async (email, privateKey) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(email.trim().toLowerCase());
    const signature = await crypto.subtle.sign(
      { name: "RSASSA-PKCS1-v1_5" },
      privateKey,
      data
    );
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  };

  const arrayBufferToBase64 = (buffer) => {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  };

  async function createUsers(e) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (
      !formData.name ||
      !formData.email ||
      !formData.senha ||
      !formData.senhaDeDesbloqueio
    ) {
      setError("Todos os campos são obrigatórios");
      setIsLoading(false);
      return;
    }

    try {
      const rsaKeyPair = await generateRSAKeyPair();
      const exportedPub = await exportPublicKey(rsaKeyPair.publicKey);
      const exportedPriv = await exportPrivateKey(rsaKeyPair.privateKey);

      

      const { encrypted, iv, salt } = await encryptPrivateKey(
        exportedPriv,
        formData.senhaDeDesbloqueio
      );

      const signature = await signEmail(formData.email, rsaKeyPair.privateKey);

      const payload = {
        name: formData.name,
        email: formData.email.trim().toLowerCase(),
        senha: formData.senha,
        publicKey: exportedPub,
        encryptedPrivateKey: arrayBufferToBase64(encrypted),
        iv: arrayBufferToBase64(iv),
        salt: arrayBufferToBase64(salt),
        signature,
      };

      const response = await api.post("/users", payload);

      // Verificação crítica
if (!response.data?.encryptedPrivateKey || 
  !response.data?.iv || 
  !response.data?.salt) {
console.error('Dados faltando na resposta:', response.data);
throw new Error('O servidor não retornou todos os dados de criptografia');
}

      if (response.data.token) {
        const userData = {
          token: response.data.token,
          name: response.data.name,
          id: response.data.userId,
          publicKey: response.data.publicKey,
          encryptedPrivateKey: response.data.encryptedPrivateKey,
          iv: response.data.iv,
          salt: response.data.salt,
          signature: response.data.signature,
        };

        sessionStorage.setItem("user", JSON.stringify(userData));
        navigate("/boasvindas");
      }
    } catch (error) {
      console.error("Erro no cadastro:", error.response?.data || error.message);

      setError(error.response?.data?.error || "Erro ao cadastrar");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container">
      {error && <div className="error-message">{error}</div>}
      <form className="form" onSubmit={createUsers}>
        <h1>Cadastrar</h1>
        <input
          placeholder="Nome"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
        />
        <input
          placeholder="Email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
        />
        <input
          placeholder="Senha"
          name="senha"
          type="password"
          required
          minLength={6}
          value={formData.senha}
          onChange={handleChange}
        />
        <input
          placeholder="Senha de desbloqueio"
          name="senhaDeDesbloqueio"
          type="password"
          required
          minLength={6}
          value={formData.senhaDeDesbloqueio}
          onChange={handleChange}
        />
        <small style={{ marginBottom: "10px", color: "#888" }}>
          Esta senha será usada para proteger sua chave criptográfica. Não a
          perca!
        </small>
        <p className="cadastroLogar">
          Já tem uma conta? Faça <Link to="/login">login</Link>
        </p>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
    </div>
  );
}

export default Cadastro;
