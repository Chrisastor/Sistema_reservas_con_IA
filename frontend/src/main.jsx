import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; 

// CRÍTICO: Debe existir en src/context/AuthProvider.jsx (exportado por defecto)
import AuthProvider from './context/AuthProvider'; 
// CRÍTICO: Debe existir en src/components/ToastProvider.jsx
import ToastProvider from './components/ToastProvider'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider> 
      <AuthProvider>
        <App />
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>,
);