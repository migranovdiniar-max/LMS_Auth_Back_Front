import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/lms/courses/', {
        headers: {
          'Authorization': `Token ${token}`,
        },
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

const CoursesPage = () => {
  const { data: courses, isLoading, error } = useCourses();
  const createMutation = useCreateCourse();
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/auth/me/', { headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  }});
  const [newCourse, setNewCourse] = useState({ title: '', description: '' });

  const isCreator = profile?.roles?.includes('creator');

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

  if (isLoading) return <div>Загрузка курсов...</div>;
  if (error) return <div>Ошибка загрузки курсов</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Курсы</h1>
      {courses?.map((course: any) => (
        <div key={course.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <h2>{course.title}</h2>
          <p>{course.description}</p>
          <p>Создатель: {course.creator}</p>
          <p>Дата: {new Date(course.created_at).toLocaleDateString()}</p>
        </div>
      ))}
      {isCreator && (
        <form onSubmit={handleCreate} style={{ marginTop: '20px' }}>
          <h2>Создать курс</h2>
          <input
            type="text"
            placeholder="Название"
            value={newCourse.title}
            onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
            required
            style={{ display: 'block', margin: '10px 0', width: '100%' }}
          />
          <textarea
            placeholder="Описание"
            value={newCourse.description}
            onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
            style={{ display: 'block', margin: '10px 0', width: '100%' }}
          />
          <button type="submit" disabled={createMutation.isPending} style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none' }}>
            {createMutation.isPending ? 'Создание...' : 'Создать'}
          </button>
        </form>
      )}
    </div>
  );
};

export default CoursesPage;