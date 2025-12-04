import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { LogOut, LayoutDashboard, Calendar, Settings, Bell, Grid } from 'lucide-react'; 
import useToast from '../../hooks/useToast'; 

const NavLink = ({ to, children, icon: Icon }) => (
    <Link
        to={to}
        className="text-gray-300 hover:bg-indigo-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center transition duration-150"
    >
        {Icon && <Icon className="w-4 h-4 mr-2" />}
        {children}
    </Link>
);

const Navbar = () => {
    const { user, isAuthenticated, logout, isAdmin, isCajero, loading } = useAuth();
    const { success } = useToast();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        success('Sesión cerrada correctamente.');
        navigate('/login', { replace: true });
    };

    const username = user?.username || 'Invitado';
    const role = user?.role ? `(${user.role.charAt(0).toUpperCase() + user.role.slice(1)})` : '';
    
    if (loading) return null; 

    return (
        // 👇 AQUÍ ESTÁ EL CAMBIO: 'z-50' en lugar de 'z-10'
        <nav className="bg-indigo-800 shadow-xl fixed top-0 w-full z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0 flex items-center gap-4">
                        {/* Logo del sitio */}
                        <Link to="/" className="text-white text-xl font-bold tracking-wider">
                            <span className="text-indigo-300">R</span>eservas
                        </Link>
                        
                        {/* Enlace público a "Nuestras Salas" */}
                        <Link 
                            to="/nuestras-salas" 
                            className="text-indigo-200 hover:text-white text-sm font-medium flex items-center ml-4 transition"
                        >
                            <Grid className="w-4 h-4 mr-1"/> Ver Salas
                        </Link>
                    </div>

                    <div className="flex items-center">
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                
                                {/* Enlaces protegidos */}
                                {isAuthenticated && (
                                    <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
                                )}
                                
                                {isAdmin() && (
                                    <NavLink to="/salas-admin" icon={Settings}>Admin Salas</NavLink>
                                )}
                                {isCajero() && (
                                    <NavLink to="/gestion-reservas" icon={Calendar}>Gestión</NavLink>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center">
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-3">
                                <span className="text-gray-200 text-sm font-medium hidden sm:block">
                                    Hola, {username} <span className="text-indigo-300">{role}</span>
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="px-3 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md flex items-center"
                                >
                                    <LogOut className="w-4 h-4 mr-1" /> Salir
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md"
                            >
                                Iniciar sesión
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;