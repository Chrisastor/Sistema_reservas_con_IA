import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import { salaService } from "../services/api"; 
import { Users, MapPin, Wifi, Filter } from 'lucide-react';

const SalasPublicas = () => { 
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
        try {
            const response = await salaService.getAll();
            const data = Array.isArray(response.data) ? response.data : response.data.results || [];
            // Filtramos solo las que están disponibles (status true)
            setSalas(data.filter(s => s.disponible));
        } catch (error) {
            console.error("Error cargando catálogo", error);
        } finally {
            setLoading(false);
        }
    };
    loadAll();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-32 px-4">
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b pb-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Nuestro Catálogo Completo</h1>
                    <p className="text-gray-500">Explora todas nuestras opciones disponibles para reservar hoy mismo.</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center bg-white px-4 py-2 rounded-full shadow-sm text-sm text-gray-600">
                    <Filter className="w-4 h-4 mr-2"/> {salas.length} salas encontradas
                </div>
            </div>
            
            {loading ? (
                <div className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <p className="mt-2 text-gray-500">Cargando salas...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {salas.map((sala) => (
                        <div key={sala.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col">
                            <div className="relative h-48">
                                <img 
                                    src={sala.imagen || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=60"} 
                                    alt={sala.nombre} 
                                    className="h-full w-full object-cover"
                                />
                                <span className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Disponible</span>
                            </div>
                            
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="font-bold text-gray-900 text-lg">{sala.nombre}</h3>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2 mb-4">{sala.descripcion || "Sin descripción disponible."}</p>
                                
                                <div className="flex items-center gap-4 mb-4 text-xs text-gray-600">
                                    <span className="flex items-center"><Users className="w-3 h-3 mr-1 text-indigo-500"/> {sala.capacidad} Pax</span>
                                    <span className="flex items-center"><Wifi className="w-3 h-3 mr-1 text-indigo-500"/> WiFi Incluido</span>
                                </div>
                                
                                <Link 
                                    to={`/salas/${sala.id}`} 
                                    className="mt-auto w-full bg-gray-900 text-white text-center py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                                >
                                    Ver Disponibilidad
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default SalasPublicas;