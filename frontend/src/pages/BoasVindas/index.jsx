import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const BoasVindas = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    console.log(storedUser)
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.name) {
          setUser(parsedUser);
        } else {
          console.error("Dados do usuário incompletos:", parsedUser);
          navigate("/login"); // Redireciona se os dados estiverem incompletos
        }
      } catch (error) {
        console.error("Erro ao ler dados do usuário:", error);
        navigate("/login");
      }
    } else {
      navigate("/login"); // Redireciona se não houver usuário
    }
    
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="welcome-container">
      <h1>
        {user ? (
          <>Bem-vindo, <span className="user-name">{user.name}</span>! Vamos bater um <Link to="/chat">papo</Link>!</>
        ) : (
          "Bem-vindo! Carregando seus dados..."
        )}
      </h1>
    </div>
  );
};

export default BoasVindas;