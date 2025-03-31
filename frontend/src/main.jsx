import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Cadastro from './pages/cadastro/cadastro'
import Login from './pages/login/login'
import Home from './pages/home/home'
import BoasVindas from './pages/BoasVindas'
import Chat from './pages/chat/chat'
import ErrorPage from './pages/error'
import Layout from './components/layout'
import Convite from './pages/convidarUsuario/convite'






//roteador
import {createBrowserRouter,RouterProvider} from 'react-router-dom'




const router = createBrowserRouter([
  {
    path: '/',
    element:<Layout><Home/></Layout>
  },
  
  {
  path: '/cadastro',
  element:<Cadastro/>
},
{
  path: '/login',
  element:<Login/>
},
{
  path: '/boasvindas',
  element:<BoasVindas/>
},
{
  path: '/chat',
  element:<Chat/>
},
{
  path: '/chat/:id',  // Rota para o chat com ID e Token como parâmetro 
  element: <Chat />,  // O componente que renderiza a página do convite
},
 // Rota coringa para páginas inexistentes
 {
  path: '*',
  element: <ErrorPage />,
}
])
// O caminho "*" captura qualquer URL que não corresponda a nenhuma das rotas definidas.

// Assim, sempre que o usuário acessar uma página que não existe, a ErrorPage será renderizada.

// Agora, se você tentar acessar uma rota inexistente, a página 404 será exibida corretamente. 🚀


createRoot(document.getElementById("root")).render(
  <StrictMode>
    
      <RouterProvider router={router} />
    
  </StrictMode>
);
