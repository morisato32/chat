import { createRoot } from "react-dom/client";
import "./index.css";
import Cadastro from "./pages/cadastro/cadastro";
import Login from "./pages/login/login";
import Home from "./pages/home/home";
import BoasVindas from "./pages/BoasVindas";
import Chat from "./pages/chat/chat";
import ErrorPage from "./pages/error";
import Layout from "./components/layout";
import Convite from "./pages/convidarUsuario/convite";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CryptoProvider } from "./components/CryptoContext";
import { SocketProvider } from "./components/SocketProvider";

const user = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "{}");
const userId = user.id;

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <Home />
      </Layout>
    ),
  },
  {
    path: "/cadastro",
    element: <Cadastro />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/boasvindas",
    element: <BoasVindas />,
  },
  {
    path: "/chat",
    element: <Chat />,
  },
  {
    path: "/chat/:id",
    element: <Chat />,
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
]);




createRoot(document.getElementById("root")).render(
  <CryptoProvider>
    <SocketProvider userId={userId}>
      <RouterProvider router={router} />
    </SocketProvider>
  </CryptoProvider>
);

