import "../../../src/index.css";
import api from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import { useRef, useState } from "react";

function Login() {
  const email = useRef();
  const senha = useRef();
  const [error, setError] = useState(null); // Estado para armazenar mensagens de erro

  const navigate = useNavigate(); // Certifique-se de que navigate está declarado

  async function loginUser(e) {
    e.preventDefault();
    setError(null); // Limpa mensagens de erro anteriores

    try {
      const response = await api.post("/login", {
        email: email.current.value,
        senha: senha.current.value,
      });

      // Verifica se a resposta da API contém o token
      if (response.data.data.token) {
        const userData = {
          token: response.data.data.token,
          id: response.data.data.id,
          name: response.data.data.name,
          email: response.data.data.email,
          avatar: response.data.data.avatar, // ✅ adicionar isso
        };

        sessionStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("user", JSON.stringify(userData)); // se quiser persistência

        // Armazena o token e outras informações do usuário
        sessionStorage.setItem("user", JSON.stringify(userData));
        // Redireciona para a página do chat
        navigate("/chat");
      } else {
        setError("Falha ao realizar login. Verifique seus dados.");
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          setError("Email ou senha incorretos. Tente novamente.");
        } else if (error.response.status === 404) {
          setError("Usuário não encontrado. Verifique o email digitado.");
        }
      }
    }
  }

  return (
    <div className="container">
      {error && <div className="errorMessage">{error}</div>}{" "}
      {/* Exibe a mensagem de erro */}
      <form className="form" method="post" onSubmit={loginUser}>
        <h1>Login</h1>
        <input
          placeholder="Email"
          name="email"
          type="email"
          required
          autoComplete="off"
          ref={email}
        />
        <input
          placeholder="Senha"
          name="senha"
          type="password"
          required
          autoComplete="off"
          ref={senha}
        />
        <p className="cadastroLogar">
          Novo por aqui? <Link to="/cadastro">Cadastre-se</Link>
        </p>
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default Login;
