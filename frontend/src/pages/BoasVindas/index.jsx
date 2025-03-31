import { useEffect, useState } from "react";
import { Link } from "react-router-dom";



const BoasVindas = () => {
 
  
  const [user, setUser] = useState(null);
  

  useEffect(() => {
    // Recupera o usuário logado do sessionStorage
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

   }, []);
  return (
    <div>
      <h1>Bem-vindo, {user?.name} vamos bater um <Link to = '/chat'>Papo</Link></h1>
     
    </div>
  );
};

export default BoasVindas;