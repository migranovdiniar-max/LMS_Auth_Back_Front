# LMS Access Control System

## Схема управления ограничениями доступа

Система основана на ролевой модели (RBAC - Role-Based Access Control) с дополнительными разрешениями.

### Таблицы БД:
- **User**: Пользователи (email, password, first_name, last_name, patronymic, is_active).
- **Role**: Роли (name, description). Примеры: "student", "creator", "admin".
- **Permission**: Разрешения (resource, action, description). Resource: "courses", "lessons", "users", "acl". Action: "read", "create", "update", "delete", "manage".
- **RolePermission**: Связь ролей и разрешений (role, permission).
- **UserRole**: Связь пользователей и ролей (user, role).
- **Token**: Токены для аутентификации (user, token_hash, expires_at, is_revoked).

### Логика доступа:
- Пользователь аутентифицируется по токену (401 если токен отсутствует/неверный).
- Для ресурса проверяется наличие разрешения: user.roles -> role.permissions -> permission.resource == resource and permission.action == action.
- Если доступа нет, 403 Forbidden.
- Администратор (роль "admin") имеет разрешения на "acl" "manage" для управления ролями/разрешениями.

### Тестовые данные:
- Роли: student, creator, admin.
- Разрешения: courses:read/create, users:manage, acl:manage.
- Пользователи: обычные с student/creator, один admin.

### API для администратора:
- GET /api/admin/users/ - список пользователей с ролями (требует acl:manage).
- POST /api/admin/assign-role/ - назначить роль пользователю (user_id, role_name).
- GET /api/admin/roles/ - список ролей.
- POST /api/admin/create-permission/ - создать разрешение.

Все эндпоинты требуют аутентификации и соответствующих разрешений.