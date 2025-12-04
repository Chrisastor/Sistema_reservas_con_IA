from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Reserva, Sala, EstadoReserva, Notificacion
from django.contrib.auth import password_validation

class SalaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sala
        fields = ['id', 'nombre', 'capacidad', 'descripcion', 'ubicacion', 'disponible']

class EstadoReservaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadoReserva
        fields = ['id', 'nombre']

class ReservaSerializer(serializers.ModelSerializer):
    estado_display = serializers.CharField(source='estado.nombre', read_only=True)
    class Meta:
        model = Reserva
        fields = [
            'id', 'usuario', 'sala', 'fecha_inicio', 'fecha_fin',
            'estado', 'estado_display',
            'solicitante_nombre', 'solicitante_email', 'solicitante_telefono',
            'creada_en'
        ]
        read_only_fields = ['id', 'creada_en']

class NotificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacion
        fields = ['id', 'usuario', 'reserva', 'mensaje', 'leida', 'creada_en']

class UserSerializer(serializers.ModelSerializer):
    # CRÍTICO: Campo de lectura calculado que devuelve la cadena 'admin', 'cajero', o 'usuario'
    role = serializers.SerializerMethodField()
    
    # Campo de escritura para la contraseña (obligatorio para la creación)
    password = serializers.CharField(write_only=True, validators=[password_validation.validate_password])
    
    # Campo de escritura temporal para el rol (usado en la vista para asignación de grupo)
    role_write = serializers.CharField(write_only=True, required=False) 

    class Meta:
        model = User
        # Incluimos 'role' (lectura) y 'password'/'role_write' (escritura)
        fields = ['id', 'username', 'email', 'password', 'is_staff', 'is_active', 'role', 'role_write']
        read_only_fields = ['is_staff', 'is_active']
        
    # Método para calcular el campo 'role' que se devuelve al frontend (Lógica del UserInfoView)
    def get_role(self, obj):
        if obj.is_staff:
            return "admin"
        if obj.groups.filter(name__iexact='cajero').exists():
            return "cajero"
        return "usuario"
        
    def create(self, validated_data):
        """Usa set_password para hashear y crear el usuario."""
        
        # 1. Extraer contraseña y 'role_write' antes de la creación
        password = validated_data.pop('password')
        if 'role_write' in validated_data:
            validated_data.pop('role_write') # Se elimina para no romper la creación del modelo
            
        # 2. Crear el usuario base
        user = User.objects.create(**validated_data)
        
        # 3. Hashear y guardar la contraseña
        user.set_password(password)
        user.save()
        
        return user
