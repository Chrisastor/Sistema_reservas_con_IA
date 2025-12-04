// El hook que los componentes usarán para acceder al contexto
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Importa la constante del contexto

const useAuth = () => {
    return useContext(AuthContext);
};

export default useAuth;