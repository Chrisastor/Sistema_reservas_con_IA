from django.urls import path, include
from rest_framework.routers import DefaultRouter
# Asegúrate de importar TODAS tus vistas aquí
from .views import (
    ReservaViewSet, 
    SalaViewSet, 
    EstadoReservaViewSet, 
    NotificacionViewSet, 
    ChatBotView, 
    register_user,   # <--- Importante para el registro
    UserInfoView     # <--- Importante para el login
)

router = DefaultRouter()
router.register(r'reservas', ReservaViewSet, basename='reserva')
router.register(r'salas', SalaViewSet, basename='sala')
router.register(r'estados', EstadoReservaViewSet, basename='estado')
router.register(r'notificaciones', NotificacionViewSet, basename='notificacion')

# --- CORRECCIÓN: Combinar Router + Rutas Manuales ---

urlpatterns = [
    # 1. Rutas Manuales (Chatbot y Auth)
    path('chatbot/', ChatBotView.as_view(), name='chatbot'), 
    path('register/', register_user, name='register'),
    path('user-info/', UserInfoView.as_view(), name='user-info'),

    # 2. Rutas Automáticas del Router (Salas, Reservas, etc.)
    path('', include(router.urls)), 
]