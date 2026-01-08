from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from .models import Token


class CustomTokenAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth = request.headers.get("Authorization")
        if not auth:
            return None

        if not auth.startswith("Token "):
            raise exceptions.AuthenticationFailed("Неверный формат заголовка Authorization")

        raw_token = auth.split(" ", 1)[1].strip()
        user = Token.validate_token(raw_token)
        if not user:
            raise exceptions.AuthenticationFailed("Неверный или просроченный токен")

        # DRF ждёт (user, auth)
        return (user, None)

    def authenticate_header(self, request):
        return "Token"
