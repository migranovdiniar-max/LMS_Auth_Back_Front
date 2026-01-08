from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from accounts.permissions import HasPermission, IsAuthenticatedUser
from .models import Course


class CourseListView(APIView):
    permission_classes = [IsAuthenticatedUser, HasPermission("courses", "read")]
    
    def get(self, request):
        courses = Course.objects.all()
        data = [{
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "creator": f"{course.creator.first_name} {course.creator.last_name}".strip() or course.creator.email,
            "created_at": course.created_at
        } for course in courses]
        return Response(data, status=status.HTTP_200_OK)


class CourseCreateView(APIView):
    permission_classes = [IsAuthenticatedUser, HasPermission("courses", "create")]
    
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
        return Response({
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "creator": f"{course.creator.first_name} {course.creator.last_name}".strip() or course.creator.email,
            "created_at": course.created_at
        }, status=status.HTTP_201_CREATED)


class CourseDetailView(APIView):
    permission_classes = [IsAuthenticatedUser, HasPermission("courses", "read")]
    
    def get(self, request, pk):
        try:
            course = Course.objects.get(id=pk)
            return Response({
                "id": course.id,
                "title": course.title,
                "description": course.description,
                "creator": f"{course.creator.first_name} {course.creator.last_name}".strip() or course.creator.email,
                "created_at": course.created_at
            })
        except Course.DoesNotExist:
            return Response({"detail": "Курс не найден"}, status=status.HTTP_404_NOT_FOUND)


class CourseUpdateView(APIView):
    permission_classes = [IsAuthenticatedUser, HasPermission("courses", "create")]
    
    def put(self, request, pk):
        try:
            course = Course.objects.get(id=pk)
            if course.creator != request.user:
                return Response({"error": "Not your course"}, status=403)
            course.title = request.data.get("title", course.title)
            course.description = request.data.get("description", course.description)
            course.save()
            return Response({
                "id": course.id,
                "title": course.title,
                "description": course.description,
                "creator": f"{course.creator.first_name} {course.creator.last_name}".strip() or course.creator.email,
                "created_at": course.created_at
            })
        except Course.DoesNotExist:
            return Response({"detail": "Курс не найден"}, status=status.HTTP_404_NOT_FOUND)
