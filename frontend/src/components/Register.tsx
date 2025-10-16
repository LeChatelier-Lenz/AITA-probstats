import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '@/services/api';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await authApi.register(username.trim(), email.trim(), password);
      localStorage.setItem('auth_token', res.token);
      navigate('/exercise-feedback');
    } catch (err: any) {
      const data = err?.response?.data;
      if (typeof data === 'string') {
        setError(data);
      } else if (data && typeof data === 'object') {
        // 展示第一条字段错误
        const messages: string[] = [];
        Object.keys(data).forEach((k) => {
          const val = (data as any)[k];
          if (Array.isArray(val) && val.length) {
            messages.push(`${k}: ${val[0]}`);
          } else if (typeof val === 'string') {
            messages.push(`${k}: ${val}`);
          }
        });
        setError(messages[0] || '注册失败，请检查填写信息');
      } else {
        setError('注册失败，请检查填写信息');
      }
    }
  };

  return (
    <div className="container py-5" style={{maxWidth: 480}}>
      <h2 className="mb-4 text-center">注册</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">用户名</label>
          <input className="form-control" value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">邮箱</label>
          <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">密码</label>
          <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button className="btn btn-primary w-100" type="submit">注册</button>
      </form>
      <div className="text-center mt-3">
        已有账号？<Link to="/login">去登录</Link>
      </div>
    </div>
  );
};

export default Register;
