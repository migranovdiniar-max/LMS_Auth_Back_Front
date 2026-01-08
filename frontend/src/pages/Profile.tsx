import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile, useUpdateProfile, useDeleteUser, useLogout } from '../hooks/useAuth';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile();
  const updateMutation = useUpdateProfile();
  const deleteMutation = useDeleteUser();
  const logoutMutation = useLogout();

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

  if (profileLoading) return <div>Загрузка...</div>;
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
        }
        .main {
          width: 350px; height: 580px; overflow: hidden;
          background: url("https://doc-08-2c-docs.googleusercontent.com/docs/securesc/68c90smiglihng9534mvqmq1946dmis5/fo0picsp1nhiucmc0l25s29respgpr4j/1631524275000/03522360960922298374/03522360960922298374/1Sx0jhdpEpnNIydS4rnN4kHSJtU1EyWka?e=view&authuser=0&nonce=gcrocepgbb17m&user=03522360960922298374&hash=tfhgbs86ka6divo3llbvp93mg4csvb38") no-repeat center/ cover;
          border-radius: 10px; box-shadow: 5px 20px 50px #000;
          padding: 20px; color: #fff;
        }
        .profile-info { margin-bottom: 20px; }
        .profile-info p { margin: 10px 0; }
        form { margin-bottom: 20px; }
        input {
          width: 80%; height: 35px; background: #e0dede;
          display: flex; margin: 12px auto; padding: 8px 12px;
          border: none; outline: none; border-radius: 5px; font-size: 14px;
        }
        button {
          width: 80%; height: 40px; margin: 15px auto;
          display: block; color: #fff; background: #573b8a;
          font-size: 1em; font-weight: bold; border: none;
          border-radius: 5px; transition: .2s ease-in; cursor: pointer;
        }
        button:hover:not(:disabled) { background: #6d44b8; }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
        .delete-btn { background: #d9534f; }
        .delete-btn:hover:not(:disabled) { background: #c9302c; }
        .logout-btn { background: #f0ad4e; }
        .logout-btn:hover:not(:disabled) { background: #ec971f; }
      `}</style>

      <div className="main">
        <div className="profile-info">
          <h2>Профиль</h2>
          <p>Email: {profile?.email}</p>
          <p>Имя: {profile?.first_name}</p>
          <p>Фамилия: {profile?.last_name}</p>
          <p>Отчество: {profile?.patronymic}</p>
          <p>Роль: {profile?.roles?.includes('creator') ? 'Вы creator' : 'Вы student'}</p>
        </div>

        <form onSubmit={handleUpdate}>
          <input name="first_name" placeholder="Имя" value={editData.first_name} onChange={handleEditChange} />
          <input name="last_name" placeholder="Фамилия" value={editData.last_name} onChange={handleEditChange} />
          <input name="patronymic" placeholder="Отчество" value={editData.patronymic} onChange={handleEditChange} />
          <button type="submit" disabled={updateMutation.isLoading}>
            {updateMutation.isLoading ? 'Обновление...' : 'Обновить профиль'}
          </button>
        </form>

        <button className="logout-btn" onClick={handleLogout} disabled={logoutMutation.isLoading}>
          {logoutMutation.isLoading ? 'Выход...' : 'Выйти'}
        </button>

        <button className="delete-btn" onClick={handleDelete} disabled={deleteMutation.isLoading}>
          {deleteMutation.isLoading ? 'Удаление...' : 'Удалить аккаунт'}
        </button>
      </div>
    </>
  );
};

export default ProfilePage;