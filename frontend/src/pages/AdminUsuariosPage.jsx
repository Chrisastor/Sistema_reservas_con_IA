import React, { useState, useEffect, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import { userService } from '../services/api'; 
import { UserPlus, User, Lock, Mail, Users, Trash2, Clock, Edit, X, Info, Search, ShieldCheck, Briefcase } from 'lucide-react'; 

// 👇 1. IMPORTAR EL HOOK DEL MODAL
import { useConfirm } from '../context/ModalContext';

const initialFormData = {
    username: '',
    email: '',
    password: '',
    role: 'cajero',
};

const AdminUsuariosPage = () => {
    const { isAdmin } = useAuth();
    const { success, error } = useToast();
    
    // 👇 2. ACTIVAR EL MODAL GLOBAL
    const { confirm } = useConfirm();
    
    const [formData, setFormData] = useState(initialFormData);
    const [loadingForm, setLoadingForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null); 
    
    const [cajeros, setCajeros] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loadingTable, setLoadingTable] = useState(true);
    const [searchTerm, setSearchTerm] = useState(""); 

    // --- LÓGICA DE CARGA ---
    const fetchCajeros = useCallback(async () => {
        if (!isAdmin()) {
            setLoadingTable(false);
            return;
        }

        setLoadingTable(true);
        try {
            const data = await userService.getAllUsers();
            const usersSource = Array.isArray(data) ? data : data.results || [];
            
            const filteredCajeros = usersSource.filter(u => u.role && u.role.toLowerCase() === 'cajero');
            
            setAllUsers(usersSource);
            setCajeros(filteredCajeros);
            
        } catch (e) {
            console.error("Error al cargar cajeros:", e);
            setCajeros([]); 
        } finally {
            setLoadingTable(false);
        }
    }, [isAdmin]); 

    useEffect(() => {
        fetchCajeros();
    }, [fetchCajeros]);

    // --- MANEJADORES ---

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setFormData(initialFormData);
    };
    
    const handleEditUser = (user) => {
        if (user.role && user.role.toLowerCase() !== 'cajero') {
            error("Solo se pueden editar usuarios con rol de cajero.");
            return;
        }
        setEditingUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            password: '', 
            role: user.role,
        });
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setLoadingForm(true);
        const updateData = { username: formData.username, email: formData.email, role: 'cajero' };
        if (formData.password) updateData.password = formData.password;

        try {
            await userService.updateUser(editingUser.id, updateData);
            success(`Cajero '${formData.username}' actualizado.`);
            handleCancelEdit();
            fetchCajeros(); 
        } catch (err) {
            error("Error al actualizar. Verifique los datos.");
        } finally {
            setLoadingForm(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setLoadingForm(true);
        try {
            const data = { ...formData, role: 'cajero' }; 
            await userService.registerCajero(data); 
            success(`Cajero '${formData.username}' creado.`);
            setFormData(initialFormData);
            fetchCajeros(); 
        } catch (e) {
            const msg = e.response?.data?.password ? "La contraseña es muy débil." : "Error al registrar.";
            error(msg);
        } finally {
            setLoadingForm(false);
        }
    };
    
    // --- 👇 3. ELIMINAR CON MODAL GLOBAL ---
    const handleDeleteUser = (id, username) => {
        confirm({
            title: `¿Eliminar al cajero "${username}"?`,
            message: 'Esta acción eliminará permanentemente la cuenta de usuario y no se puede deshacer.',
            confirmText: 'Sí, eliminar',
            isDanger: true, // Botón rojo
            onConfirm: async () => {
                try {
                    await userService.deleteUser(id);
                    success("Cajero eliminado correctamente.");
                    fetchCajeros();
                } catch (e) {
                    error("Hubo un error al intentar eliminar el usuario.");
                }
            }
        });
    };

    const filteredList = cajeros.filter(user => 
        (user.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isAdmin()) return <div className="p-10 text-center text-red-600">Acceso Denegado.</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <ShieldCheck className="w-8 h-8 mr-3 text-indigo-600" />
                                Administración de Personal
                            </h1>
                            <p className="mt-2 text-sm text-gray-500">Gestiona las cuentas de acceso y roles de los cajeros del sistema.</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex space-x-6">
                            <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
                                <span className="block text-xs font-semibold text-indigo-500 uppercase">Cajeros</span>
                                <span className="block text-2xl font-bold text-indigo-700">{cajeros.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Formulario */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
                            <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-white flex items-center">
                                    {editingUser ? <Edit className="w-5 h-5 mr-2" /> : <UserPlus className="w-5 h-5 mr-2" />}
                                    {editingUser ? 'Editar' : 'Nuevo Cajero'}
                                </h2>
                                {editingUser && <button onClick={handleCancelEdit} className="text-indigo-200 hover:text-white transition"><X className="w-5 h-5" /></button>}
                            </div>

                            <div className="p-6">
                                <form onSubmit={editingUser ? handleUpdateUser : handleRegisterSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Usuario</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input type="text" name="username" value={formData.username} onChange={handleChange} required className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none" disabled={!!editingUser} placeholder="Ej: juan.perez"/>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none" placeholder="correo@empresa.com"/>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{editingUser ? 'Nueva Pass (Opcional)' : 'Contraseña'}</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input type="password" name="password" value={formData.password} onChange={handleChange} required={!editingUser} className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none" placeholder="••••••••"/>
                                        </div>
                                        <p className="mt-2 text-xs text-gray-500 flex items-start">
                                            <Info className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0 text-indigo-500" />
                                            La contraseña debe ser alfanumérica y tener al menos 8 caracteres.
                                        </p>
                                    </div>
                                    
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                                        <div className="flex items-center text-gray-700">
                                            <Briefcase className="w-4 h-4 mr-2" />
                                            <span className="text-sm font-medium">Rol Asignado:</span>
                                        </div>
                                        <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">CAJERO</span>
                                    </div>

                                    <button type="submit" disabled={loadingForm} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition shadow-md flex items-center justify-center disabled:opacity-70">
                                        {loadingForm ? <Clock className="w-5 h-5 mr-2 animate-spin" /> : (editingUser ? 'Guardar Cambios' : 'Registrar Cajero')}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Tabla */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center">
                            <Search className="w-5 h-5 text-gray-400 mr-3" />
                            <input type="text" placeholder="Buscar por nombre o correo..." className="flex-grow outline-none text-gray-700" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>

                        <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-800">Lista de Cajeros</h3>
                            </div>
                            
                            {loadingTable ? (
                                <div className="p-10 flex justify-center"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
                            ) : filteredList.length === 0 ? (
                                <div className="p-10 text-center text-gray-500"><Users className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>No se encontraron cajeros.</p></div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Usuario</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
                                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Rol</th>
                                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredList.map((user) => (
                                                <tr key={user.id} className="hover:bg-indigo-50/30 transition duration-150">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg mr-3">
                                                                {user.username ? user.username.charAt(0).toUpperCase() : "?"}
                                                            </div>
                                                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                                    <td className="px-6 py-4 text-center"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">{user.role.toUpperCase()}</span></td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex justify-center space-x-3">
                                                            <button onClick={() => handleEditUser(user)} className="text-indigo-600 bg-indigo-50 p-2 rounded hover:bg-indigo-100 transition"><Edit className="w-4 h-4" /></button>
                                                            <button onClick={() => handleDeleteUser(user.id, user.username)} className="text-red-600 bg-red-50 p-2 rounded hover:bg-red-100 transition"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUsuariosPage;