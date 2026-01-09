from django.apps import AppConfig


class LmsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'lms'

    def ready(self):
        from .models import Course
        from accounts.models import User
        # Добавляем тестовые курсы, если их нет
        if not Course.objects.exists():
            try:
                user1 = User.objects.filter(email__icontains='admin').first() or User.objects.first()
                if user1:
                    Course.objects.create(title="Введение в Python", description="Основы Python", creator=user1)
                    Course.objects.create(title="React для начинающих", description="Изучение React", creator=user1)
                    Course.objects.create(title="Docker и DevOps", description="Контейнеризация", creator=user1)
<<<<<<< HEAD
            except:
                pass  # Игнорируем если нет пользователей
=======
                    Course.objects.create(title="JavaScript Advanced", description="Продвинутый JS", creator=user1)
                    Course.objects.create(title="Machine Learning Basics", description="Основы ML", creator=user1)
                    Course.objects.create(title="Web Security", description="Безопасность веб-приложений", creator=user1)
            except:
                pass
>>>>>>> ba8323e4338036c2699ea7b524557ad810a44fdb
