from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from reservas.models import Reserva, Notificacion, EstadoReserva, Sala

EXTENSION_MINUTOS = 30  # tiempo de extensión

class Command(BaseCommand):
    help = "Genera notificaciones para reservas próximas a terminar y permite extender si la sala está libre"

    def handle(self, *args, **options):
        now = timezone.now()
        aviso_tiempo = timedelta(minutes=15)  # tiempo antes de terminar para avisar

        reservas_proximas_a_terminar = Reserva.objects.filter(
            fecha_fin__gt=now,
            fecha_fin__lte=now + aviso_tiempo,
        )

        for reserva in reservas_proximas_a_terminar:
            # Evitar duplicar notificaciones de aviso
            existe_aviso = Notificacion.objects.filter(
                reserva=reserva,
                mensaje__icontains="está por terminar",
            ).exists()

            if not existe_aviso:
                Notificacion.objects.create(
                    usuario=reserva.usuario,
                    reserva=reserva,
                    mensaje=f"Tu reserva en la sala {reserva.sala.nombre} está por terminar en menos de 15 minutos.",
                )
                self.stdout.write(f"Notificación creada para reserva {reserva.id}")

            # Verificar si se puede extender
            sala = reserva.sala
            nueva_fecha_fin = reserva.fecha_fin + timedelta(minutes=EXTENSION_MINUTOS)
            
            # Comprobar si hay reservas futuras que choquen con la extensión
            conflicto = Reserva.objects.filter(
                sala=sala,
                fecha_inicio__lt=nueva_fecha_fin,
                fecha_fin__gt=reserva.fecha_fin
            ).exists()

            if not conflicto:
                # Se puede extender
                reserva.fecha_fin = nueva_fecha_fin
                reserva.save()
                
                Notificacion.objects.create(
                    usuario=reserva.usuario,
                    reserva=reserva,
                    mensaje=f"Tu reserva en la sala {sala.nombre} se ha extendido automáticamente por {EXTENSION_MINUTOS} minutos porque la sala estaba libre.",
                )
                self.stdout.write(f"Reserva {reserva.id} extendida automáticamente {EXTENSION_MINUTOS} minutos")
