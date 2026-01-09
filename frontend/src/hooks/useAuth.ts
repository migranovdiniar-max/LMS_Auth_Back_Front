import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const API_BASE = '/api';

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
}

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

export const useLogin = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await fetch(`${API_BASE}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorMsg = await parseError(response);
        throw new Error(`Ошибка входа: ${errorMsg}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.access_token);
      navigate('/');
    },
    onError: (error: Error) => {
      alert('Ошибка входа: ' + error.message);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await fetch(`${API_BASE}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorMsg = await parseError(response);
        throw new Error(`Ошибка регистрации: ${errorMsg}`);
      }
      return response.json();
    },
    onError: (error: Error) => {
      alert('Ошибка регистрации: ' + error.message);
    },
  });
};

export const useProfile = () => {
  const token = localStorage.getItem('token');
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!token) throw new Error('Токен отсутствует');
      const response = await fetch(`${API_BASE}/auth/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Не удалось загрузить профиль: ${text}`);
      }
      return response.json();
    },
    enabled: !!token,
    retry: 1,
    staleTime: 10000,
    gcTime: 300000,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { first_name?: string; last_name?: string; patronymic?: string }) => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Токен не найден');
      const response = await fetch(`${API_BASE}/auth/me/`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
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
    },
  });
};

export const useDeleteUser = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Токен не найден');
      const response = await fetch(`${API_BASE}/users/me/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorMsg = await parseError(response);
        throw new Error(`Ошибка удаления: ${errorMsg}`);
      }
    },
    onSuccess: () => {
      localStorage.removeItem('token');
      navigate('/auth');
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      await fetch(`${API_BASE}/auth/logout/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      localStorage.removeItem('token');
      queryClient.clear();
      navigate('/auth');
    },
  });
};

// Новый хук для получения роли автора
export const useBecomeCreator = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Токен не найден');
      const response = await fetch(`${API_BASE}/auth/become-creator/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorMsg = await parseError(response);
        throw new Error(errorMsg);
      }
      return response.json();
    },
    onSuccess: (data) => {
      alert(data.detail || 'Вы успешно стали автором курсов!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: Error) => {
      alert('Ошибка: ' + error.message);
    },
  });
};