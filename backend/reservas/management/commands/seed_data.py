from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from reservas.models import Sala, EstadoReserva, Reserva
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Crea datos de ejemplo para el sistema de reservas'

    def handle(self, *args, **options):
        # Usuarios
        admin_user, _ = User.objects.get_or_create(username='admin', defaults={'is_staff': True, 'is_superuser': True, 'email':'admin@reserva.com'})
        vendedor_user, _ = User.objects.get_or_create(username='vendedor', defaults={'is_staff': False, 'email':'vendedor@reserva.com'})
        self.stdout.write("👤 Usuarios creados o existentes.")

        # Salas
        salas_data = [
            {'nombre': 'Sala 1', 'capacidad': 10},
            {'nombre': 'Sala 2', 'capacidad': 15},
            {'nombre': 'Sala 3', 'capacidad': 20},
        ]
        for s in salas_data:
            Sala.objects.get_or_create(nombre=s['nombre'], defaults={'capacidad': s['capacidad']})
        self.stdout.write("🏢 Salas creadas o existentes.")

        # Estados
        estados = ['pendiente', 'confirmada', 'cancelada']
        for e in estados:
            EstadoReserva.objects.get_or_create(nombre=e)
        self.stdout.write("⚙️ Estados creados o existentes.")

        # Reservas de ejemplo
        if Reserva.objects.exists():
            self.stdout.write("📅 Reservas ya existen, omitido.")
            return

        pendiente = EstadoReserva.objects.get(nombre='pendiente')
        sala1 = Sala.objects.first()

        now = timezone.now()
        for i in range(5):
            inicio = now + timedelta(days=i)
            fin = inicio + timedelta(hours=2)
            Reserva.objects.create(
                usuario=vendedor_user,
                sala=sala1,
                fecha_inicio=inicio,
                fecha_fin=fin,
                motivo=f"Reunión de ejemplo {i+1}",
                estado=pendiente,
                solicitante_nombre=f"Cliente {i+1}",
                solicitante_email=f"cliente{i+1}@example.com",
                solicitante_telefono=f"+5691234567{i}"
            )
        self.stdout.write("📅 Reservas de ejemplo creadas correctamente ✅")
