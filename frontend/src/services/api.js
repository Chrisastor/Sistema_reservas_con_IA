import axios from 'axios';
import { 
    getAccessToken, 
    getCurrentUser, 
    clearAuth, 
    setAuthData, 
    getUserRole, 
    isAuthenticated 
} from '../context/AuthUtils'; 

// Variable mutable para almacenar las funciones de toast inyectadas
let globalToastRef = {};

/**
 * Función que inyecta las funciones de toast (success, error, etc.) 
 */
export const setGlobalToast = (toastFunctions) => {
    globalToastRef = toastFunctions;
};


// --- Constantes ---
const BASE_URL = "http://127.0.0.1:8000/api/";
const ACCESS_TOKEN_KEY = 'access_token'; 
const REFRESH_TOKEN_KEY = 'refresh_token'; 

// --- Configuración de la Instancia de Axios ---
const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const refreshToken = async () => {
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refresh) { clearAuth(); throw new Error("No refresh token available."); }
    try {
        const response = await axios.post(`${BASE_URL}token/refresh/`, { refresh });
        const { access } = response.data;
        localStorage.setItem(ACCESS_TOKEN_KEY, access); 
        return access;
    } catch (error) {
        clearAuth();
        throw error;
    }
};

// --- Interceptor de Solicitud (Añade JWT) ---
api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// --- Interceptor de Respuesta (Manejo de 401 y Errores Globales con Toast) ---
api.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    let errorMessage = 'Error desconocido en la red o el servidor.';

    // Lógica de Refresco de Token para 401
    if (status === 401 && !originalRequest._retry && originalRequest.url.indexOf('token/') === -1) {
        if (isRefreshing) {
            return new Promise(function(resolve, reject) {
                failedQueue.push({ resolve, reject });
            }).then(token => {
                originalRequest.headers['Authorization'] = 'Bearer ' + token;
                return api(originalRequest);
            }).catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const newAccessToken = await refreshToken();
            originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
            processQueue(null, newAccessToken);
            return api(originalRequest);
        } catch (err) {
            processQueue(err, null);
            if (globalToastRef.error) globalToastRef.error('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
            window.location.href = '/login'; 
            return Promise.reject(err);
        } finally {
            isRefreshing = false;
        }
    }
    
    // Manejo de Errores Centralizado (Toast)
    if (status) {
        if (status === 400) {
            const data = error.response.data;
            if (data.non_field_errors) {
                errorMessage = data.non_field_errors.join(' ');
            } else if (typeof data === 'object') {
                errorMessage = Object.keys(data).map(key => `${key}: ${data[key]}`).join(' | ');
            } else {
                errorMessage = 'Datos enviados inválidos. Revisa el formulario.';
            }
        } else if (status === 403) {
            errorMessage = 'Acceso denegado. No tienes permiso para realizar esta acción.';
        } else if (status === 404) {
            errorMessage = `Recurso no encontrado: ${originalRequest.url.split('/').pop()}`;
        } else if (status >= 500) {
            errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
        } 
    }

    if (status !== 401 || originalRequest.url.indexOf('token/') === -1) {
        if (globalToastRef.error) globalToastRef.error(`[${status || 'Error'}] ${errorMessage}`);
    }
    
    return Promise.reject(error);
});

// --- Servicios Exportables ---
export const authService = {
    login: async (username, password) => {
        const response = await api.post('token/', { username, password });
        localStorage.setItem(ACCESS_TOKEN_KEY, response.data.access);
        return response.data; 
    },
    getUserInfo: async () => {
        const response = await api.get('user-info/');
        return response.data;
    },
    logout: clearAuth,
};

export const userService = {
    registerCajero: async (data) => {
        const response = await api.post('register/', data); 
        return response.data;
    },
    getAllUsers: async () => {
        const response = await api.get('users/'); 
        return response.data;
    },
    updateUser: async (id, data) => { 
        const response = await api.patch(`users/${id}/`, data);
        return response.data;
    },
    deleteUser: async (id) => {
        const response = await api.delete(`users/${id}/`);
        return response.data;
    }
};

export const salaService = {
    getAll: () => api.get('salas/'),
    create: (data) => api.post('salas/', data),
    get: (id) => api.get(`salas/${id}/`),
    update: (id, data) => api.put(`salas/${id}/`, data),
    delete: (id) => api.delete(`salas/${id}/`),
    updateDisponibilidad: (id, data) => api.patch(`salas/${id}/`, data),
};

export const reservaService = {
    getAll: () => api.get('reservas/'),
    create: (data) => api.post('reservas/', data),
    confirm: (id) => api.post(`reservas/${id}/confirmar/`),
    cancel: (id) => api.post(`reservas/${id}/cancelar/`),
    // NUEVA FUNCIÓN PARA ELIMINAR RESERVAS
    delete: (id) => api.delete(`reservas/${id}/`),
    update: (id, data) => api.patch(`/reservas/${id}/`, data),
    
};

export const notificacionService = {
    getUnreadCount: () => api.get('notificaciones/sin-leer/'),
    getAll: () => api.get('notificaciones/'),
    markAsRead: (id) => api.post(`notificaciones/${id}/leer/`),
    markAllAsRead: () => api.post('notificaciones/marcar-todas-leidas/'),
};

export default api;