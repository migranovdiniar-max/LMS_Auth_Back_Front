import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile, useUpdateProfile, useDeleteUser, useLogout, useSwitchRole } from '../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/lms/courses/', {
        headers: { 'Authorization': `Token ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    },
  });
};

const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/lms/courses/create/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create course');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { title: string; description: string } }) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/lms/courses/${id}/update/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update course');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile();
  const updateMutation = useUpdateProfile();
  const deleteMutation = useDeleteUser();
  const logoutMutation = useLogout();
  const switchRoleMutation = useSwitchRole();
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const createMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();

  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthorized(true);
    } else {
      navigate('/auth');
    }
  }, [navigate]);

  useEffect(() => {
    if (profileError) {
      navigate('/auth');
    }
  }, [profileError, navigate]);

  const [editData, setEditData] = useState({
    first_name: '',
    last_name: '',
    patronymic: ''
  });
  const [newCourse, setNewCourse] = useState({ title: '', description: '' });
  const [editingCourse, setEditingCourse] = useState<{ id: number; title: string; description: string } | null>(null);

  const isCreator = profile?.roles?.includes('creator');

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(editData, {
      onSuccess: () => {
        alert('Профиль обновлен!');
        setEditData({ first_name: '', last_name: '', patronymic: '' });
      },
      onError: (error: any) => {
        alert('Ошибка обновления: ' + error.message);
      },
    });
  };

  const handleDelete = () => {
    if (window.confirm('Вы уверены, что хотите удалить аккаунт?')) {
      deleteMutation.mutate(undefined, {
        onSuccess: () => {
          alert('Аккаунт удален!');
          navigate('/auth');
        },
        onError: (error: any) => {
          alert('Ошибка удаления: ' + error.message);
        },
      });
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/auth');
      },
      onError: (error: any) => {
        alert('Ошибка выхода: ' + error.message);
      },
    });
  };

  const handleSwitchRole = () => {
    switchRoleMutation.mutate(undefined, {
      onSuccess: () => {
        alert('Роль сменена!');
      },
      onError: (error: any) => {
        alert('Ошибка смены роли: ' + error.message);
      },
    });
  };

  const handleGoToCourses = () => {
    navigate('/courses');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newCourse, {
      onSuccess: () => {
        setNewCourse({ title: '', description: '' });
        alert('Курс создан!');
      },
      onError: (error: any) => {
        alert('Ошибка: ' + error.message);
      },
    });
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse({ id: course.id, title: course.title, description: course.description });
  };

  const handleUpdateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourse) {
      updateCourseMutation.mutate({ id: editingCourse.id, data: { title: editingCourse.title, description: editingCourse.description } }, {
        onSuccess: () => {
          setEditingCourse(null);
          alert('Курс обновлен!');
        },
        onError: (error: any) => {
          alert('Ошибка: ' + error.message);
        },
      });
    }
  };

  if (!authorized) return <div>Проверка авторизации...</div>;

  if (profileLoading || coursesLoading) return <div>Загрузка...</div>;
  if (profileError) return <div>Ошибка загрузки профиля</div>;

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          display: flex; justify-content: center; align-items: center;
          min-height: 100vh; font-family: 'Jost', sans-serif;
          background: linear-gradient(to bottom, #0f0c29, #302b63, #24243e);
          color: white;
        }
        .header {
          position: fixed;
          top: 0; left: 0;
          width: 300px;
          height: 100vh;
          background: rgba(0, 0, 0, 0.8);
          padding: 20px;
          overflow-y: auto;
          color: white;
        }
        .main {
          margin-left: 320px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: white;
        }
        .courses {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          width: 100%;
          max-width: 1200px;
        }
        .course {
          background: white;
          border-radius: 10px;
          padding: 15px;
          text-align: center;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
          color: black;
        }
        .course h3 { margin: 10px 0; }
        .course p { font-size: 14px; }
        form { margin: 20px 0; }
        input, textarea { width: 100%; padding: 8px; margin: 5px 0; border: none; border-radius: 5px; }
        button { padding: 10px 15px; background: #573b8a; color: #fff; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
        button:hover { background: #6d44b8; }
        .edit-form { margin-top: 10px; }
      `}</style>

      <div className="header">
        <h2>Профиль</h2>
        <p>Email: {profile?.email}</p>
        <p>Имя: {profile?.first_name}</p>
        <p>Фамилия: {profile?.last_name}</p>
        <p>Отчество: {profile?.patronymic}</p>
        <p>Роль: {isCreator ? 'Автор' : 'Студент'}</p>

        <form onSubmit={handleUpdate}>
          <input name="first_name" placeholder="Имя" value={editData.first_name} onChange={(e) => setEditData({ ...editData, [e.target.name]: e.target.value })} />
          <input name="last_name" placeholder="Фамилия" value={editData.last_name} onChange={(e) => setEditData({ ...editData, [e.target.name]: e.target.value })} />
          <input name="patronymic" placeholder="Отчество" value={editData.patronymic} onChange={(e) => setEditData({ ...editData, [e.target.name]: e.target.value })} />
          <button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Обновление...' : 'Обновить профиль'}
          </button>
        </form>

        <button onClick={() => switchRoleMutation.mutate(undefined)} disabled={switchRoleMutation.isPending}>
          {switchRoleMutation.isPending ? 'Смена...' : 'Сменить роль'}
        </button>

        <button onClick={() => logoutMutation.mutate(undefined)} disabled={logoutMutation.isPending}>
          {logoutMutation.isPending ? 'Выход...' : 'Выйти'}
        </button>

        <button onClick={() => deleteMutation.mutate(undefined)} disabled={deleteMutation.isPending}>
          {deleteMutation.isPending ? 'Удаление...' : 'Удалить аккаунт'}
        </button>
      </div>

      <div className="main">
        <h1>Курсы</h1>
        <div className="courses">
          {courses?.map((course: any) => (
            <div key={course.id} className="course">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p>Создатель: {course.creator}</p>
              {isCreator && (
                <button onClick={() => handleEditCourse(course)}>Редактировать</button>
              )}
              {editingCourse?.id === course.id && (
                <form onSubmit={handleUpdateCourse} className="edit-form">
                  <input
                    type="text"
                    value={editingCourse.title}
                    onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  />
                  <textarea
                    value={editingCourse.description}
                    onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  />
                  <button type="submit" disabled={updateCourseMutation.isPending}>
                    {updateCourseMutation.isPending ? 'Обновление...' : 'Сохранить'}
                  </button>
                  <button type="button" onClick={() => setEditingCourse(null)}>Отмена</button>
                </form>
              )}
            </div>
          ))}
        </div>

        {isCreator && (
          <form onSubmit={handleCreate}>
            <h2>Создать курс</h2>
            <input
              type="text"
              placeholder="Название"
              value={newCourse.title}
              onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Описание"
              value={newCourse.description}
              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
            />
            <button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Создание...' : 'Создать'}
            </button>
          </form>
        )}
      </div>
    </>
  );
};

export default ProfilePage;