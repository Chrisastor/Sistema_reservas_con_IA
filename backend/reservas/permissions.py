from rest_framework import permissions

class IsAdminOrCajero(permissions.BasePermission):
    """
    Permiso estricto que solo deja pasar a:
    1. Superusuarios (Staff/Admin de Django).
    2. Usuarios que pertenezcan al grupo 'Cajero'.
    """
    def has_permission(self, request, view):
        # 1. Primero, debe estar logueado
        if not request.user or not request.user.is_authenticated:
            return False

        # 2. Pase VIP para Superusuarios (Tú)
        if request.user.is_staff:
            return True

        # 3. Pase para Cajeros (Grupo)
        if request.user.groups.filter(name__iexact='Cajero').exists():
            return True

        # Si no es ninguno de los anteriores, acceso denegado
        return False

class IsAdminUserOrReadOnly(permissions.BasePermission):
    """
    Permite lectura (GET) a cualquiera, pero escritura solo a Admins.
    Útil para endpoints públicos como 'Listar Salas'.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff