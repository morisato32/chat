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






//roteador
import {createBrowserRouter,RouterProvider} from 'react-router-dom'




const router = createBrowserRouter([
  {
    path: '/',
    element:<Layout><Home/></Layout>
  },
  {
    errorElement:<ErrorPage/>,
    
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
}
])


createRoot(document.getElementById("root")).render(
  <StrictMode>
    
      <RouterProvider router={router} />
    
  </StrictMode>
);
