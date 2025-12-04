from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny 
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
# 👇 1. IMPORTAR JWT
from rest_framework_simplejwt.authentication import JWTAuthentication 
from django.contrib.auth.models import User, Group
from .models import Reserva, Sala, EstadoReserva, Notificacion
from .serializers import (
    ReservaSerializer, SalaSerializer,
    EstadoReservaSerializer, NotificacionSerializer,
    UserSerializer
)
from .permissions import IsAdminOrCajero, IsAdminUserOrReadOnly 
from rest_framework.views import APIView

# --- INTEGRACIÓN GEMINI (IA) ---
import google.generativeai as genai
import json 

# TU API KEY
GEMINI_API_KEY = "AIzaSyBl0eU-hAQ2YBUjCdC_Sy4GtnCnbQnEC64" 

try:
    genai.configure(api_key=GEMINI_API_KEY)
except Exception as e:
    print(f"Error configurando Gemini: {e}")

# -------------------------------------------------------------
# REGISTRO DE USUARIOS
# -------------------------------------------------------------
@api_view(['POST'])
@permission_classes([AllowAny]) 
def register_user(request):
    data = request.data.copy()
    serializer = UserSerializer(data=data)
    if serializer.is_valid():
        user = serializer.save()
        try:
            cajero_group = Group.objects.get(name__iexact='Cajero')
            user.groups.add(cajero_group)
        except Exception as e:
             print(f"Advertencia grupo: {e}")
        return Response({"message": "Usuario registrado"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# -------------------------------------------------------------
# VIEWSETS
# -------------------------------------------------------------
class SalaViewSet(viewsets.ModelViewSet):
    queryset = Sala.objects.all()
    serializer_class = SalaSerializer
    permission_classes = [AllowAny] 

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUserOrReadOnly] 

class ReservaViewSet(viewsets.ModelViewSet):
    queryset = Reserva.objects.all().order_by('-creada_en')
    serializer_class = ReservaSerializer
    
    # 👇 2. AQUÍ ESTÁ LA CORRECCIÓN: ACEPTAMOS LOS 3 TIPOS
    authentication_classes = [JWTAuthentication, TokenAuthentication, SessionAuthentication]
    
    def get_permissions(self):
        # 1. Crear: Público
        if self.action == 'create':
            return [AllowAny()]
        
        # 2. Cancelar: Bot (Token) o Admin (JWT/Session)
        if self.action == 'cancelar':
            return [IsAuthenticated()]
            
        # 3. Resto: Admin o Cajero
        return [IsAdminOrCajero()]

    @action(detail=True, methods=['post']) 
    def confirmar(self, request, pk=None):
        reserva = self.get_object()
        try:
            confirmado = EstadoReserva.objects.get(nombre__iexact='CONFIRMADA')
            reserva.estado = confirmado
            reserva.save()
            return Response({'status': 'confirmada'}, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    @action(detail=True, methods=['post']) 
    def cancelar(self, request, pk=None):
        reserva = self.get_object()
        try:
            cancelado = EstadoReserva.objects.get(nombre__iexact='CANCELADA')
            reserva.estado = cancelado
            reserva.save()
            return Response({'status': 'cancelada', 'msg': f'Cancelada por {request.user.username}'}, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class EstadoReservaViewSet(viewsets.ModelViewSet):
    queryset = EstadoReserva.objects.all()
    serializer_class = EstadoReservaSerializer
    permission_classes = [IsAdminUserOrReadOnly]

class NotificacionViewSet(viewsets.ModelViewSet):
    queryset = Notificacion.objects.all().order_by('-creada_en')
    serializer_class = NotificacionSerializer
    permission_classes = [IsAdminUserOrReadOnly]

class UserInfoView(APIView):
    # También aquí agregamos JWT explícito por si acaso, aunque suele heredar de settings
    authentication_classes = [JWTAuthentication, TokenAuthentication, SessionAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        role = "admin" if user.is_staff else "cajero" if user.groups.filter(name__iexact='cajero').exists() else "usuario"
        return Response({
            "id": user.id, 
            "username": user.username, 
            "email": user.email, 
            "role": role,
            "nombre": f"{user.first_name} {user.last_name}".strip() or user.username
        })

# -------------------------------------------------------------
# CHATBOT (Sin cambios)
# -------------------------------------------------------------
class ChatBotView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user_message = request.data.get('message', '')
        history = request.data.get('history', []) 

        if not user_message:
            return Response({"error": "Vacio"}, status=400)

        try:
            salas = Sala.objects.filter(disponible=True)
            info_salas = ""
            for s in salas:
                info_salas += f"- ID {s.id}: {s.nombre} (Capacidad {s.capacidad}). {s.descripcion}\n"
            if not info_salas: info_salas = "No hay salas disponibles."

            system_prompt = f"""
            Eres 'ChrisBot', el agente de reservas inteligente.
            
            TUS DATOS (SALAS):
            {info_salas}
            
            FORMATO JSON OBLIGATORIO (NO MARKDOWN):
            {{
                "respuesta": "Texto aquí...",
                "intencion": "CONSULTA" o "RESERVAR",
                "id_sala": null o el ID numérico
            }}

            REGLAS:
            1. Mantén el hilo de la conversación usando el historial.
            2. Si el usuario dice "esa misma" o "la que dijiste", revisa el historial para saber cuál es.
            3. Si detectas intención de reservar, devuelve "RESERVAR" y el ID correcto.
            4. Responde en español.
            """

            chat_history = [
                {"role": "user", "parts": [system_prompt]},
                {"role": "model", "parts": ['{"respuesta": "Entendido, sistema listo.", "intencion": "CONSULTA", "id_sala": null}']}
            ]

            for msg in history:
                role = "model" if msg.get('role') == 'bot' or msg.get('sender') == 'bot' else "user"
                parts = msg.get('parts', [])
                text = parts[0] if isinstance(parts, list) and parts else str(parts)
                
                if text:
                    chat_history.append({"role": role, "parts": [text]})

            model = genai.GenerativeModel('gemini-2.0-flash', generation_config={"response_mime_type": "application/json"})
            chat = model.start_chat(history=chat_history)
            response = chat.send_message(user_message)
            
            return Response(json.loads(response.text))

        except Exception as e:
            print(f"❌ Error Gemini: {e}")
            return Response({
                "respuesta": "Lo siento, perdí la conexión con mi cerebro digital. ¿Podrías repetirlo?", 
                "intencion": "CONSULTA", 
                "id_sala": None
            }, status=200)