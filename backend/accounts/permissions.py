from rest_framework import permissions

class IsAuthenticatedUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_active)

class HasPermission(permissions.BasePermission):
    """
    Гибкая проверка разрешения через атрибуты вьюхи:
    required_resource = "courses"
    required_action = "read"
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_active:
            return False
        
        resource = getattr(view, 'required_resource', None)
        action = getattr(view, 'required_action', None)
        
        if not resource or not action:
            return False
        
        return request.user.has_permission(resource, action)

class IsCreator(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_active:
            return False
        return "creator" in request.user.get_roles_list()