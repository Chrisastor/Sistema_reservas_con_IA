import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { salaService, reservaService } from '../services/api';
import useToast from '../hooks/useToast';
import useAuth from '../hooks/useAuth'; 
import { Users, Calendar, CheckCircle, ArrowLeft, Clock, User, UserX, AlertTriangle, Phone } from 'lucide-react';

// 👇 1. IMPORTAR EL HOOK DEL MODAL
import { useConfirm } from '../context/ModalContext';

// Configuración: ID 7 = PENDIENTE
const ESTADO_INICIAL_ID = 7; 
const HORA_APERTURA = "09:00";
const HORA_CIERRE = "21:00";

const DetalleSalaPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { success, error } = useToast();
    const { user, isAuthenticated } = useAuth(); 
    
    // 👇 2. ACTIVAR EL MODAL
    const { confirm } = useConfirm();

    const [sala, setSala] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState(false);
    
    const [formData, setFormData] = useState({
        nombre: user?.nombre || "", 
        correo: user?.email || "", 
        telefono: "", // <--- AQUÍ SE GUARDA LO QUE ESCRIBE EL USUARIO
        fecha: "", 
        hora_inicio: "", 
        hora_fin: "", 
        personas: 1,
    });

    // --- CARGAR SALA ---
    useEffect(() => {
        const fetchSala = async () => {
            setLoading(true);
            setLoadError(null);
            try {
                const response = await salaService.getAll();
                
                let salasData = [];
                if (Array.isArray(response.data)) salasData = response.data;
                else if (response.data?.results) salasData = response.data.results;

                const found = salasData.find(s => String(s.id) === String(id));
                
                if (found) {
                    setSala(found);
                } else {
                    throw new Error(`No se encontró la sala con ID ${id}`);
                }
            } catch (e) {
                console.error(e);
                setLoadError(e.message);
                error("Error al cargar detalles de la sala."); 
            } finally {
                setLoading(false);
            }
        };
        fetchSala();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setIsAvailable(false); 
    };

    // --- LÓGICA DE LIMPIEZA Y TRANSFORMACIÓN ---
    const formatPhoneNumber = (phone) => {
        // 1. Quitar basura (espacios, guiones, paréntesis)
        // Ejemplo: "(9) 1234-5678" -> "912345678"
        let cleaned = phone.replace(/[^0-9+]/g, '');
        
        // 2. Si no tiene el +, y parece un número chileno (9 dígitos), agregar +56
        if (!cleaned.startsWith('+')) {
            if (cleaned.length === 9) {
                return `+56${cleaned}`;
            }
            // Si tiene otro largo, por seguridad le agregamos +56 igual
            return `+56${cleaned}`;
        }
        return cleaned;
    };

    const validarHorario = () => {
        const { hora_inicio, hora_fin } = formData;
        if (!hora_inicio || !hora_fin) { error("Faltan horas."); return false; }
        if (hora_inicio < HORA_APERTURA || hora_inicio >= HORA_CIERRE) { error(`Horario: ${HORA_APERTURA} a ${HORA_CIERRE}`); return false; }
        if (hora_fin > HORA_CIERRE || hora_fin <= HORA_APERTURA) { error(`Cierre máximo: ${HORA_CIERRE}`); return false; }
        if (hora_inicio >= hora_fin) { error("Inicio debe ser antes del fin."); return false; }
        return true;
    };

    const checkAvailability = async () => {
        if (!formData.fecha) { error("Falta fecha."); return; }
        if (!validarHorario()) return;
        setIsChecking(true);
        setTimeout(() => { setIsChecking(false); setIsAvailable(true); success("Disponible"); }, 500);
    };

    // --- 👇 3. ENVÍO DEL FORMULARIO CON TRANSFORMACIÓN ---
    const handleReservaSubmit = (e) => {
        e.preventDefault();
        
        if (!validarHorario()) return;
        if (!isAvailable) return error("Primero verifica la disponibilidad.");

        // APLICAMOS LA TRANSFORMACIÓN AQUÍ
        const cleanPhone = formatPhoneNumber(formData.telefono);

        // Abrir Modal mostrando el número LIMPIO para que el usuario confirme
        confirm({
            title: 'Confirmar Reserva',
            message: `¿Estás seguro de reservar la sala "${sala.nombre}" para el ${formData.fecha}? Te contactaremos al WhatsApp: ${cleanPhone}`,
            confirmText: 'Sí, Reservar',
            onConfirm: async () => {
                try {
                    const payload = {
                        sala: parseInt(id),
                        fecha_inicio: `${formData.fecha}T${formData.hora_inicio}:00`, 
                        fecha_fin: `${formData.fecha}T${formData.hora_fin}:00`,
                        solicitante_nombre: formData.nombre,
                        solicitante_email: formData.correo,
                        solicitante_telefono: cleanPhone, // <--- SE ENVÍA EL NÚMERO YA FORMATEADO (+569...)
                        usuario: isAuthenticated && user ? user.id : null, 
                        estado: ESTADO_INICIAL_ID 
                    };

                    await reservaService.create(payload); 
                    success(`¡Solicitud enviada! Revisa tu WhatsApp.`);
                    navigate('/'); 
                } catch (apiError) {
                    console.error(apiError);
                    error("Hubo un problema al crear la reserva.");
                }
            }
        });
    };

    // --- RENDERIZADO ---
    
    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="w-12 h-12 border-4 border-indigo-600 rounded-full animate-spin"></div>
        </div>
    );

    if (loadError || !sala) return (
        <div className="min-h-screen bg-gray-50 pt-32 px-4 text-center">
            <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4"/>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No pudimos cargar la sala</h2>
                <p className="text-gray-600 mb-6">Detalle del error: {loadError}</p>
                <button onClick={() => navigate('/nuestras-salas')} className="bg-indigo-600 text-white px-6 py-2 rounded-lg">
                    Volver al Catálogo
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* INFO SALA */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                        <div className="h-72 w-full bg-gray-200 relative">
                             <img src={sala.imagen || "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80"} className="w-full h-full object-cover" alt="Sala"/>
                             <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded-lg text-sm font-bold text-indigo-900 shadow-sm">{sala.ubicacion}</div>
                        </div>
                        <div className="p-8">
                            <h1 className="text-3xl font-bold text-gray-900">{sala.nombre}</h1>
                            <p className="text-gray-600 mt-4 text-lg leading-relaxed">{sala.descripcion}</p>
                            <div className="mt-6 flex flex-wrap gap-4">
                                <span className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-sm font-medium"><Users className="w-4 h-4 mr-2"/> {sala.capacidad} Pax</span>
                                <span className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm font-medium"><Clock className="w-4 h-4 mr-2"/> {HORA_APERTURA} - {HORA_CIERRE}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FORMULARIO */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 border border-indigo-50">
                        <button onClick={() => navigate(-1)} className="mb-4 flex items-center text-gray-400 hover:text-indigo-600 text-sm font-medium transition"><ArrowLeft className="w-4 h-4 mr-1"/> Volver</button>
                        
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center"><Calendar className="w-6 h-6 mr-2 text-indigo-600"/> Reservar</h3>
                            {isAuthenticated ? 
                                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full flex items-center"><User className="w-3 h-3 mr-1"/> {user.nombre || 'Usuario'}</span> : 
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center"><UserX className="w-3 h-3 mr-1"/> Invitado</span>
                            }
                        </div>
                        
                        <form onSubmit={handleReservaSubmit} className="space-y-4">
                            <input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre Completo" className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                            <input name="correo" type="email" value={formData.correo} onChange={handleChange} placeholder="Correo Electrónico" className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                            
                            {/* INPUT DE WHATSAPP MEJORADO (CON ICONO VERDE) */}
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-green-600" />
                                <input 
                                    name="telefono" 
                                    type="tel" 
                                    value={formData.telefono} 
                                    onChange={handleChange} 
                                    placeholder="WhatsApp (ej: 912345678)" 
                                    className="w-full pl-9 border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-green-500 outline-none" 
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1 ml-1">Te contactaremos a este número.</p>
                            
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <div><label className="text-xs text-gray-500 mb-1 block">Fecha</label><input name="fecha" type="date" value={formData.fecha} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded text-sm" required /></div>
                                <div><label className="text-xs text-gray-500 mb-1 block">Asistentes</label><input name="personas" type="number" min="1" max={sala.capacidad} value={formData.personas} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded text-sm" required /></div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-xs text-gray-500 mb-1 block">Inicio</label><input name="hora_inicio" type="time" min={HORA_APERTURA} max={HORA_CIERRE} value={formData.hora_inicio} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded text-sm" required /></div>
                                <div><label className="text-xs text-gray-500 mb-1 block">Fin</label><input name="hora_fin" type="time" min={HORA_APERTURA} max={HORA_CIERRE} value={formData.hora_fin} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded text-sm" required /></div>
                            </div>

                            <button type="button" onClick={checkAvailability} disabled={isChecking} className="w-full py-3 rounded-lg font-semibold flex justify-center items-center transition mt-4 bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200">
                                {isChecking ? "Validando..." : "Verificar Disponibilidad"}
                            </button>

                            {isAvailable && (
                                <div className="animate-in fade-in slide-in-from-top-2 pt-2">
                                    <div className="text-xs text-green-600 text-center mb-3 flex items-center justify-center bg-green-50 py-2 rounded border border-green-100"><CheckCircle className="w-3 h-3 mr-1"/> Horario válido</div>
                                    <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-lg font-bold hover:bg-indigo-700 shadow-lg transition">Enviar Solicitud</button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleSalaPage;