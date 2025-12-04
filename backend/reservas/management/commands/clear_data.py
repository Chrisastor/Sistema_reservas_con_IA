from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from reservas.models import Sala, EstadoReserva, Reserva

class Command(BaseCommand):
    help = "Elimina todos los datos de prueba del sistema (reservas, salas, estados y usuarios comunes)."

    def handle(self, *args, **kwargs):
        confirm = input("⚠️ Esto eliminará todos los datos del sistema (excepto migraciones). ¿Deseas continuar? (s/n): ")
        if confirm.lower() != 's':
            self.stdout.write("❌ Operación cancelada.")
            return

        # Eliminar reservas primero (tienen FK)
        Reserva.objects.all().delete()
        self.stdout.write("🗑️ Todas las reservas eliminadas.")

        # Eliminar salas
        Sala.objects.all().delete()
        self.stdout.write("🏢 Todas las salas eliminadas.")

        # Eliminar estados
        EstadoReserva.objects.all().delete()
        self.stdout.write("⚙️ Todos los estados eliminados.")

        # Eliminar usuarios excepto superusuarios
        usuarios_eliminados = User.objects.filter(is_superuser=False).delete()[0]
        self.stdout.write(f"👤 Usuarios normales eliminados: {usuarios_eliminados}")

        self.stdout.write("✅ Base de datos limpia y lista para nuevos datos.")
