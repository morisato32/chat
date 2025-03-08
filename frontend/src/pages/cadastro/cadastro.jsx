import "../../../src/index.css";
import api from "../../services/api";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";

function Cadastro() {
  const navigate = useNavigate();

  const name = useRef();
  const email = useRef();
  const senha = useRef();
  
  const [error, setError] = useState(null); // Estado para armazenar mensagens de erro

  async function createUsers(e) {
    e.preventDefault();
    setError(null); // Limpa mensagens de erro anteriores

    try {
      const response = await api.post("/users", {
        name: name.current.value,
        email: email.current.value,
        senha: senha.current.value,
      });

      if (response.data.token && response.data.name) {
        sessionStorage.setItem('token', response.data.token); // Armazena o token
        sessionStorage.setItem('name', response.data.name); // Armazena o nome
        sessionStorage.setItem('userId',response.data.userId) // Armazena usuario
        navigate("/boasvindas");
      }
     
     
      
    } catch (error) {
      if (error.response.status === 400) {
        setError("Este email já está cadastrado. Por favor, tente outro.");
      } else {
        setError(
          error.response.data.message || "Erro ao cadastrar. Tente novamente."
        );
      }
    }
  }

  return (
    <div className="container">
      {error && <p className="errorMessage">{error}</p>}
      {/* Exibe a mensagem de erro */}
      <form className="form" onSubmit={createUsers}>
        <h1>Cadastrar</h1>
        <input placeholder="nome" name="name" type="text" required ref={name} />
        <input
          placeholder="email"
          name="email"
          type="email"
          required
          ref={email}
        />
        <input
          placeholder="senha"
          name="senha"
          type="password"
          required
          autoComplete="new-password" // Correção: new-password para evitar preenchimento automático
          ref={senha}
        />
        <p className="cadastroLogar">
          
          Já tem uma conta? Faça.<Link to="/login">login</Link>
        </p>

        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}

export default Cadastro;
