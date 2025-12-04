# 📅 Sistema de Reservas Inteligente Multicanal

> **Proyecto de Integración - Ingeniería en Informática**
> **Alumno:** Christopher Astorga Gonzalez
> **Docente:** Christian Pérez Núñez

Una plataforma omnicanal diseñada para la gestión automatizada de espacios y recursos corporativos. Integra una arquitectura de microservicios con **Inteligencia Artificial (Gemini 2.0)** y orquestación de procesos de negocio (BPA).

---

## 🚀 Características Principales

### 🧠 Inteligencia Artificial Híbrida
- **Web (React):** Chatbot "ChrisBot" integrado nativamente con Django + Gemini para respuestas de baja latencia.
- **Móvil (Telegram):** Agente transaccional orquestado en **n8n** capaz de interpretar lenguaje natural y ejecutar acciones en la BD.

### ⚡ Lógica de Negocio Diferenciada
El sistema aplica una **Máquina de Estados** según el canal de origen:
1.  **Reserva Web (Asistida):** Ingresa como **PENDIENTE**. Otorga una ventana de tiempo para validación administrativa.
2.  **Reserva Telegram (Express):** Ingresa como **CONFIRMADA**. Aprovecha la autenticación del dispositivo móvil para bloqueo inmediato de disponibilidad.

### 🛡️ Seguridad y Arquitectura
- **Autenticación:** JWT (JSON Web Tokens) con rotación automática (Silent Refresh).
- **Infraestructura:** Despliegue contenerizado con Docker Compose.
- **Base de Datos:** MySQL 8.0 persistente.

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Frontend** | React + Vite | SPA moderna con TailwindCSS y Axios Interceptors. |
| **Backend** | Python Django | API RESTful (DRF) con gestión de permisos RBAC. |
| **Automatización** | n8n | Orquestador de flujos (Chatbot y Notificaciones). |
| **Base de Datos** | MySQL | Persistencia relacional de datos. |
| **DevOps** | Docker | Orquestación de contenedores y redes. |

---

## 📦 Instalación y Despliegue

Este proyecto utiliza **Docker** para garantizar la paridad entre entornos.

### 1. Prerrequisitos
- Docker Desktop instalado y corriendo.
- Git
