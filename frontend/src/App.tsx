import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthPage from './pages/Auth';
import ProfilePage from './pages/Profile';
import CoursesPage from './pages/Courses';

const queryClient = new QueryClient();

const HomePage = () => {
  const token = localStorage.getItem('token');
  return token ? <ProfilePage /> : <AuthPage />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/courses" element={<CoursesPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
