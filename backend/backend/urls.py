from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework.routers import DefaultRouter
from reservas.views import register_user, UserViewSet, UserInfoView 

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user') 

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # --- Rutas de API ---
    path('api/', include('reservas.urls')), # Salas, Reservas, Notificaciones
    
    # Rutas de JWT (Login y Refresh)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Rutas de Usuarios y Registro (RESUELVE 404s)
    path('api/register/', register_user, name='register'), # POST /api/register/
    path('api/user-info/', UserInfoView.as_view(), name='user-info'), # GET /api/user-info/
    path('api/', include(router.urls)), # CRUD para /api/users/
]