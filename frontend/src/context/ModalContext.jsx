import React, { createContext, useState, useContext } from 'react';
import ConfirmModal from '../components/common/ConfirmModal';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    // Estado único para todo el sistema
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        isDanger: false,
        onConfirm: () => {}, // Función vacía por defecto
    });

    // Función que llamaremos desde los componentes
    const confirm = ({ title, message, onConfirm, confirmText = "Confirmar", cancelText = "Cancelar", isDanger = false }) => {
        setModalConfig({
            isOpen: true,
            title,
            message,
            confirmText,
            cancelText,
            isDanger,
            onConfirm: async () => {
                // Ejecutamos la acción que nos pasaron
                if (onConfirm) await onConfirm();
                // Cerramos el modal automáticamente después
                close();
            }
        });
    };

    const close = () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
    };

    return (
        <ModalContext.Provider value={{ confirm }}>
            {children}
            {/* Aquí se renderiza el Modal UNA SOLA VEZ para toda la app */}
            <ConfirmModal 
                {...modalConfig} 
                onClose={close} 
            />
        </ModalContext.Provider>
    );
};

// Hook personalizado para usarlo fácil
export const useConfirm = () => {
    return useContext(ModalContext);
};