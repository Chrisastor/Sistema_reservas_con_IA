import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom"; 
import { salaService } from "../services/api"; 
import useAuth from "../hooks/useAuth"; 
import { Users, MapPin, Clock, Shield, Star, ArrowRight } from 'lucide-react';

const Inicio = () => { 
  const { isAuthenticated } = useAuth();
  const [salasDestacadas, setSalasDestacadas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDestacadas = async () => {
        try {
            const response = await salaService.getAll();
            const data = Array.isArray(response.data) ? response.data : response.data.results || [];
            // Lógica de negocio: Solo disponibles y tomamos las primeras 3 para la portada
            setSalasDestacadas(data.filter(s => s.disponible).slice(0, 3));
        } catch (error) {
            console.error("Error cargando destacadas", error);
        } finally {
            setLoading(false);
        }
    };
    loadDestacadas();
  }, []);
  
  // Si es admin o usuario logueado, quizás prefieras enviarlo al dashboard
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* --- HERO SECTION --- */}
      <div className="relative bg-indigo-900 pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            className="w-full h-full object-cover opacity-20" 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
            alt="Oficina moderna" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/90 to-indigo-900/50 mix-blend-multiply" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
            <span className="block">Tu espacio de trabajo,</span>
            <span className="block text-indigo-400">listo cuando tú lo estés.</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Gestiona, reserva y organiza tus reuniones con la plataforma más ágil del mercado. Sin llamadas, sin esperas.
          </p>
          <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
              <Link 
                to="/nuestras-salas"
                className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 shadow-lg transform transition hover:-translate-y-1"
              >
                Ver Catálogo Completo
              </Link>
          </div>
        </div>
      </div>

      {/* --- BENEFICIOS --- */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="p-6 bg-gray-50 rounded-xl"><Clock className="w-10 h-10 mx-auto text-indigo-500 mb-4"/><h3 className="text-lg font-bold">Reserva Rápida</h3><p className="text-gray-500 mt-2">Sin llamadas, todo el proceso es online y al instante.</p></div>
                <div className="p-6 bg-gray-50 rounded-xl"><Shield className="w-10 h-10 mx-auto text-indigo-500 mb-4"/><h3 className="text-lg font-bold">Espacios Seguros</h3><p className="text-gray-500 mt-2">Acceso controlado y ambientes sanitizados.</p></div>
                <div className="p-6 bg-gray-50 rounded-xl"><Star className="w-10 h-10 mx-auto text-indigo-500 mb-4"/><h3 className="text-lg font-bold">Premium</h3><p className="text-gray-500 mt-2">La mejor tecnología y mobiliario ergonómico.</p></div>
            </div>
        </div>
      </div>

      {/* --- SALAS DESTACADAS --- */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-gray-900">Salas Destacadas</h2>
                <p className="mt-2 text-gray-500">Una selección de nuestros mejores espacios.</p>
            </div>

            {loading ? (
                <div className="flex justify-center"><div className="w-8 h-8 border-4 border-indigo-600 rounded-full animate-spin"></div></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {salasDestacadas.map((sala) => (
                    <div key={sala.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all flex flex-col group">
                        <div className="h-48 overflow-hidden relative">
                            <img 
                                src={sala.imagen || `https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=500&q=60`} 
                                alt={sala.nombre} 
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                            />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-indigo-600">Destacada</div>
                        </div>
                        <div className="p-6 flex-grow flex flex-col">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{sala.nombre}</h3>
                            <div className="text-sm text-gray-600 mb-4 space-y-2">
                               <p className="flex items-center"><Users className="w-4 h-4 mr-2 text-indigo-500"/> Capacidad: {sala.capacidad} personas</p>
                               <p className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-indigo-500"/> {sala.ubicacion || 'Sede Central'}</p>
                            </div>
                            
                            {/* ENLACE AL DETALLE (No abre modal, navega a nueva página) */}
                            <Link
                                to={`/salas/${sala.id}`}
                                className="mt-auto w-full flex items-center justify-center px-4 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition font-bold"
                            >
                                Ver Detalles y Reservar <ArrowRight className="ml-2 w-4 h-4"/>
                            </Link>
                        </div>
                    </div>
                ))}
                </div>
            )}
            
            <div className="text-center mt-12">
                 <Link to="/nuestras-salas" className="text-indigo-600 font-semibold hover:text-indigo-800">Ver todas las salas disponibles &rarr;</Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Inicio;