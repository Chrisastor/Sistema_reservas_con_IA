import React from 'react';
import useAuth from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { Settings, LayoutDashboard, Calendar, Bell, Users, Clock, FileText } from 'lucide-react';

const Card = ({ title, content, link, linkText, icon: Icon, color }) => (
    <div className={`p-6 bg-white rounded-xl shadow-lg border-t-4 border-${color}-500 transition duration-300 hover:shadow-xl hover:-translate-y-1 transform`}>
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
            {Icon && <div className={`p-3 bg-${color}-50 rounded-full`}><Icon className={`w-6 h-6 text-${color}-600`} /></div>}
        </div>
        <p className="text-gray-600 mb-6 text-sm min-h-[40px]">{content}</p>
        {link && (
            <Link to={link} className={`inline-flex items-center text-${color}-600 hover:text-${color}-800 font-semibold text-sm transition`}>
                {linkText}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </Link>
        )}
    </div>
);

const Dashboard = () => {
    const { user, isAdmin, isCajero } = useAuth();

    if (!user) {
        return <div className="p-10 text-center"><div className="w-12 h-12 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin mx-auto"></div></div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-2">Bienvenido, <span className="font-bold text-indigo-600">{user.username}</span> ({user.role.toUpperCase()}).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                {/* --- PANEL DE ADMINISTRADOR --- */}
                {isAdmin() && (
                    <>
                        <Card 
                            title="Salas y Espacios"
                            content="Administra la disponibilidad, capacidad y detalles de las salas."
                            link="/salas-admin"
                            linkText="Gestionar Salas"
                            icon={Settings}
                            color="red"
                        />
                        <Card 
                            title="Usuarios y Cajeros"
                            content="Registra nuevos cajeros y gestiona el acceso del personal."
                            link="/admin/users"
                            linkText="Gestionar Usuarios"
                            icon={Users}
                            color="indigo"
                        />
                        {/* TARJETA MEJORADA PARA ADMIN: */}
                        <Card 
                            title="Control de Reservas"
                            content="Visualiza el historial completo, filtra por fechas y gestiona estados."
                            link="/gestion-reservas"
                            linkText="Ver Reporte Completo"
                            icon={FileText}
                            color="orange"
                        />
                    </>
                )}

                {/* --- PANEL DE CAJERO --- */}
                {isCajero() && (
                    <>
                        <Card 
                            title="Solicitudes Pendientes"
                            content="Revisa y procesa las nuevas solicitudes de reserva."
                            link="/gestion-reservas"
                            linkText="Ir a Gestión"
                            icon={Bell}
                            color="yellow"
                        />
                        <Card 
                            title="Calendario"
                            content="Consulta rápida de ocupación diaria."
                            link="/cajero/calendario"
                            linkText="Ver Calendario"
                            icon={Clock}
                            color="green"
                        />
                    </>
                )}

                {/* --- COMÚN: NUEVA RESERVA --- */}
                <Card 
                    title="Nueva Reserva"
                    content="Crear una solicitud de reserva manualmente."
                    link="/reservar"
                    linkText="Crear Reserva"
                    icon={Calendar}
                    color="blue"
                />
            </div>
        </div>
    );
};

export default Dashboard;