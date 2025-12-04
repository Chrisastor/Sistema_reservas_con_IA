from django.db import models
from django.contrib.auth.models import User

class Sala(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    capacidad = models.IntegerField(default=1)
    ubicacion = models.CharField(max_length=100, blank=True)
    disponible = models.BooleanField(default=True)
    destacada = models.BooleanField(default=False)

    def __str__(self):
        return self.nombre

class EstadoReserva(models.Model):
    nombre = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre

class Reserva(models.Model):
    sala = models.ForeignKey(Sala, on_delete=models.CASCADE)
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    estado = models.ForeignKey(EstadoReserva, on_delete=models.SET_NULL, null=True)
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()
    solicitante_nombre = models.CharField(max_length=100, blank=True)
    solicitante_email = models.EmailField(blank=True)
    solicitante_telefono = models.CharField(max_length=20, blank=True)
    creada_en = models.DateTimeField(auto_now_add=True)

class Notificacion(models.Model):
    reserva = models.ForeignKey(Reserva, on_delete=models.CASCADE, related_name='notificaciones')
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    mensaje = models.TextField()
    creada_en = models.DateTimeField(auto_now_add=True)
    leida = models.BooleanField(default=False)
