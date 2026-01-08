from rest_framework import permissions
from .models import User


class IsAuthenticatedUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_active)


class HasPermission(permissions.BasePermission):
    """Проверяет конкретное разрешение (resource, action)"""
    
    def __init__(self, resource, action):
        self.resource = resource
        self.action = action
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_active:
            return False
        return request.user.has_permission(self.resource, self.action)


class IsCreator(permissions.BasePermission):
    """Только пользователи с ролью creator"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_active:
            return False
        return "creator" in request.user.get_roles_list()
