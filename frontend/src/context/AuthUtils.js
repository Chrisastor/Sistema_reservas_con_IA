// Este archivo maneja las utilidades de localStorage y no contiene Hooks
// para evitar conflictos en la inicialización de React.

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_INFO_KEY = 'user_info';

export const setAuthData = (access, refresh, userInfo) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
};

export const clearAuth = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
};

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const getCurrentUser = () => {
    const userInfo = localStorage.getItem(USER_INFO_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
};

export const isAuthenticated = () => !!getAccessToken();

export const getUserRole = () => {
    const user = getCurrentUser();
    return user ? user.role : null;
};