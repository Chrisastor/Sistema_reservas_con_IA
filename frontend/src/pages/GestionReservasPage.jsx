import React, { useState, useEffect, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import { reservaService, salaService } from '../services/api';
import { CheckCircle, XCircle, Calendar, Search, RefreshCw, Trash2, Clock, Eye, RotateCcw, Phone} from 'lucide-react';

// 👇 1. IMPORTAMOS EL HOOK DEL MODAL
import { useConfirm } from '../context/ModalContext';

// CORRECCIÓN: Eliminamos el '1' para evitar ambigüedad. Usamos solo el 7.
const ESTADOS = {
    7: "PENDIENTE",
    8: "CONFIRMADA",
    9: "CANCELADA"
};

const GestionReservasPage = () => {
    const { isCajero, isAdmin } = useAuth(); 
    const { success, error } = useToast();
    
    // 👇 2. ACTIVAMOS EL MODAL
    const { confirm } = useConfirm();

    const [reservas, setReservas] = useState([]);
    const [filteredReservas, setFilteredReservas] = useState([]);
    const [salasMap, setSalasMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [showRawData, setShowRawData] = useState(false);

    // Filtros
    const [filterStatus, setFilterStatus] = useState('TODAS');
    const [filterDate, setFilterDate] = useState('');
    const [searchTerm, setSearchTerm] = useState("");
    
    const canManage = isCajero() || isAdmin(); 

    // --- HELPERS ---
    const formatFecha = (iso) => iso ? new Date(iso).toLocaleDateString() : "---";
    const formatHora = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--";

    const getNombreEstado = (estadoData) => {
        if (estadoData === null || estadoData === undefined) return "PENDIENTE";
        if (typeof estadoData === 'number') return ESTADOS[estadoData] || `ID: ${estadoData}`;
        if (typeof estadoData === 'object' && estadoData?.nombre) return estadoData.nombre.toUpperCase();
        if (typeof estadoData === 'string') return estadoData.toUpperCase();
        return "DESCONOCIDO";
    };

    // --- CARGA DE DATOS ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        setApiError(null);
        try {
            // 1. Cargar Salas para el mapa de nombres
            const sRes = await salaService.getAll();
            const sArr = Array.isArray(sRes.data) ? sRes.data : (sRes.data?.results || []);
            const map = {};
            sArr.forEach(s => map[s.id] = s.nombre);
            setSalasMap(map);

            // 2. Cargar Reservas
            const rRes = await reservaService.getAll(); 
            let rArr = [];
            if (Array.isArray(rRes.data)) rArr = rRes.data;
            else if (rRes.data?.results) rArr = rRes.data.results;
            else if (rRes.data?.reservas) rArr = rRes.data.reservas;

            // Ordenar: Pendientes primero, luego por fecha más reciente
            rArr.sort((a, b) => {
                const nombreA = getNombreEstado(a.estado);
                const nombreB = getNombreEstado(b.estado);
                if (nombreA === 'PENDIENTE' && nombreB !== 'PENDIENTE') return -1;
                if (nombreA !== 'PENDIENTE' && nombreB === 'PENDIENTE') return 1;
                return new Date(b.creada_en || b.fecha_inicio) - new Date(a.creada_en || a.fecha_inicio);
            });

            setReservas(rArr);
            setFilteredReservas(rArr); 
        } catch (e) {
            console.error(e);
            setApiError(e.message || "Error de conexión");
        } finally {
            setLoading(false);
        }
    }, []); 

    useEffect(() => { if (canManage) fetchData(); }, [canManage, fetchData]);

    // --- LÓGICA DE FILTRADO ---
    useEffect(() => {
        let result = reservas;
        
        if (filterStatus !== 'TODAS') {
            result = result.filter(r => getNombreEstado(r.estado) === filterStatus);
        }
        
        if (filterDate) {
            result = result.filter(r => r.fecha_inicio && r.fecha_inicio.startsWith(filterDate));
        }
        
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(r => {
                const n = r.solicitante_nombre || '';
                const e = r.solicitante_email || '';
                return n.toLowerCase().includes(lower) || e.toLowerCase().includes(lower);
            });
        }
        setFilteredReservas(result);
    }, [reservas, filterStatus, filterDate, searchTerm]);

    // --- ACCIONES CON MODAL ---
    
    const handleStatusChange = (id, nuevoEstadoNombre) => {
        // CORRECCIÓN: Buscamos el ID exacto. Al haber quitado el '1', ahora encontrará el '7'.
        let targetID = Object.keys(ESTADOS).find(key => ESTADOS[key] === nuevoEstadoNombre);
        if (targetID) targetID = parseInt(targetID);

        if (!targetID) {
            error("Error: Estado desconocido");
            return;
        }

        confirm({
            title: `Cambiar estado a ${nuevoEstadoNombre}`,
            message: `¿Estás seguro de cambiar esta reserva a "${nuevoEstadoNombre}"?`,
            confirmText: 'Sí, cambiar',
            isDanger: nuevoEstadoNombre === 'CANCELADA',
            onConfirm: async () => {
                try {
                    // Intentamos update genérico primero
                    if (reservaService.update) {
                        await reservaService.update(id, { estado: targetID });
                    } 
                    // Fallbacks a métodos específicos si existen
                    else if (nuevoEstadoNombre === 'CONFIRMADA' && reservaService.confirm) {
                        await reservaService.confirm(id);
                    } else if (nuevoEstadoNombre === 'CANCELADA' && reservaService.cancel) {
                        await reservaService.cancel(id);
                    }
                    
                    success(`Estado actualizado a: ${nuevoEstadoNombre}`);
                    fetchData(); 
                } catch (e) {
                    console.error(e);
                    error("No se pudo cambiar el estado. Verifique conexión.");
                }
            }
        });
    };

    const handleDelete = (id) => {
        confirm({
            title: '¿Eliminar reserva permanentemente?',
            message: 'Esta acción no se puede deshacer. Se borrará de la base de datos.',
            confirmText: 'Sí, eliminar',
            isDanger: true,
            onConfirm: async () => {
                try {
                    await reservaService.delete(id); 
                    success("Registro eliminado");
                    fetchData(); 
                } catch (e) { 
                    error("Error al eliminar"); 
                }
            }
        });
    };
    
    if (!canManage) return <div className="p-10 text-center text-red-600 font-bold">Acceso Denegado</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen bg-gray-50">
            
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                        <Calendar className="w-8 h-8 mr-3 text-indigo-600" /> Gestión de Reservas
                    </h1>
                    <p className="text-gray-500 mt-1">Panel de Administración</p>
                </div>
                <button onClick={fetchData} className="bg-white border px-4 py-2 rounded-lg hover:bg-gray-50 shadow-sm flex items-center transition hover:shadow-md">
                    <RefreshCw className="w-4 h-4 mr-2" /> Actualizar
                </button>
            </div>

            {apiError && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
                    <b>Error:</b> {apiError}
                </div>
            )}

            {/* Panel de Filtros */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Buscar</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Cliente o Email..." 
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)} 
                                className="w-full pl-9 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
                        <select 
                            value={filterStatus} 
                            onChange={e => setFilterStatus(e.target.value)} 
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="TODAS">Todas</option>
                            <option value="PENDIENTE">Pendientes</option>
                            <option value="CONFIRMADA">Confirmadas</option>
                            <option value="CANCELADA">Canceladas</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Fecha</label>
                        <input 
                            type="date" 
                            value={filterDate} 
                            onChange={e => setFilterDate(e.target.value)} 
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div className="flex items-end">
                        <button 
                            onClick={() => {setFilterStatus('TODAS'); setFilterDate(''); setSearchTerm('')}} 
                            className="w-full bg-gray-100 py-2 rounded-lg border border-gray-300 hover:bg-gray-200 text-sm transition"
                        >
                            Limpiar Filtros
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabla de Resultados */}
            {loading ? (
                <div className="flex justify-center h-64 items-center">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Sala</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Horario</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Solicitante</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Contacto</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredReservas.length > 0 ? (
                                    filteredReservas.map((res) => {
                                        const nombreEstado = getNombreEstado(res.estado);
                                        const phoneLink = res.solicitante_telefono 
                                            ? `https://wa.me/${res.solicitante_telefono.replace(/[^0-9]/g, '')}` 
                                            : null;

                                        return (
                                            <tr key={res.id} className={`transition duration-150 ${nombreEstado === 'PENDIENTE' ? 'bg-yellow-50' : 'hover:bg-indigo-50/30'}`}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold mr-3 text-xs">
                                                            {typeof res.sala === 'object' ? res.sala.nombre.charAt(0) : 'S'}
                                                        </div>
                                                        <div className="text-sm font-bold text-gray-900">
                                                            {typeof res.sala === 'object' ? res.sala.nombre : (salasMap[res.sala] || `Sala #${res.sala}`)}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 flex items-center font-medium">
                                                        <Calendar className="w-3 h-3 mr-1 text-gray-400"/> {formatFecha(res.fecha_inicio)}
                                                    </div>
                                                    <div className="text-xs text-indigo-600 mt-1 font-medium bg-indigo-50 inline-block px-2 py-0.5 rounded">
                                                        <Clock className="w-3 h-3 mr-1 inline"/> {formatHora(res.fecha_inicio)} - {formatHora(res.fecha_fin)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 font-medium">{res.solicitante_nombre || "Anónimo"}</div>
                                                    <div className="text-xs text-gray-500">{res.solicitante_email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {phoneLink ? (
                                                        <a 
                                                            href={phoneLink} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center justify-center p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition hover:scale-110"
                                                            title={`WhatsApp: ${res.solicitante_telefono}`}
                                                        >
                                                            <Phone className="w-4 h-4"/>
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-300">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full border flex items-center justify-center w-28 mx-auto shadow-sm ${
                                                        nombreEstado === 'CONFIRMADA' ? 'bg-green-100 text-green-800 border-green-200' : 
                                                        nombreEstado === 'CANCELADA' ? 'bg-red-100 text-red-800 border-red-200' : 
                                                        'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                    }`}>
                                                        {nombreEstado}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center space-x-2">
                                                        {nombreEstado === 'PENDIENTE' && (
                                                            <>
                                                                <button onClick={() => handleStatusChange(res.id, 'CONFIRMADA')} className="bg-green-600 text-white p-1.5 rounded-lg hover:bg-green-700 shadow-md transition hover:scale-105" title="Confirmar">
                                                                    <CheckCircle className="w-4 h-4"/>
                                                                </button>
                                                                <button onClick={() => handleStatusChange(res.id, 'CANCELADA')} className="bg-red-600 text-white p-1.5 rounded-lg hover:bg-red-700 shadow-md transition hover:scale-105" title="Rechazar">
                                                                    <XCircle className="w-4 h-4"/>
                                                                </button>
                                                            </>
                                                        )}
                                                        {nombreEstado !== 'PENDIENTE' && (
                                                            <>
                                                                {nombreEstado === 'CONFIRMADA' && (
                                                                    <button onClick={() => handleStatusChange(res.id, 'CANCELADA')} className="text-red-500 hover:bg-red-50 p-1.5 rounded border border-red-200 transition" title="Cancelar">
                                                                        <XCircle className="w-4 h-4"/>
                                                                    </button>
                                                                )}
                                                                {nombreEstado === 'CANCELADA' && (
                                                                    <button onClick={() => handleStatusChange(res.id, 'CONFIRMADA')} className="text-green-500 hover:bg-green-50 p-1.5 rounded border border-green-200 transition" title="Reactivar">
                                                                        <CheckCircle className="w-4 h-4"/>
                                                                    </button>
                                                                )}
                                                                {isAdmin() && (
                                                                    <button onClick={() => handleStatusChange(res.id, 'PENDIENTE')} className="text-yellow-600 hover:bg-yellow-50 p-1.5 ml-1 rounded border border-yellow-200 transition" title="Volver a Pendiente">
                                                                        <RotateCcw className="w-4 h-4"/>
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                        {isAdmin() && (
                                                            <button onClick={() => handleDelete(res.id)} className="text-gray-400 hover:text-red-600 p-1.5 ml-2 transition" title="Borrar BD">
                                                                <Trash2 className="w-4 h-4"/>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr><td colSpan="6" className="p-16 text-center text-gray-500 italic">No hay reservas para mostrar.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="mt-8 border-t pt-4">
                <button onClick={() => setShowRawData(!showRawData)} className="text-xs text-gray-500 hover:text-indigo-600 underline flex items-center transition">
                    <Eye className="w-3 h-3 mr-1"/> {showRawData ? "Ocultar JSON" : "Ver JSON Crudo"}
                </button>
                {showRawData && <div className="mt-2 p-4 bg-gray-900 text-green-400 rounded text-xs font-mono overflow-x-auto shadow-inner"><pre>{JSON.stringify(reservas.slice(0, 2), null, 2)}</pre></div>}
            </div>
        </div>
    );
};

export default GestionReservasPage;