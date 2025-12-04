import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirmar", cancelText = "Cancelar", variant = "danger" }) => {
    if (!isOpen) return null;

    const isDanger = variant === "danger";
    const confirmButtonClass = isDanger 
        ? "bg-red-600 hover:bg-red-700 focus:ring-red-500" 
        : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500";

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Fondo oscuro (backdrop) */}
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                
                {/* Overlay con transición */}
                <div 
                    className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" 
                    aria-hidden="true"
                    onClick={onClose} // Cierra al hacer clic fuera
                ></div>

                {/* Truco para centrar el modal verticalmente */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                {/* Contenido del Modal */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            
                            {/* Icono de Alerta */}
                            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${isDanger ? 'bg-red-100' : 'bg-indigo-100'} sm:mx-0 sm:h-10 sm:w-10`}>
                                <AlertTriangle className={`h-6 w-6 ${isDanger ? 'text-red-600' : 'text-indigo-600'}`} aria-hidden="true" />
                            </div>
                            
                            {/* Texto */}
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        {title}
                                    </h3>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Botones de Acción */}
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm transition ${confirmButtonClass}`}
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition"
                            onClick={onClose}
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;


