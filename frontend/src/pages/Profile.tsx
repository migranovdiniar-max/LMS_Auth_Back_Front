import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile, useUpdateProfile, useDeleteUser, useLogout, useBecomeCreator } from '../hooks/useAuth';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile();
  const updateMutation = useUpdateProfile();
  const deleteMutation = useDeleteUser();
  const logoutMutation = useLogout();
  const becomeCreatorMutation = useBecomeCreator();

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
    });
  };

  const handleBecomeCreator = () => {
    becomeCreatorMutation.mutate();
  };

  const handleDelete = () => {
    if (window.confirm('Вы уверены, что хотите удалить аккаунт?')) {
      deleteMutation.mutate();
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleGoToCourses = () => {
    navigate('/courses');
  };

  if (!authorized) return <div>Проверка авторизации...</div>;
  if (profileLoading) return <div>Загрузка...</div>;
  if (profileError) return <div>Ошибка загрузки профиля</div>;

  const isCreator = profile?.roles?.includes('creator');

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family:Jost:wght@500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          display: flex; justify-content: center; align-items: center;
          min-height: 100vh; font-family: 'Jost', sans-serif;
          background: linear-gradient(to bottom, #0f0c29, #302b63, #24243e);
        }
        .main {
          width: 350px; height: 700px;
          overflow-y: auto;
          background: url("https://doc-08-2c-docs.googleusercontent.com/docs/securesc/68c90smiglihng9534mvqmq1946dmis5/fo0picsp1nhiucmc0l25s29respgpr4j/1631524275000/03522360960922298374/03522360960922298374/1Sx0jhdpEpnNIydS4rnN4kHSJtU1EyWka?e=view&authuser=0&nonce=gcrocepgbb17m&user=03522360960922298374&hash=tfhgbs86ka6divo3llbvp93mg4csvb38") no-repeat center/ cover;
          border-radius: 10px; box-shadow: 5px 20px 50px #000;
          padding: 20px; color: #fff;
          position: relative;
        }
        .main::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.5);
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
          width: 80%; height: 40px; margin: 10px auto;
          display: block; color: #fff; background: #573b8a;
          font-size: 1em; font-weight: bold; border: none;
          border-radius: 5px; transition: .2s ease-in; cursor: pointer;
        }
        button:hover:not(:disabled) { background: #6d44b8; }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
        .creator-btn { background: #5cb85c; }
        .creator-btn:hover:not(:disabled) { background: #4cae4c; }
        .delete-btn { background: #d9534f; }
        .delete-btn:hover:not(:disabled) { background: #c9302c; }
        .logout-btn { background: #f0ad4e; }
        .logout-btn:hover:not(:disabled) { background: #ec971f; }
      `}</style>

      <div className="main">
        <div className="profile-info">
          <h2>Профиль</h2>
          <p>Email: {profile?.email}</p>
          <p>Имя: {profile?.first_name || '—'}</p>
          <p>Фамилия: {profile?.last_name || '—'}</p>
          <p>Отчество: {profile?.patronymic || '—'}</p>
          <p>Статус: {isCreator ? 'Вы автор курсов ✓' : 'Вы студент'}</p>
        </div>

        <form onSubmit={handleUpdate}>
          <input name="first_name" placeholder="Новое имя" value={editData.first_name} onChange={handleEditChange} />
          <input name="last_name" placeholder="Новая фамилия" value={editData.last_name} onChange={handleEditChange} />
          <input name="patronymic" placeholder="Новое отчество" value={editData.patronymic} onChange={handleEditChange} />
          <button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Обновление...' : 'Обновить профиль'}
          </button>
        </form>

        {!isCreator && (
          <button className="creator-btn" onClick={handleBecomeCreator} disabled={becomeCreatorMutation.isPending}>
            {becomeCreatorMutation.isPending ? 'Обработка...' : 'Стать автором курсов'}
          </button>
        )}

        {isCreator && (
          <p style={{ textAlign: 'center', color: '#5cb85c', fontWeight: 'bold', margin: '10px 0' }}>
            ✓ Теперь вы можете создавать курсы!
          </p>
        )}

        <button onClick={handleGoToCourses}>Перейти к курсам</button>

        <button className="logout-btn" onClick={handleLogout} disabled={logoutMutation.isPending}>
          {logoutMutation.isPending ? 'Выход...' : 'Выйти'}
        </button>

        <button className="delete-btn" onClick={handleDelete} disabled={deleteMutation.isPending}>
          {deleteMutation.isPending ? 'Удаление...' : 'Удалить аккаунт'}
        </button>
      </div>
    </>
  );
};

export default ProfilePage;