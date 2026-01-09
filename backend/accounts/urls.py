from django.urls import path
from .views import (
    AdminAssignRoleView,
    AdminCreatePermissionView,
    AdminRoleListView,
    AdminUserListView,
    BecomeCreatorView,
    RegisterView,
    LoginView,
    MeView,
    LogoutView,
    DeleteUserView,
    ChangeRoleView,
)

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),

    path("users/me/", DeleteUserView.as_view(), name="delete_user"),

    
    path("auth/change-role/", ChangeRoleView.as_view(), name="change-role"),
    path("auth/become-creator/", BecomeCreatorView.as_view(), name="become-creator"),

    path("admin/users/", AdminUserListView.as_view(), name="admin-users"),
    path("admin/assign-role/", AdminAssignRoleView.as_view(), name="admin-assign-role"),
    path("admin/roles/", AdminRoleListView.as_view(), name="admin-roles"),
    path("admin/create-permission/", AdminCreatePermissionView.as_view(), name="admin-create-permission"),
]
