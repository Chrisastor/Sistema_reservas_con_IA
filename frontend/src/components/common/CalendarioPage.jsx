import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';


// ⚠️ Asegúrate de que esta ruta sea correcta según tu estructura
import { reservaService, salaService } from '../../services/api'; 

// Configuración de idioma
moment.locale('es');
const localizer = momentLocalizer(moment);

// --- 1. CONFIGURACIÓN VISUAL (Mensajes y Formatos) ---

const messages = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'No hay reservas en este rango',
};

// Formatos para limpiar la interfaz (24h y diseño limpio)
const formats = {
    // Eje izquierdo: "13:00" en lugar de "1:00 PM"
    timeGutterFormat: (date, culture, localizer) =>
        localizer.format(date, 'HH:mm', culture),
    
    // Rango en el evento: "13:00 - 15:00"
    eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
        `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`,
    
    // Encabezado de agenda: "13:00"
    agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
        `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`,
};


const CalendarioPage = () => {
    // --- 2. ESTADO CONTROLADO ---
    const [view, setView] = useState('month'); // Vista actual (mes, día, etc.)
    const [date, setDate] = useState(new Date()); // Fecha actual
    const [events, setEvents] = useState([]);
    const [resources, setResources] = useState([]); // Columnas (Salas)

    // Colores según estado
    const getEventColor = (estadoId) => {
        if (estadoId === 8) return '#10B981'; // Confirmada (Verde Esmeralda)
        if (estadoId === 7 || estadoId === 1) return '#F59E0B'; // Pendiente (Ambar)
        if (estadoId === 9) return '#EF4444'; // Cancelada (Rojo)
        return '#6366F1'; // Default (Indigo)
    };

    // --- 3. MANEJADORES DE NAVEGACIÓN ---
    const handleNavigate = (newDate) => setDate(newDate);
    const handleViewChange = (newView) => setView(newView);

    // Drilldown: Clic en el número del día -> Vista de Columnas por Sala
    const onDrillDown = useCallback((newDate) => {
        setDate(newDate);
        setView('day'); 
    }, []);


    // --- 4. CARGA DE DATOS ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // A. Cargar Salas (Recursos)
                const sRes = await salaService.getAll();
                const salasArray = Array.isArray(sRes.data) ? sRes.data : (sRes.data?.results || []);
                
                const resourcesMap = salasArray.map(sala => ({
                    id: sala.id,
                    title: sala.nombre 
                }));
                setResources(resourcesMap);

                // B. Cargar Reservas (Eventos)
                const rRes = await reservaService.getAll();
                const rawReservas = Array.isArray(rRes.data) ? rRes.data : (rRes.data?.results || rRes.data?.reservas);

                const formattedEvents = rawReservas
                    .filter(r => r.estado !== 9) // Opcional: filtrar canceladas
                    .map(r => {
                        const salaId = typeof r.sala === 'object' ? r.sala.id : r.sala;
                        return {
                            id: r.id,
                            title: r.solicitante_nombre || 'Anónimo',
                            start: new Date(r.fecha_inicio),
                            end: new Date(r.fecha_fin),
                            resourceId: salaId, // Vincula evento con columna
                            estado: r.estado,
                            desc: r.solicitante_email
                        };
                    });
                setEvents(formattedEvents);
            } catch (error) {
                console.error("Error cargando datos:", error);
            }
        };
        fetchData();
    }, []);

    // Estilos de los eventos
    const eventStyleGetter = (event) => {
        const backgroundColor = getEventColor(event.estado);
        return {
            style: {
                backgroundColor,
                borderRadius: '4px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                fontSize: '0.85rem'
            }
        };
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-6 flex items-center">
                📅 Disponibilidad de Salas
            </h1>
            
            <div className="bg-white p-4 rounded-xl shadow-lg h-[80vh]">
                <Calendar
                    localizer={localizer}
                    events={events}
                    
                    // --- CONTROL MANUAL ---
                    date={date}
                    view={view}
                    onNavigate={handleNavigate}
                    onView={handleViewChange}
                    onDrillDown={onDrillDown}

                    // --- RECURSOS (Columnas) ---
                    resources={resources}
                    resourceIdAccessor="id"
                    resourceTitleAccessor="title"
                    
                    // --- CONFIGURACIÓN VISUAL ---
                    formats={formats} // Aplicamos formato 24h
                    views={['month', 'day', 'agenda']} // 'day' muestra las columnas
                    
                    step={30}      // Intervalo lógico (30 min)
                    timeslots={2}  // Líneas visuales por hora (2 líneas = cada 30 min)
                    
                    // Horario visible (8:00 a 20:00)
                    min={new Date(0, 0, 0, 8, 0, 0)} 
                    max={new Date(0, 0, 0, 20, 0, 0)} 

                    messages={messages}
                    eventPropGetter={eventStyleGetter}
                    
                    // Personalizar encabezado de sala
                    resourceHeaderComponent={({ label }) => {
                        return <div className="text-indigo-700 font-bold py-1 text-sm uppercase tracking-wide">{label}</div>;
                    }}

                    onSelectEvent={event => alert(`Reserva de: ${event.title}\nEmail: ${event.desc}`)}
                />
            </div>
            <p className="text-center text-gray-400 text-xs mt-4">
                Tip: Haz clic en el día para ver la disponibilidad por sala.
            </p>
        </div>
    );
};

export default CalendarioPage;