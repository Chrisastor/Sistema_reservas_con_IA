from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Reserva
import requests 
import json

# 👇 URL DEL WEBHOOK DE N8N (Ajusta si usas Ngrok o Localhost)
N8N_WEBHOOK_URL = "http://localhost:5678/webhook-test/notificacion-reserva"

@receiver(post_save, sender=Reserva)
def notificar_cambio_estado(sender, instance, created, **kwargs):
    """
    Notifica a n8n sobre nuevas reservas y cambios de estado.
    """
    try:
        # Obtenemos el nombre del estado
        estado_bd = instance.estado.nombre.upper() if instance.estado else "PENDIENTE"
        
        # Variables para enviar
        estado_para_n8n = None
        mensaje_para_n8n = ""

        # CASO 1: NUEVA RESERVA (PENDIENTE)
        # Aquí está la corrección: Si se crea, avisamos que fue "RECIBIDA"
        if created:
            estado_para_n8n = "RECIBIDA"
            mensaje_para_n8n = "Hemos recibido tu solicitud de reserva."

        # CASO 2: CAMBIO DE ESTADO (CONFIRMADA / CANCELADA)
        elif estado_bd in ['CONFIRMADA', 'CANCELADA']:
            estado_para_n8n = estado_bd
            mensaje_para_n8n = f"Tu reserva ha sido {estado_bd.lower()}."

        # Solo enviamos si definimos un estado válido para n8n
        if estado_para_n8n:
            
            payload = {
                "id_reserva": instance.id,
                "sala": instance.sala.nombre if instance.sala else "Sala Desconocida",
                "cliente_nombre": instance.solicitante_nombre,
                "cliente_email": instance.solicitante_email,
                "cliente_telefono": instance.solicitante_telefono,
                "fecha_inicio": str(instance.fecha_inicio),
                "fecha_fin": str(instance.fecha_fin),
                "estado": estado_para_n8n, # Puede ser: RECIBIDA, CONFIRMADA, CANCELADA
                "mensaje": mensaje_para_n8n
            }

            print(f"📡 [SIGNAL] Notificando a n8n: {estado_para_n8n} (ID: {instance.id})")
            
            try:
                requests.post(N8N_WEBHOOK_URL, json=payload, timeout=2)
                print("✅ [SIGNAL] Datos enviados a n8n.")
            except requests.exceptions.RequestException as e:
                print(f"⚠️ [SIGNAL] Error conexión n8n: {e}")

    except Exception as e:
        print(f"❌ [SIGNAL] Error interno: {e}")