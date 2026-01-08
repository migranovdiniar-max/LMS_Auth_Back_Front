import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin, useRegister } from '../hooks/useAuth';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { email: loginData.email, password: loginData.password },
      {
        onSuccess: (data) => {
          localStorage.setItem('token', data.access_token || data.access || data.token);
          navigate('/');
        },
        onError: (error: any) => {
          alert('Ошибка входа: ' + error.message);
        },
      }
    );
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      alert('Пароли не совпадают!');
      return;
    }

    registerMutation.mutate(
      {
        email: registerData.email,
        password: registerData.password,
        password_repeat: registerData.confirmPassword,
        first_name: registerData.firstName,
        last_name: registerData.lastName,
        patronymic: registerData.middleName,
      },
      {
        onSuccess: () => {
          alert('Регистрация успешна! Теперь войдите.');
          setIsLogin(true);
          setRegisterData({ 
            firstName:'', lastName:'', middleName:'', 
            email:'', password:'', confirmPassword:'' 
          });
        },
        onError: (error: any) => {
          alert('Ошибка регистрации: ' + error.message);
        },
      }
    );
  };

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
        }
        #chk { display: none; }
        .signup { position: relative; width: 100%; height: 100%; }
        label {
          color: #fff; font-size: 1.8em; justify-content: center;
          display: flex; margin: 20px; font-weight: bold;
          cursor: pointer; transition: .5s ease-in-out;
        }
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
        .login {
          height: 460px; background: #eee; border-radius: 60% / 10%;
          transform: translateY(-180px); transition: .8s ease-in-out;
        }
        .login label { color: #573b8a; transform: scale(.8); }
        #chk:checked ~ .login { transform: translateY(-500px); }
        #chk:checked ~ .login label { transform: scale(1); }
        #chk:checked ~ .signup label { transform: scale(.8); }
      `}</style>

      <div className="main">
        <input 
          type="checkbox" 
          id="chk" 
          checked={!isLogin} 
          onChange={() => {
            setIsLogin(!isLogin);
            if (isLogin) {
              setRegisterData({ firstName:'', lastName:'', middleName:'', email:'', password:'', confirmPassword:'' });
            } else {
              setLoginData({ email: '', password: '' });
            }
          }}
        />
        
        <div className="signup">
          <form onSubmit={handleRegisterSubmit}>
            <label htmlFor="chk">Регистрация</label>
            <input name="firstName" placeholder="Имя" value={registerData.firstName} onChange={handleRegisterChange} required />
            <input name="lastName" placeholder="Фамилия" value={registerData.lastName} onChange={handleRegisterChange} required />
            <input name="middleName" placeholder="Отчество" value={registerData.middleName} onChange={handleRegisterChange} required />
            <input type="email" name="email" placeholder="Email" value={registerData.email} onChange={handleRegisterChange} required />
            <input type="password" name="password" placeholder="Пароль" value={registerData.password} onChange={handleRegisterChange} required />
            <input type="password" name="confirmPassword" placeholder="Повтор пароля" value={registerData.confirmPassword} onChange={handleRegisterChange} required />
            <button type="submit" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
        </div>

        <div className="login">
          <form onSubmit={handleLoginSubmit}>
            <label htmlFor="chk">Вход</label>
            <input type="email" name="email" placeholder="Email" value={loginData.email} onChange={handleLoginChange} required />
            <input type="password" name="password" placeholder="Пароль" value={loginData.password} onChange={handleLoginChange} required />
            <button type="submit" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Вход...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AuthPage;
