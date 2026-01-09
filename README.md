# LMS Authentication & Authorization System
### Цель: 
реализовать backend-приложение – собственную систему аутентификации и авторизации. Приложение не должно быть
соответствующих полностью основано на фреймворков, идущих «из коробки». Продемонстрировать умение работы с DRF в связке с React. Реализовать минимальные вымышленные объекты бизнес-приложения, к которым
могла бы применяться созданная система.

### Описание: 
проект представляет собой псевдо-LMS приложение: реализованы аутентификация, разделение на роли(студент и автор), профиль пользователя, обучающиеся курсы(создание и просмотр). В виду того, что целью работы являлось создание backend-приложение – собственную систему аутентификации и авторизации, остальные аспекты минимальны и являются лишь вспомогательными. Минимальный фронтенд, а также вымышленный объект бизнес-приложение(LMS).

## Описание системы разграничения прав доступа (RBAC)

### Схема базы данных

1. **User** — пользователи системы (email, имена, password_hash, is_active).
2. **Role** — роли (name, description). Примеры: student, creator, admin.
3. **Permission** — разрешения (resource, action, description).  
   Примеры:  
   - resource="courses", action="read"  
   - resource="courses", action="create"  
   - resource="acl", action="manage"
4. **RolePermission** — связь многие-ко-многим между Role и Permission.
5. **UserRole** — связь многие-ко-многим между User и Role.
6. **Token** — токены аутентификации (хэш токена, expires_at, is_revoked).

### Логика доступа
- При регистрации пользователь автоматически получает роль **student**.
- Проверка прав происходит в `HasPermission`: ищет, есть ли у пользователя через роли нужное разрешение (resource:action).
- Без токена → 401 Unauthorized.
- С токеном, но без права → 403 Forbidden.

### Тестовые данные (создаются автоматически миграцией 0004_initial_rbac_data)
- Роли: student, creator, admin
- Разрешения: courses:read, courses:create, acl:manage
- Привязки:
  - student → courses:read
  - creator → courses:read + courses:create
  - admin → acl:manage

### Админские API (только для роли admin)
- GET /api/admin/users/ — список пользователей с ролями
- POST /api/admin/assign-role/ — назначить роль (body: {"user_id": 1, "role_name": "creator"})
- GET /api/admin/roles/ — список ролей
- POST /api/admin/create-permission/ — создать новое разрешение (body: {"resource": "lessons", "action": "read", "description": "..."})

## Запуск проекта
1. `python manage.py migrate` — создаст все таблицы и тестовые данные
2. `python manage.py runserver`
3. Фронтенд: `npm run dev` в папке frontend

Проект демонстрирует полностью собственную систему аутентификации и RBAC без использования встроенных механизмов Django Auth.
