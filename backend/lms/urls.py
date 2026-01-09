from django.urls import path
from .views import CourseListView, CourseCreateView, CourseDetailView, CourseUpdateView

urlpatterns = [
    path("lms/courses/", CourseListView.as_view(), name="course-list"),
    path("lms/courses/create/", CourseCreateView.as_view(), name="course-create"),
    path("lms/courses/<int:pk>/", CourseDetailView.as_view(), name="course-detail"),
    path("lms/courses/<int:pk>/update/", CourseUpdateView.as_view(), name="course-update"),
]
