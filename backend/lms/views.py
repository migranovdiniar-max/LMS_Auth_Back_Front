from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from accounts.permissions import IsAuthenticatedUser, HasPermission
from .models import Course

class CourseListView(APIView):
    permission_classes = [IsAuthenticatedUser, HasPermission]
    required_resource = "courses"
    required_action = "read"

    def get(self, request):
        courses = Course.objects.all()
        data = []
        for course in courses:
            creator_name = f"{course.creator.first_name} {course.creator.last_name}".strip()
            if not creator_name:
                creator_name = course.creator.email
            data.append({
                "id": course.id,
                "title": course.title,
                "description": course.description or "",
                "creator": creator_name,
                "created_at": course.created_at.isoformat() if course.created_at else None
            })
        return Response(data)


class CourseCreateView(APIView):
    permission_classes = [IsAuthenticatedUser, HasPermission]
    required_resource = "courses"
    required_action = "create"

    def post(self, request):
        title = request.data.get("title")
        description = request.data.get("description", "")

        if not title:
            return Response({"error": "Title is required"}, status=status.HTTP_400_BAD_REQUEST)

        course = Course.objects.create(
            title=title,
            description=description,
            creator=request.user
        )

        creator_name = f"{course.creator.first_name} {course.creator.last_name}".strip()
        if not creator_name:
            creator_name = course.creator.email

        return Response({
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "creator": creator_name,
            "created_at": course.created_at.isoformat() if course.created_at else None
        }, status=status.HTTP_201_CREATED)


class CourseDetailView(APIView):
    permission_classes = [IsAuthenticatedUser, HasPermission]
    required_resource = "courses"
    required_action = "read"

    def get(self, request, pk):
        try:
            course = Course.objects.get(id=pk)
            creator_name = f"{course.creator.first_name} {course.creator.last_name}".strip()
            if not creator_name:
                creator_name = course.creator.email
            return Response({
                "id": course.id,
                "title": course.title,
                "description": course.description or "",
                "creator": creator_name,
                "created_at": course.created_at.isoformat() if course.created_at else None
            })
        except Course.DoesNotExist:
            return Response({"detail": "Курс не найден"}, status=status.HTTP_404_NOT_FOUND)