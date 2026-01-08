from django.urls import path
from .views import DeleteUserView, RegisterView, LoginView, MeView, LogoutView, SwitchRoleView

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("users/me/", DeleteUserView.as_view(), name="delete_user"),  # ← новый
    path("auth/switch-role/", SwitchRoleView.as_view(), name="switch_role"),
]
