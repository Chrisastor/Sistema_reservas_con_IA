import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast'; 
import { LogIn, User, Lock } from 'lucide-react'; // Iconos

const Login = () => {
    // Estado para la carga del botón (lo añadimos para UX)
    const [loadingButton, setLoadingButton] = useState(false); 
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    const { login, isAuthenticated } = useAuth();
    const { success, error } = useToast();
    const navigate = useNavigate();

    // Redirigir al dashboard si ya está autenticado
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingButton(true); // Activar carga

        try {
            await login(username, password);
            success("¡Inicio de sesión exitoso!");
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 
                                 err.response?.data?.non_field_errors?.[0] || 
                                 'Credenciales incorrectas o error de conexión.';
            
            error(errorMessage);
        } finally {
            setLoadingButton(false); // Desactivar carga
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            {/* Tarjeta de Login mejorada: sombras, bordes redondeados, hover effect */}
            <div className="max-w-md w-full p-8 space-y-8 bg-white shadow-2xl rounded-xl border border-gray-200 transform hover:scale-[1.01] transition duration-300">
                <div className="text-center">
                    <LogIn className="w-10 h-10 mx-auto text-indigo-600 mb-2" />
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Acceso al Sistema
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Ingrese sus credenciales para acceder a la gestión.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    
                    {/* Campo Nombre de Usuario */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre de Usuario
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-400" />
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                placeholder="ej: admin / cajero"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loadingButton}
                            />
                        </div>
                    </div>

                    {/* Campo Contraseña */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Contraseña
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-400" />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loadingButton}
                            />
                        </div>
                    </div>

                    {/* Botón de Submit con animación de carga */}
                    <div>
                        <button
                            type="submit"
                            disabled={loadingButton}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-lg font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg transition duration-150 ease-in-out disabled:bg-indigo-400 disabled:cursor-not-allowed"
                        >
                            {loadingButton ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;