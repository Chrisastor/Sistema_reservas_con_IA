import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext'; // Importa la constante del contexto
import { authService } from '../services/api';
import axios from 'axios';
import { 
    setAuthData, 
    clearAuth, 
    getAccessToken, 
    getCurrentUser,
    isAuthenticated as isLocalAuthenticated 
} from './AuthUtils'; 

// URL de info del usuario (usada para la llamada manual)
const USER_INFO_URL = "http://127.0.0.1:8000/api/user-info/"; 

// Componente Provider (exportado por defecto al final)
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getCurrentUser());
    const [loading, setLoading] = useState(true);

    // Función para obtener la información del usuario de forma manual
    const fetchUserInfo = async (accessToken) => {
        const response = await axios.get(USER_INFO_URL, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return response.data;
    };

    const checkAuthStatus = useCallback(() => {
        const token = getAccessToken();
        if (token && getCurrentUser()) {
            setUser(getCurrentUser()); 
        } else {
            clearAuth();
            setUser(null);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    /** Inicia sesión, obtiene tokens, y recupera info del usuario. */
    const login = useCallback(async (username, password) => {
        setLoading(true);
        try {
            // 1. Obtener tokens
            const { access, refresh } = await authService.login(username, password);
            
            // 2. Llama manual y autorizada a /user-info/
            const userInfo = await fetchUserInfo(access);
            
            // 3. Guardar todo
            setAuthData(access, refresh, userInfo);
            
            // 4. CORRECCIÓN CRÍTICA: Esperar 50ms para que el navegador sincronice localStorage 
            // y el interceptor pueda leer el token antes de la redirección.
            await new Promise(resolve => setTimeout(resolve, 50)); 

            setUser(userInfo);
            setLoading(false);
            return true;
        } catch (error) {
            console.error('Error al iniciar sesión:', error.response?.data || error.message);
            clearAuth();
            setUser(null);
            setLoading(false);
            throw error; 
        }
    }, []);

    /** Cierra sesión y limpia el almacenamiento. */
    const logout = useCallback(() => {
        clearAuth(); 
        setUser(null); 
    }, []);
    
    const contextValue = {
        user,
        isAuthenticated: isLocalAuthenticated(), 
        loading,
        login,
        logout,
        isAdmin: () => user?.role === 'admin',
        isCajero: () => user?.role === 'cajero',
        isUsuario: () => user?.role === 'usuario',
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
