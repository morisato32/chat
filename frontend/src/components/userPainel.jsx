import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import styles from "../components/chat.module.css";
import ChangeAvatar from "../components/changeAvatar";

const UserPanel = ({ currentUser, setCurrentUser, socketRef }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar || "");
  const menuRef = useRef(null);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    if (currentUser?.avatar) {
      setAvatarUrl(currentUser.avatar);
    }
  }, [currentUser]);

  const handleAvatarUpdate = (newAvatarUrl) => {
    setAvatarUrl(newAvatarUrl);

    const updatedUser = { ...currentUser, avatar: newAvatarUrl };

    // Atualiza nos dois storages
    sessionStorage.setItem("user", JSON.stringify(updatedUser));
    localStorage.setItem("user", JSON.stringify(updatedUser));

    if (setCurrentUser) {
      setCurrentUser(updatedUser); // Atualiza no estado global
    }

    // EMITE EVENTO VIA SOCKET
    if (socketRef?.current && currentUser?.id) {
      socketRef.current.emit("avatar-updated", {
        userId: currentUser.id,
        newAvatar: newAvatarUrl,
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  console.log("ID do usuário no UserPanel:", currentUser?.id);

  return (
    <div className="user-panel flex items-center justify-between p-3 border-t border-gray-700 bg-[#1e1e1e] text-white relative">
      <div className="flex items-center gap-3 relative" ref={menuRef}>
        <img
          src={
            currentUser.avatar
            ? currentUser.avatar.startsWith("http")
              ? currentUser.avatar
              : currentUser.avatar.startsWith("/")
                ? `https://localhost:5000${currentUser.avatar}` // Adiciona o protocolo e domínio
                : `https://localhost:5000/${currentUser.avatar}` // Adiciona protocolo, domínio e barra
            : "https://thumbs.dreamstime.com/b/%C3%ADcone-de-perfil-avatar-padr%C3%A3o-imagem-usu%C3%A1rio-m%C3%ADdia-social-210115353.jpg"
          }
          alt="Avatar"
          title="Perfil user"
          className={styles.avatar_padrao}
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ cursor: "pointer" }}
        />
        <span className={styles.user_name}>
          {currentUser?.name || "Usuário"}
        </span>

        {menuOpen && (
          <div className={styles.dropdown_menu}>
            <ul>
              <li onClick={() => setShowAvatarModal(true)}>Alterar imagem de perfil</li>
              <li>Visualizar imagem de perfil</li>
              <li>Alterar nome</li>
              <li>Ver perfil completo</li>
              <li>Configurações</li>
              <li>Tema (claro/escuro)</li>
              <li onClick={handleLogout} className={styles.dropdown_logout}>
                <FiLogOut className="inline mr-2" />
                Sair
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Modal para alterar avatar */}
      {showAvatarModal && (
        <ChangeAvatar
          userId={currentUser?.id}
          onClose={() => setShowAvatarModal(false)}
          onAvatarUpdated={handleAvatarUpdate}
        />
      )}
    </div>
  );
};

export default UserPanel;
