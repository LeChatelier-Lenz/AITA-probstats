import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '@/services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await authApi.login(username.trim(), password);
      localStorage.setItem('auth_token', res.token);
      navigate('/exercise-feedback');
    } catch (err: any) {
      const data = err?.response?.data;
      if (typeof data === 'string') setError(data);
      else if (data?.detail) setError(data.detail);
      else setError('登录失败，请检查用户名或密码');
    }
  };

  return (
    <div className="container py-5" style={{maxWidth: 480}}>
      <h2 className="mb-4 text-center">登录</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">用户名</label>
          <input className="form-control" value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">密码</label>
          <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button className="btn btn-primary w-100" type="submit">登录</button>
      </form>
      <div className="text-center mt-3">
        还没有账号？<Link to="/register">去注册</Link>
      </div>
    </div>
  );
};

export default Login;
