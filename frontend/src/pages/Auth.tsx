import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert('Пароли не совпадают!');
      return;
    }
    
    console.log(isLogin ? 'ВХОД' : 'РЕГИСТРАЦИЯ', formData);
    localStorage.setItem('token', 'jwt-token');
    localStorage.setItem('user', JSON.stringify(formData));
    navigate('/');
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@500&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          font-family: 'Jost', sans-serif;
          background: linear-gradient(to bottom, #0f0c29, #302b63, #24243e);
        }
        
        .main {
          width: 350px;
          height: 580px;
          overflow: hidden;
          background: url("https://doc-08-2c-docs.googleusercontent.com/docs/securesc/68c90smiglihng9534mvqmq1946dmis5/fo0picsp1nhiucmc0l25s29respgpr4j/1631524275000/03522360960922298374/03522360960922298374/1Sx0jhdpEpnNIydS4rnN4kHSJtU1EyWka?e=view&authuser=0&nonce=gcrocepgbb17m&user=03522360960922298374&hash=tfhgbs86ka6divo3llbvp93mg4csvb38") no-repeat center/ cover;
          border-radius: 10px;
          box-shadow: 5px 20px 50px #000;
        }
        
        #chk { display: none; }
        
        .signup {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        label {
          color: #fff;
          font-size: 1.8em;
          justify-content: center;
          display: flex;
          margin: 20px;
          font-weight: bold;
          cursor: pointer;
          transition: .5s ease-in-out;
        }
        
        input {
          width: 80%;
          height: 35px;
          background: #e0dede;
          justify-content: center;
          display: flex;
          margin: 12px auto;
          padding: 8px 12px;
          border: none;
          outline: none;
          border-radius: 5px;
          font-size: 14px;
        }
        
        button {
          width: 80%;
          height: 40px;
          margin: 15px auto;
          justify-content: center;
          display: block;
          color: #fff;
          background: #573b8a;
          font-size: 1em;
          font-weight: bold;
          outline: none;
          border: none;
          border-radius: 5px;
          transition: .2s ease-in;
          cursor: pointer;
        }
        
        button:hover { background: #6d44b8; }
        
        .login {
          height: 460px;
          background: #eee;
          border-radius: 60% / 10%;
          transform: translateY(-180px);
          transition: .8s ease-in-out;
        }
        
        .login label {
          color: #573b8a;
          transform: scale(.8);
        }
        
        #chk:checked ~ .login {
          transform: translateY(-500px);
        }
        
        #chk:checked ~ .login label {
          transform: scale(1);
        }
        
        #chk:checked ~ .signup label {
          transform: scale(.8);
        }
      `}</style>

      <div className="main">
        <input 
          type="checkbox" 
          id="chk" 
          checked={!isLogin} 
          onChange={() => setIsLogin(!isLogin)}
        />
        
        {/* РЕГИСТРАЦИЯ */}
        <div className="signup">
          <form onSubmit={handleSubmit}>
            <label htmlFor="chk">Регистрация</label>
            <input 
              type="text" 
              name="firstName" 
              placeholder="Имя" 
              value={formData.firstName}
              onChange={handleInputChange}
              required 
            />
            <input 
              type="text" 
              name="lastName" 
              placeholder="Фамилия" 
              value={formData.lastName}
              onChange={handleInputChange}
              required 
            />
            <input 
              type="text" 
              name="middleName" 
              placeholder="Отчество" 
              value={formData.middleName}
              onChange={handleInputChange}
              required 
            />
            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              value={formData.email}
              onChange={handleInputChange}
              required 
            />
            <input 
              type="password" 
              name="password" 
              placeholder="Пароль" 
              value={formData.password}
              onChange={handleInputChange}
              required 
            />
            <input 
              type="password" 
              name="confirmPassword" 
              placeholder="Повтор пароля" 
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required 
            />
            <button type="submit">Зарегистрироваться</button>
          </form>
        </div>

        {/* ВХОД */}
        <div className="login">
          <form onSubmit={handleSubmit}>
            <label htmlFor="chk">Вход</label>
            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              value={formData.email}
              onChange={handleInputChange}
              required 
            />
            <input 
              type="password" 
              name="password" 
              placeholder="Пароль" 
              value={formData.password}
              onChange={handleInputChange}
              required 
            />
            <button type="submit">Войти</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AuthPage;
