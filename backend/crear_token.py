import os
import django

# Configurar Django para que funcione el script
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings') # Asegúrate que 'backend' sea el nombre de tu carpeta de configuración
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

def generar_token():
    print("🤖 Creando usuario bot...")
    try:
        user, created = User.objects.get_or_create(username='whatsapp_bot')
        if created:
            user.set_password('Astro1234')
            user.save()
            print("✅ Usuario 'whatsapp_bot' creado.")
        else:
            print("ℹ️ El usuario 'whatsapp_bot' ya existía.")

        token, _ = Token.objects.get_or_create(user=user)
        print("\n" + "="*40)
        print(f"🔑 TU TOKEN ES: {token.key}")
        print("="*40 + "\n")
        print("Copia este token y ponlo en n8n (Header Auth).")

    except Exception as e:
        print(f"❌ Error: {e}")
        print("POSIBLE SOLUCIÓN: ¿Agregaste 'rest_framework.authtoken' en settings.py y corriste 'migrate'?")

if __name__ == '__main__':
    generar_token()