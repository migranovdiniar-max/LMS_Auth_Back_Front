from django.apps import AppConfig
from django.db import IntegrityError


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        from .models import Role, Permission, RolePermission
        # Создаем роли
        try:
            student_role, _ = Role.objects.get_or_create(name="student", defaults={"description": "Студент"})
        except IntegrityError:
            student_role = Role.objects.get(name="student")
        try:
            creator_role, _ = Role.objects.get_or_create(name="creator", defaults={"description": "Создатель"})
        except IntegrityError:
            creator_role = Role.objects.get(name="creator")
        try:
            admin_role, _ = Role.objects.get_or_create(name="admin", defaults={"description": "Администратор"})
        except IntegrityError:
            admin_role = Role.objects.get(name="admin")

        # Создаем разрешения
        read_courses, _ = Permission.objects.get_or_create(resource="courses", action="read", defaults={"description": "Чтение курсов"})
        create_courses, _ = Permission.objects.get_or_create(resource="courses", action="create", defaults={"description": "Создание курсов"})
        manage_users, _ = Permission.objects.get_or_create(resource="users", action="manage", defaults={"description": "Управление пользователями"})
        manage_acl, _ = Permission.objects.get_or_create(resource="acl", action="manage", defaults={"description": "Управление доступом"})

        # Связываем роли и разрешения
        RolePermission.objects.get_or_create(role=student_role, permission=read_courses)
        RolePermission.objects.get_or_create(role=creator_role, permission=read_courses)
        RolePermission.objects.get_or_create(role=creator_role, permission=create_courses)
        RolePermission.objects.get_or_create(role=admin_role, permission=manage_users)
        RolePermission.objects.get_or_create(role=admin_role, permission=manage_acl)
