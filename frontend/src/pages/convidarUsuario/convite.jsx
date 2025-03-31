import React, { useState } from "react";
import axios from "axios";

const API_URL =  "http://localhost:5000";

const GenerateInvite = () => {
  const [inviteLink, setInviteLink] = useState("");

  const generateInvite = async () => {
    try {
      // Faz uma requisição POST para gerar o convite
      const response = await axios.post(`${API_URL}/generate-invite`);
      setInviteLink(response.data.inviteLink); // Armazena o link de convite retornado
    } catch (error) {
      console.error("Erro ao gerar convite:", error);
    }
  }

  const copyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      alert("Convite copiado para a área de transferência!");
    }}

  return (
    <div className="p-4">
      <button
        onClick={generateInvite}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Gerar Convite
      </button>

      {inviteLink && (
        <div className="mt-4">
          <p>Convite gerado </p>
          <a
            href={inviteLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500"
          >
          
          </a>
          <button
            onClick={copyToClipboard}
            className="ml-4 px-4 py-2 bg-green-500 text-white rounded"
          >
            Copiar Link
          </button>
        </div>
      )}
    </div>
  );
}

export default GenerateInvite;









// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../../services/api";

// const API_URL = api;

// const Convite = () => {
//   const { token } = useParams(); // Obtém o token da URL
//   const navigate = useNavigate();
//   const [message, setMessage] = useState("Validando convite...");

//   useEffect(() => {
//     const validateInvite = async () => {
//       try {
//         const response = await api.get(`${API_URL}/invite/${token}`);
//         console.log(response)
//         setMessage(response.data.message);

//         // Após 2 segundos, redireciona para o chat
//         setTimeout(() => navigate("/chat"), 2000);
//       } catch (error) {
//         setMessage("Convite inválido ou expirado.",error);
//       }
//     };

//     validateInvite();
//   }, [token, navigate]);

//   return (
//     <div className="flex justify-center items-center h-screen bg-black text-white">
//       <div className="p-6 bg-gray-800 rounded-lg shadow-lg text-center">
//         <h2 className="text-xl font-bold">{message}</h2>
//       </div>
//     </div>
//   );
// };

// export default Convite;
