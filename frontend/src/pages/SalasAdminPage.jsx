import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import { salaService } from '../services/api';
import { Edit, Trash2, Plus, X, CheckCircle, XCircle, Users, Settings } from 'lucide-react';

const initialSalaState = {
    nombre: '',
    capacidad: 1,
    ubicacion: '',
    disponible: true,
};

const SalasAdminPage = () => {
    const { isAdmin } = useAuth();
    const { success, error } = useToast();
    
    const [salas, setSalas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState(initialSalaState);
    const [editingSala, setEditingSala] = useState(null); // Si no es null, estamos editando

    useEffect(() => {
        if (isAdmin()) {
            fetchSalas();
        }
    }, [isAdmin]);

    const fetchSalas = async () => {
        setLoading(true);
        try {
            // Asumimos que salaService.getAll devuelve { data: [salas] }
            const response = await salaService.getAll();
            setSalas(response.data);
            
        } catch (e) {
            console.error("Error al cargar salas:", e);
            error("No se pudieron cargar las salas. Usando datos mock.");
            // Mock de fallback si la API falla
            setSalas([
                { id: 1, nombre: 'Sala Grande', capacidad: 30, disponible: true, ubicacion: 'Piso 2' },
                { id: 2, nombre: 'Sala Pequeña', capacidad: 10, disponible: false, ubicacion: 'Piso 1' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // --- Manejo del Modal ---
    const handleOpenModal = (salaToEdit = null) => {
        if (salaToEdit) {
            setEditingSala(salaToEdit);
            setFormData({
                nombre: salaToEdit.nombre,
                capacidad: salaToEdit.capacidad,
                ubicacion: salaToEdit.ubicacion,
                disponible: salaToEdit.disponible,
            });
        } else {
            setEditingSala(null);
            setFormData(initialSalaState);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSala(null);
        setFormData(initialSalaState);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    // --- CRUD: Crear y Editar ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSala) {
                // UPDATE (PUT/PATCH)
                // Usamos PUT para enviar el objeto completo de la sala
                await salaService.update(editingSala.id, formData);
                success(`Sala "${formData.nombre}" actualizada correctamente.`);
            } else {
                // CREATE
                // Si la capacidad es un string, asegurarse de que se convierta a número
                const newSala = { ...formData, capacidad: parseInt(formData.capacidad) };
                await salaService.create(newSala);
                success(`Sala "${formData.nombre}" creada correctamente.`);
            }

            handleCloseModal();
            fetchSalas(); // Recargar lista
        } catch (e) {
            console.error("Error al guardar sala:", e);
            error(`Error al guardar la sala. Detalle: ${e.response?.data?.detail || 'Verifique los datos.'}`);
        }
    };

    // --- CRUD: Eliminar ---
    const handleDelete = async (id, nombre) => {
        if (window.confirm(`¿Está seguro de eliminar la sala "${nombre}"? Esta acción es irreversible.`)) {
            try {
                await salaService.delete(id);
                success(`Sala "${nombre}" eliminada.`);
                fetchSalas();
            } catch (e) {
                console.error("Error al eliminar sala:", e);
                error(`Error al eliminar la sala. Detalle: ${e.response?.data?.detail || 'Intente de nuevo.'}`);
            }
        }
    };

    // --- CRUD: Toggle Disponibilidad (PATCH) ---
    const toggleDisponibilidad = async (sala) => {
        try {
            // Usamos PATCH para actualizar solo el campo 'disponible'
            await salaService.updateDisponibilidad(sala.id, { disponible: !sala.disponible });
            success(`Disponibilidad de "${sala.nombre}" actualizada.`);
            fetchSalas();
        } catch (e) {
            console.error("Error al cambiar disponibilidad:", e);
            error(`Error al cambiar la disponibilidad.`);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAdmin()) {
        return <div className="p-10 text-center text-red-600">Acceso Denegado. Solo Administradores.</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 flex items-center">
                    <Settings className="w-8 h-8 mr-3 text-indigo-600" /> Administración de Salas
                </h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center shadow-md"
                >
                    <Plus className="w-5 h-5 mr-2" /> Nueva Sala
                </button>
            </div>

            {/* Tabla de Salas */}
            <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Capacidad</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ubicación</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {salas.map((sala) => (
                            <tr key={sala.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sala.nombre}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center">
                                    <Users className="w-4 h-4 mr-1 text-indigo-500" /> {sala.capacidad}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sala.ubicacion}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-3 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            sala.disponible
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {sala.disponible ? 'Disponible' : 'Ocupada'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                    <button
                                        onClick={() => toggleDisponibilidad(sala)}
                                        className={`mr-3 p-1 rounded-full text-white transition ${
                                            sala.disponible ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                                        }`}
                                        title={sala.disponible ? 'Marcar como Ocupada' : 'Marcar como Disponible'}
                                    >
                                        {sala.disponible ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => handleOpenModal(sala)}
                                        className="text-indigo-600 hover:text-indigo-900 p-1 mr-3 transition"
                                        title="Editar Sala"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(sala.id, sala.nombre)}
                                        className="text-red-600 hover:text-red-900 p-1 transition"
                                        title="Eliminar Sala"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de Creación/Edición */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 border-b">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingSala ? 'Editar Sala: ' + editingSala.nombre : 'Crear Nueva Sala'}
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nombre de la Sala</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Capacidad (Personas)</label>
                                    <input
                                        type="number"
                                        name="capacidad"
                                        value={formData.capacidad}
                                        onChange={handleChange}
                                        required
                                        min="1"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                                    <input
                                        type="text"
                                        name="ubicacion"
                                        value={formData.ubicacion}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                {/* Solo se muestra la disponibilidad si estamos editando (para evitar confusión al crear) */}
                                {editingSala && (
                                    <div className="flex items-center">
                                        <input
                                            id="disponible"
                                            name="disponible"
                                            type="checkbox"
                                            checked={formData.disponible}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                        <label htmlFor="disponible" className="ml-2 block text-sm font-medium text-gray-700">
                                            Disponible para reservas
                                        </label>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 border-t flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md"
                                >
                                    {editingSala ? 'Guardar Cambios' : 'Crear Sala'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalasAdminPage;