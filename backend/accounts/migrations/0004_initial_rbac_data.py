from django.db import migrations

def create_initial_data(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    Permission = apps.get_model('accounts', 'Permission')
    RolePermission = apps.get_model('accounts', 'RolePermission')

    # Создаём роли
    student_role, _ = Role.objects.get_or_create(
        name='student',
        defaults={'description': 'Студент — может просматривать курсы'}
    )
    creator_role, _ = Role.objects.get_or_create(
        name='creator',
        defaults={'description': 'Автор — может создавать и просматривать курсы'}
    )
    admin_role, _ = Role.objects.get_or_create(
        name='admin',
        defaults={'description': 'Администратор — управляет ролями и разрешениями'}
    )

    # Создаём разрешения
    courses_read, _ = Permission.objects.get_or_create(
        resource='courses',
        action='read',
        defaults={'description': 'Просмотр курсов'}
    )
    courses_create, _ = Permission.objects.get_or_create(
        resource='courses',
        action='create',
        defaults={'description': 'Создание курсов'}
    )
    acl_manage, _ = Permission.objects.get_or_create(
        resource='acl',
        action='manage',
        defaults={'description': 'Управление доступом'}
    )

    # Привязываем разрешения к ролям
    RolePermission.objects.get_or_create(role=student_role, permission=courses_read)
    RolePermission.objects.get_or_create(role=creator_role, permission=courses_read)
    RolePermission.objects.get_or_create(role=creator_role, permission=courses_create)
    RolePermission.objects.get_or_create(role=admin_role, permission=acl_manage)


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_alter_userrole_role_alter_userrole_user'),  # ← твоя последняя миграция
    ]

    operations = [
        migrations.RunPython(create_initial_data),
        migrations.RunPython(migrations.RunPython.noop),  # для возможности отката
    ]