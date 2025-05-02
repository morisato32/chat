import { useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../../src/index.css";

function Cadastro() {
  const navigate = useNavigate();
  // Substitua useRef por useState para melhor controle
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    senha: ''
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  async function createUsers(e) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validação básica dos campos
    if (!formData.name || !formData.email || !formData.senha) {
      setError("Todos os campos são obrigatórios");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post("/users", {
        name: formData.name,
        email: formData.email.toLowerCase().trim(),
        senha: formData.senha
      });

      console.log("Resposta do backend:", response.data);

      if (response.data.token) {
        const userData = {
          token: response.data.token,
          name: response.data.name || formData.name, // Fallback para o nome do form
          id: response.data.userId,
          publicKey: response.data.publicKey
        };

        sessionStorage.setItem("user", JSON.stringify(userData));
        navigate("/boasvindas");
      }
    } catch (error) {
      console.error("Erro no cadastro:", error);
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
          autoComplete="new-password"
        />
        
        <p className="cadastroLogar">
          Já tem uma conta? Faça <Link to="/login">login</Link>
        </p>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  );
}

export default Cadastro;