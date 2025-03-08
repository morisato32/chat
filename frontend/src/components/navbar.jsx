import { Link } from "react-router-dom";
import styles from '../components/nav.module.css'


const Navbar = () => {
    return (
      <div className={styles.containerNav}>
           <ul>
            
            <li>
                <Link to="/cadastro">Cadastro</Link>
                <Link to="/login">Login</Link>
            </li>
            </ul> 
            
      </div>
          
 
        
         
         
      
    );
  };
  
  export default Navbar;