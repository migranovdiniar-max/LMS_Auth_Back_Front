import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile, useUpdateProfile, useDeleteUser, useLogout, useSwitchRole } from '../hooks/useAuth';
<<<<<<< HEAD
=======
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
>>>>>>> ba8323e4338036c2699ea7b524557ad810a44fdb

const ProfilePage = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile();
  const updateMutation = useUpdateProfile();
  const deleteMutation = useDeleteUser();
  const logoutMutation = useLogout();
  const switchRoleMutation = useSwitchRole();
<<<<<<< HEAD
=======
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const createMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();
>>>>>>> ba8323e4338036c2699ea7b524557ad810a44fdb

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

<<<<<<< HEAD
  if (!authorized) return <div>Проверка авторизации...</div>;

  if (profileLoading) return <div>Загрузка...</div>;
=======
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
>>>>>>> ba8323e4338036c2699ea7b524557ad810a44fdb
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
<<<<<<< HEAD
          width: 350px; height: 700px; /* увеличил высоту */
          overflow-y: auto; /* добавил прокрутку */
          background: url("https://doc-08-2c-docs.googleusercontent.com/docs/securesc/68c90smiglihng9534mvqmq1946dmis5/fo0picsp1nhiucmc0l25s29respgpr4j/1631524275000/03522360960922298374/03522360960922298374/1Sx0jhdpEpnNIydS4rnN4kHSJtU1EyWka?e=view&authuser=0&nonce=gcrocepgbb17m&user=03522360960922298374&hash=tfhgbs86ka6divo3llbvp93mg4csvb38") no-repeat center/ cover;
          border-radius: 10px; box-shadow: 5px 20px 50px #000;
          padding: 20px; color: #fff;
          position: relative;
        }
        .main::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.5); /* полупрозрачный оверлей для лучшей читабельности текста */
          border-radius: 10px;
          z-index: 1;
        }
        .main > * {
          position: relative;
          z-index: 2;
        }
        .profile-info { margin-bottom: 20px; }
        .profile-info p { margin: 10px 0; font-size: 16px; }
        form { margin-bottom: 20px; }
        input {
          width: 80%; height: 35px; background: #e0dede;
          display: flex; margin: 12px auto; padding: 8px 12px;
          border: none; outline: none; border-radius: 5px; font-size: 14px;
        }
        button {
          width: 80%; height: 40px; margin: 10px auto; /* уменьшил margin */
          display: block; color: #fff; background: #573b8a;
          font-size: 1em; font-weight: bold; border: none;
          border-radius: 5px; transition: .2s ease-in; cursor: pointer;
=======
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
>>>>>>> ba8323e4338036c2699ea7b524557ad810a44fdb
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
<<<<<<< HEAD
          <input name="first_name" placeholder="Имя" value={editData.first_name} onChange={handleEditChange} />
          <input name="last_name" placeholder="Фамилия" value={editData.last_name} onChange={handleEditChange} />
          <input name="patronymic" placeholder="Отчество" value={editData.patronymic} onChange={handleEditChange} />
=======
          <input name="first_name" placeholder="Имя" value={editData.first_name} onChange={(e) => setEditData({ ...editData, [e.target.name]: e.target.value })} />
          <input name="last_name" placeholder="Фамилия" value={editData.last_name} onChange={(e) => setEditData({ ...editData, [e.target.name]: e.target.value })} />
          <input name="patronymic" placeholder="Отчество" value={editData.patronymic} onChange={(e) => setEditData({ ...editData, [e.target.name]: e.target.value })} />
>>>>>>> ba8323e4338036c2699ea7b524557ad810a44fdb
          <button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Обновление...' : 'Обновить профиль'}
          </button>
        </form>

<<<<<<< HEAD
        <button onClick={handleSwitchRole} disabled={switchRoleMutation.isPending}>
          {switchRoleMutation.isPending ? 'Смена...' : 'Сменить роль'}
        </button>

        <button onClick={handleGoToCourses}>Курсы</button>

        <button className="logout-btn" onClick={handleLogout} disabled={logoutMutation.isPending}>
          {logoutMutation.isPending ? 'Выход...' : 'Выйти'}
        </button>

        <button className="delete-btn" onClick={handleDelete} disabled={deleteMutation.isPending}>
          {deleteMutation.isPending ? 'Удаление...' : 'Удалить аккаунт'}
=======
        <button onClick={() => switchRoleMutation.mutate(undefined)} disabled={switchRoleMutation.isPending}>
          {switchRoleMutation.isPending ? 'Смена...' : 'Сменить роль'}
        </button>

        <button onClick={() => logoutMutation.mutate(undefined)} disabled={logoutMutation.isPending}>
          {logoutMutation.isPending ? 'Выход...' : 'Выйти'}
>>>>>>> ba8323e4338036c2699ea7b524557ad810a44fdb
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