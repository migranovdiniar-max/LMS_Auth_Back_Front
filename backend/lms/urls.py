from django.urls import path
from . import views

urlpatterns = [
    path("courses/", views.CourseListView.as_view(), name="course-list"),      # GET
    path("courses/create/", views.CourseCreateView.as_view(), name="course-create"),  # POST
    path("courses/<int:pk>/", views.CourseDetailView.as_view(), name="course-detail"),
]
