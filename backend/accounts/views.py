from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
import secrets
import hashlib

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user_serializer = UserSerializer(user)
            return Response(user_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            token = secrets.token_urlsafe(32)
            token_hash = hashlib.sha256(token.encode()).hexdigest()
            
            request.session['token'] = token_hash
            request.user = user
            
            user_serializer = UserSerializer(user)
            return Response({
                'access_token': token,
                'token_type': 'bearer',
                'user': user_serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MeView(APIView):
    def get(self, request):
        if hasattr(request, 'user') and request.user.is_active:
            serializer = UserSerializer(request.user)
            return Response(serializer.data)
        return Response({'error': 'Не авторизован'}, status=status.HTTP_401_UNAUTHORIZED)
