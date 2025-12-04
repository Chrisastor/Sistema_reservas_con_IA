import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import useToast from '../hooks/useToast'; 
import { setGlobalToast } from '../services/api'; // Función para inyectar

const ToastProvider = ({ children }) => {
    // ESTE ES EL HOOK QUE DEBE LLAMARSE EN EL CUERPO DEL COMPONENTE:
    const { success, error, loading, dismiss } = useToast();

    // Inyecta las funciones de toast en api.js de forma segura.
    useEffect(() => {
        setGlobalToast({ success, error, loading, dismiss });
    }, [success, error, loading, dismiss]);

    return (
        <>
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    className: 'font-inter',
                    duration: 5000,
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                        fontSize: '14px',
                        padding: '12px 16px',
                    },
                    error: {
                        style: {
                            background: '#FEE2E2', 
                            color: '#B91C1C', 
                            border: '1px solid #FCA5A5', 
                        },
                    },
                }}
            />
            {children}
        </>
    );
};

export default ToastProvider;