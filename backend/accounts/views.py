from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from .models import Token
from .permissions import IsAuthenticatedUser
from rest_framework import exceptions


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            access_token = Token.create_token(user)
            return Response(
                {
                    "access_token": access_token,
                    "token_type": "bearer",
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request):
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def post(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise exceptions.AuthenticationFailed("Токен не передан")

        raw_token = auth_header.split(" ", 1)[1].strip()

        from hashlib import sha256
        from django.utils import timezone

        token_hash = sha256(raw_token.encode()).hexdigest()

        try:
            token_obj = Token.objects.get(
                token_hash=token_hash,
                is_revoked=False,
            )
        except Token.DoesNotExist:
            return Response({"detail": "Уже разлогинен или токен не найден"}, status=200)

        token_obj.is_revoked = True
        token_obj.expires_at = timezone.now()
        token_obj.save(update_fields=["is_revoked", "expires_at"])

        return Response({"detail": "Logged out"}, status=200)


class DeleteUserView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def delete(self, request):
        user = request.user
        
        user.is_active = False
        user.save(update_fields=['is_active'])
        
        from django.utils import timezone
        user.tokens.filter(is_revoked=False).update(
            is_revoked=True,
            expires_at=timezone.now()
        )
        
        return Response(status=status.HTTP_204_NO_CONTENT)
