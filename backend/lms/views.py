from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from accounts.permissions import HasPermission, IsAuthenticatedUser


MOCK_COURSES = [
    {"id": 1, "title": "Введение в Python", "creator": "Мигранов Диньяр"},
    {"id": 2, "title": "React для начинающих", "creator": "Иван Сидоров"},
    {"id": 3, "title": "Docker и DevOps", "creator": "Мария Козлова"},
]


class CourseListView(APIView):
    permission_classes = [IsAuthenticatedUser, HasPermission("courses", "read")]
    
    def get(self, request):
        return Response(MOCK_COURSES, status=status.HTTP_200_OK)


class CourseCreateView(APIView):
    permission_classes = [IsAuthenticatedUser, HasPermission("courses", "create")]
    
    def post(self, request):
        new_course = {
            "id": len(MOCK_COURSES) + 1,
            "title": request.data.get("title", "Новый курс"),
            "creator": f"{request.user.first_name} {request.user.last_name}",
        }
        MOCK_COURSES.append(new_course)
        return Response(new_course, status=status.HTTP_201_CREATED)


class CourseDetailView(APIView):
    permission_classes = [IsAuthenticatedUser, HasPermission("courses", "read")]
    
    def get(self, request, pk):
        course = next((c for c in MOCK_COURSES if c["id"] == int(pk)), None)
        if not course:
            return Response({"detail": "Курс не найден"}, status=status.HTTP_404_NOT_FOUND)
        return Response(course)
