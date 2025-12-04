import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth'; 
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer'; 

import { ModalProvider } from './context/ModalContext';

// --- Importación de Páginas ---
import Login from './components/auth/Login';
import Dashboard from './pages/Dashboard'; 
import SalasPublicas from './pages/SalasPublicas';
import Inicio from './pages/Inicio'; 
import DetalleSalaPage from './pages/DetalleSalaPage';
import SalasAdminPage from './pages/SalasAdminPage'; 
import AdminUsuariosPage from './pages/AdminUsuariosPage'; 
import GestionReservasPage from './pages/GestionReservasPage';
import ChatBot from './components/common/ChatBot';
import CalendarioPage from './components/common/CalendarioPage';


// Wrapper para rutas protegidas (Usuarios Logueados)
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;
    return isAuthenticated ? children : <Navigate to="/login" />;
};

// Wrapper para rutas de Admin
const AdminRoute = ({ children }) => {
    const { isAuthenticated, loading, isAdmin } = useAuth();
    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (isAdmin()) return children;
    return <Navigate to="/dashboard" />;
};

function App() {
    return (
        /* ✅ INTEGRACIÓN: El ModalProvider envuelve toda la app */
        <ModalProvider>
            <Router>
                <div className="App flex flex-col min-h-screen">
                    <Navbar />
                    
                    <div className="flex-grow pt-16 bg-gray-50">
                        <Routes>
                            {/* --- Rutas Públicas --- */}
                            <Route path="/" element={<Inicio />} /> 
                            <Route path="/nuestras-salas" element={<SalasPublicas />} />
                            
                            {/* --- RUTA DINÁMICA PARA EL DETALLE --- */}
                            <Route path="/salas/:id" element={<DetalleSalaPage />} />

                            <Route path="/login" element={<Login />} />
                            
                            {/* --- Rutas Protegidas (Dashboard) --- */}
                            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                            <Route path="/gestion-reservas" element={<ProtectedRoute><GestionReservasPage /></ProtectedRoute>} />
                            <Route path="/cajero/calendario" element={<CalendarioPage />} /> 
                            
                            {/* --- Rutas de Admin --- */}
                            <Route path="/salas-admin" element={<AdminRoute><SalasAdminPage /></AdminRoute>} />
                            <Route path="/admin/users" element={<AdminRoute><AdminUsuariosPage /></AdminRoute>} />
                            
                            {/* --- 404 --- */}
                            <Route path="*" element={<div className="text-center p-20 text-xl font-medium text-gray-500">404 | Página no encontrada</div>} />
                        </Routes>
                    </div>

                    <Footer />
                    <ChatBot />
                </div>
            </Router>
        </ModalProvider>
    );
}

export default App;