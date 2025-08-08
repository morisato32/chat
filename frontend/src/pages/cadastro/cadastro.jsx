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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
=======
>>>>>>> Stashed changes
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toBase64 = (buffer) => btoa(String.fromCharCode(...new Uint8Array(buffer)));

  const exportKeyAsPEM = async (key, format = "spki") => {
    const exported = await crypto.subtle.exportKey(format, key);
    const pem = toBase64(exported);
    return `-----BEGIN PUBLIC KEY-----\n${pem.match(/.{1,64}/g).join("\n")}\n-----END PUBLIC KEY-----`;
  };

  const generateKeyPair = async (type) => {
    const algorithm = {
      name: type === "sign" ? "RSASSA-PKCS1-v1_5" : "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    };
    const usages = type === "sign" ? ["sign", "verify"] : ["encrypt", "decrypt"];
    return await crypto.subtle.generateKey(algorithm, true, usages);
  };
<<<<<<< Updated upstream

  const deriveAESKey = async (password, salt) => {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]);
    return await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
>>>>>>> Stashed changes
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );
  };

<<<<<<< Updated upstream
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
=======
=======

  const deriveAESKey = async (password, salt) => {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]);
    return await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );
  };

>>>>>>> Stashed changes
// 🔐 No lugar do seu encryptPrivateKey atual:
const encryptKeyWithAES = async (privateKey, password) => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const aesKey = await deriveAESKey(password, salt);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, privateKey);
  return { encrypted, iv, salt };
};
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

  const signEmail = async (email, privateKey) => {
    const data = new TextEncoder().encode(email.trim().toLowerCase());
    const signature = await crypto.subtle.sign({ name: "RSASSA-PKCS1-v1_5" }, privateKey, data);
    return toBase64(signature);
  };

  const createUsers = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

<<<<<<< Updated upstream
<<<<<<< Updated upstream
    if (
      !formData.name ||
      !formData.email ||
      !formData.senha ||
      !formData.senhaDeDesbloqueio
    ) {
      setError("Todos os campos são obrigatórios");
=======
=======
>>>>>>> Stashed changes
    const { name, email, senha, senhaDeDesbloqueio } = formData;

    if (!name || !email || !senha || !senhaDeDesbloqueio) {
      setError("Preencha todos os campos obrigatórios.");
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
      setIsLoading(false);
      return;
    }

    try {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
=======
>>>>>>> Stashed changes
     // 1. Geração de pares de chave
    const signatureKeys = await generateKeyPair("sign");
    const encryptionKeys = await generateKeyPair("encrypt");

    // 2. Exportação de chaves públicas
    const publicSigningKey = await exportKeyAsPEM(signatureKeys.publicKey);
    const publicEncryptionKey = await exportKeyAsPEM(encryptionKeys.publicKey);

    // 3. Exportação de chaves privadas (formato PKCS8)
    const exportedSigningPrivateKey = await crypto.subtle.exportKey("pkcs8", signatureKeys.privateKey);
    const exportedEncryptionPrivateKey = await crypto.subtle.exportKey("pkcs8", encryptionKeys.privateKey);

    // 4. Criptografia das chaves privadas com senha de desbloqueio
    const signedKeyEnc = await encryptKeyWithAES(exportedSigningPrivateKey, senhaDeDesbloqueio);
    const encryptionKeyEnc = await encryptKeyWithAES(exportedEncryptionPrivateKey, senhaDeDesbloqueio);

    // 5. Assinatura do email
    const emailSignature = await signEmail(email, signatureKeys.privateKey);

    // 6. Montar payload com os campos conforme novo model
    const payload = {
      name,
      email: email.trim().toLowerCase(),
      senha,

      publicSigningKey,
      publicEncryptionKey,

      encryptedSigningPrivateKey: toBase64(signedKeyEnc.encrypted),
      signingIv: toBase64(signedKeyEnc.iv),
      signingSalt: toBase64(signedKeyEnc.salt),

      encryptedEncryptionPrivateKey: toBase64(encryptionKeyEnc.encrypted),
      encryptionIv: toBase64(encryptionKeyEnc.iv),
      encryptionSalt: toBase64(encryptionKeyEnc.salt),

      signature: emailSignature,
    };

    // 7. Enviar ao backend
    const response = await api.post("/users", payload);

    if (response.data.token) {
      const userData = {
        token: response.data.token,
        name: response.data.name,
        id: response.data.userId,

        publicSigningKey: response.data.publicSigningKey,
        publicEncryptionKey: response.data.publicEncryptionKey,

        encryptedSigningPrivateKey: response.data.encryptedSigningPrivateKey,
        signingIv: response.data.signingIv,
        signingSalt: response.data.signingSalt,

        encryptedEncryptionPrivateKey: response.data.encryptedEncryptionPrivateKey,
        encryptionIv: response.data.encryptionIv,
        encryptionSalt: response.data.encryptionSalt,

        signature: response.data.signature,
      };
      sessionStorage.setItem("user", JSON.stringify(userData));
      navigate("/boasvindas");
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    }
  } catch (error) {
    console.error("Erro no cadastro:", error);
    setError(error.response?.data?.error || "Erro ao cadastrar usuário.");
  } finally {
    setIsLoading(false);
  }
  };

  return (
    <div className="container">
      {error && <div className="error-message">{error}</div>}
      <form className="form" onSubmit={createUsers}>
        <h1>Cadastrar</h1>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
        <input placeholder="Nome" name="name" type="text" required value={formData.name} onChange={handleChange} />
        <input placeholder="Email" name="email" type="email" required value={formData.email} onChange={handleChange} />
        <input placeholder="Senha" name="senha" type="password" required minLength={6} value={formData.senha} onChange={handleChange} />
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
          Esta senha será usada para proteger sua chave privada criptográfica. Guarde-a com segurança!
>>>>>>> Stashed changes
=======
        <input placeholder="Nome" name="name" type="text" required value={formData.name} onChange={handleChange} />
        <input placeholder="Email" name="email" type="email" required value={formData.email} onChange={handleChange} />
        <input placeholder="Senha" name="senha" type="password" required minLength={6} value={formData.senha} onChange={handleChange} />
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
          Esta senha será usada para proteger sua chave privada criptográfica. Guarde-a com segurança!
>>>>>>> Stashed changes
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
