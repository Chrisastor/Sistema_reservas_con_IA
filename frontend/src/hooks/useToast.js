import toast from 'react-hot-toast';

// Este hook ahora solo envuelve las funciones de toast
// y no utiliza ningún hook de React (como useState o useCallback) para evitar conflictos.
const useToast = () => {
    return {
        success: (message) => toast.success(message),
        error: (message) => toast.error(message),
        loading: (message) => toast.loading(message),
        dismiss: (id) => toast.dismiss(id),
    };
};

export default useToast;