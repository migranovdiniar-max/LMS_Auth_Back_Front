from django.db import models
from django.core.exceptions import ValidationError
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

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

class UserRole(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='roles')
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ['user', 'role']
    
    def __str__(self):
        return f"{self.user.email} -> {self.role.name}"

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
            patronymic=patronymic
        )
        
        student_role, _ = Role.objects.get_or_create(name="student")
        user.roles.add(student_role)
        
        if as_creator:
            creator_role, _ = Role.objects.get_or_create(name="creator")
            user.roles.add(creator_role)
        
        return user
    
    def set_password(self, password):
        self.password_hash = self.ph.hash(password)
        self.save(update_fields=['password_hash'])
    
    def check_password(self, password):
        try:
            self.ph.verify(self.password_hash, password)
            return True
        except VerifyMismatchError:
            return False
    
    def has_permission(self, resource, action):
        return self.roles.filter(
            rolepermission__permission__resource=resource,
            rolepermission__permission__action=action
        ).exists()
    
    def get_roles_list(self):
        return list(self.roles.values_list('name', flat=True))
