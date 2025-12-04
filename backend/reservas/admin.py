from django.contrib import admin
from .models import Sala, EstadoReserva, Reserva, Notificacion

@admin.register(Sala)
class SalaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'capacidad', 'disponible')

@admin.register(EstadoReserva)
class EstadoReservaAdmin(admin.ModelAdmin):
    list_display = ('nombre',)

@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    list_display = ('sala', 'solicitante_nombre', 'estado', 'fecha_inicio', 'fecha_fin')
    list_filter = ('estado', 'sala')

@admin.register(Notificacion)
class NotificacionAdmin(admin.ModelAdmin):
    list_display = ('reserva', 'usuario', 'mensaje', 'creada_en')
    readonly_fields = ('creada_en',)
