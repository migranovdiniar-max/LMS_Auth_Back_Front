from django.db import models
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from django.utils import timezone
from datetime import timedelta
import secrets
import hashlib


class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Roles"

    def __str__(self):
        return self.name


class Permission(models.Model):
    RESOURCE_CHOICES = [
        ('courses', 'Courses'),
        ('lessons', 'Lessons'),
        ('users', 'Users'),
        ('acl', 'Access Control'),
    ]

    ACTION_CHOICES = [
        ('read', 'Read'),
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('manage', 'Manage'),
    ]

    resource = models.CharField(max_length=20, choices=RESOURCE_CHOICES)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    description = models.TextField(blank=True)

    class Meta:
        unique_together = ['resource', 'action']
        verbose_name_plural = "Permissions"

    def __str__(self):
        return f"{self.get_resource_display()}:{self.get_action_display()}"


class RolePermission(models.Model):
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)

    class Meta:
        unique_together = ['role', 'permission']

    def __str__(self):
        return f"{self.role.name} -> {self.permission}"


class User(models.Model):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=50, blank=True)
    last_name = models.CharField(max_length=50, blank=True)
    patronymic = models.CharField(max_length=50, blank=True, verbose_name="Отчество")
    password_hash = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    ph = PasswordHasher()

    class Meta:
        verbose_name_plural = "Users"

    def __str__(self):
        return self.email

    @classmethod
    def create(cls, email, password, first_name="", last_name="", patronymic="", as_creator=False):
        user = cls.objects.create(
            email=email,
            password_hash=cls.ph.hash(password),
            first_name=first_name,
            last_name=last_name,
            patronymic=patronymic,
        )

        student_role, _ = Role.objects.get_or_create(name="student")
        UserRole.objects.create(user=user, role=student_role)

        if as_creator:
            creator_role, _ = Role.objects.get_or_create(name="creator")
            UserRole.objects.create(user=user, role=creator_role)

        return user

    def set_password(self, password: str):
        self.password_hash = self.ph.hash(password)
        self.save(update_fields=["password_hash"])

    def check_password(self, password: str) -> bool:
        try:
            self.ph.verify(self.password_hash, password)
            return True
        except VerifyMismatchError:
            return False

    def has_permission(self, resource: str, action: str) -> bool:
        return self.roles.filter(
            rolepermission__permission__resource=resource,
            rolepermission__permission__action=action,
        ).exists()

    def get_roles_list(self):
        return list(self.user_roles.values_list("role__name", flat=True))


class UserRole(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_roles")
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="roles")

    class Meta:
        unique_together = ["user", "role"]

    def __str__(self):
        return f"{self.user.email} -> {self.role.name}"


class Token(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tokens")
    token = models.CharField(max_length=255, unique=True)       # отдаём клиенту
    token_hash = models.CharField(max_length=64, unique=True)   # храним для поиска
    expires_at = models.DateTimeField()
    is_revoked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Tokens"

    def __str__(self):
        return f"Token {self.token[:8]}... for {self.user.email}"

    @classmethod
    def create_token(cls, user):
        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        expires_at = timezone.now() + timedelta(hours=24)

        cls.objects.create(
            user=user,
            token=raw_token,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        return raw_token

    @classmethod
    def validate_token(cls, raw_token):
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        try:
            obj = cls.objects.get(
                token_hash=token_hash,
                is_revoked=False,
                expires_at__gt=timezone.now(),
            )
            return obj.user
        except cls.DoesNotExist:
            return None
