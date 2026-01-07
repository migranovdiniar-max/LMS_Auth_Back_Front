from rest_framework import serializers
from .models import User

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(min_length=8, required=True, write_only=True)
    password_repeat = serializers.CharField(min_length=8, required=True, write_only=True)
    first_name = serializers.CharField(max_length=50, allow_blank=True)
    last_name = serializers.CharField(max_length=50, allow_blank=True)
    patronymic = serializers.CharField(max_length=50, allow_blank=True)
    as_creator = serializers.BooleanField(default=False)
    
    def validate(self, data):
        if data['password'] != data['password_repeat']:
            raise serializers.ValidationError("Пароли не совпадают")
        
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("Пользователь с таким email уже существует")
        
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_repeat')  
        
        return User.create(**validated_data)

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(min_length=8, required=True, write_only=True)
    
    def validate(self, data):
        user = User.objects.filter(email=data['email'], is_active=True).first()
        
        if user and user.check_password(data['password']):
            data['user'] = user
            return data
        
        raise serializers.ValidationError("Неверный email или пароль")

class UserSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'patronymic', 
            'is_active', 'created_at', 'roles'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_roles(self, obj):
        return obj.get_roles_list()
