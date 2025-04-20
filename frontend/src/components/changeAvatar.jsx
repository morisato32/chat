import React, { useState } from "react";
import styles from "../components/changeAvatar.module.css";
import api from "../services/api";

const ChangeAvatar = ({ userId, onClose, onAvatarUpdated }) => {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState("");


  

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    console.log('arquivo:',selected)
    if (selected) {
      setFile(selected);
      setImageUrl(""); // Limpa a URL caso tenha sido inserida
      setPreview(URL.createObjectURL(selected)); // Exibe o preview da imagem
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setFile(null); // Limpa o arquivo
    setPreview(url); // Exibe o preview da URL
  };
[

]
console.log('userHandleSubmit:',userId)
const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let avatarUrl = "";
  
      if (file) {
        const formData = new FormData();
        formData.append("avatar", file);
        formData.append("userId", userId); // Envia o userId no corpo da requisição
  
        // Faz a requisição para upload de arquivo
        const response = await api.post("/users/avatar/upload", formData);
        avatarUrl = response.data.avatarUrl;
      } else if (imageUrl) {
        const response = await api.post("/users/avatar/url", {
          userId, // Envia o userId no corpo da requisição
          avatarUrl: imageUrl,
        });
        avatarUrl = response.data.avatarUrl;
      }
  
      if (avatarUrl) {
        onAvatarUpdated(avatarUrl); // Atualiza o avatar no componente pai
        onClose(); // Fecha o modal
      }
    } catch (err) {
      console.error("Erro ao atualizar o avatar:", err);
    }
  };
  

  return (
    <div className={styles.modal}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Alterar imagem de perfil</h2>

        <label className={styles.label}>Enviar imagem:</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />

        <label className={styles.label}>Ou colar URL da imagem:</label>
        <input
          type="text"
          value={imageUrl}
          onChange={handleUrlChange}
          placeholder="https://..."
        />

        {preview && (
          <div className={styles.preview}>
            <img src={preview} alt="Preview" />
          </div>
        )}

        <div className={styles.buttons}>
          <button type="submit" className={styles.save}>
            Salvar
          </button>
          <button type="button" onClick={onClose} className={styles.cancel}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangeAvatar;
