import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

function BoasVindas() {
const nomeUsuario = sessionStorage.getItem('name')

    return (
        <div>
            <h1>Bem vindo {nomeUsuario} entre no <Link to='/chat'>batePapo</Link></h1>

            
        </div>
    );
}

export default BoasVindas;