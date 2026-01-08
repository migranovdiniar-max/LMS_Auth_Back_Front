import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const API_BASE = '/api';

// === Интерфейсы ===
interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  first_name: string;
  last_name: string;
  patronymic?: string;
  email: string;
  password: string;
  password_repeat: string;
  as_creator?: boolean;
}

// === Парсинг ошибок ===
const parseError = async (response: Response): Promise<string> => {
  try {
    const data = await response.json();
    if (data.detail) return String(data.detail);
    if (typeof data === 'object') {
      const messages = Object.values(data).flat().map(String);
      return messages.join(' ') || 'Ошибка валидации';
    }
    return JSON.stringify(data);
  } catch (e) {
    return response.statusText || `Ошибка: ${response.status}`;
  }
};

// === useLogin ===
export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await fetch(`${API_BASE}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorMsg = await parseError(response);
        throw new Error(`Ошибка входа: ${errorMsg}`);
      }

      const json = await response.json();

      if (!json.access_token) {
        throw new Error('Сервер не вернул access_token');
      }

      console.log('✅ Вход успешен, токен получен:', json.access_token);
      return json;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.access_token);
      navigate('/');
    },
    onError: (error: Error) => {
      console.error('❌ Ошибка входа:', error.message);
    },
  });
};

// === useRegister ===
export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await fetch(`${API_BASE}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorMsg = await parseError(response);
        throw new Error(`Ошибка регистрации: ${errorMsg}`);
      }

      return response.json();
    },
    onError: (error: Error) => {
      console.error('❌ Ошибка регистрации:', error.message);
    },
  });
};

// === useProfile ===
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен отсутствует в localStorage');
      }

      console.log('📨 Запрос к /api/auth/me/ с токеном:', token.substring(0, 10) + '...');

      const response = await fetch('/api/auth/me/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📊 Статус ответа:', response.status);

      if (!response.ok) {
        const text = await response.text();
        console.error('❌ Тело ошибки (не JSON):', text);
        throw new Error(`Не удалось загрузить профиль: ${text}`);
      }

      const data = await response.json();
      console.log('✅ Профиль получен:', data);
      return data;
    },
    retry: 1,
    staleTime: 10000, // 10 сек — кэш
    gcTime: 300000,   // 5 мин
  });
};

// === useUpdateProfile ===
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { first_name?: string; last_name?: string; patronymic?: string }) => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Токен не найден');

      const response = await fetch('/api/auth/me/', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorMsg = await parseError(response);
        throw new Error(`Ошибка обновления: ${errorMsg}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      console.log('✅ Профиль обновлён и кэш сброшен');
    },
  });
};

// === useDeleteUser ===
export const useDeleteUser = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Токен не найден');

      const response = await fetch('/api/users/me/', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorMsg = await parseError(response);
        throw new Error(`Ошибка удаления: ${errorMsg}`);
      }

      return response.json();
    },
    onSuccess: () => {
      localStorage.removeItem('token');
      console.log('✅ Аккаунт удалён, токен очищен');
      navigate('/auth');
    },
  });
};

// === useLogout ===
export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/auth/logout/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Даже если logout не удался (например, токен уже отозван), выходим
      if (!response.ok && response.status !== 401 && response.status !== 403) {
        const errorMsg = await parseError(response);
        throw new Error(`Ошибка выхода: ${errorMsg}`);
      }
    },
    onSuccess: () => {
      localStorage.removeItem('token');
      queryClient.clear();
      console.log('✅ Выход выполнен, кэш очищен');
      navigate('/auth');
    },
  });
};
