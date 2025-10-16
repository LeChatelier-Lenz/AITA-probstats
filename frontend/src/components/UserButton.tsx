import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserButton: React.FC<{ size?: 'sm' | 'md' }>
  = ({ size = 'sm' }) => {
  const navigate = useNavigate();
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const go = () => {
    if (token) navigate('/user');
    else navigate('/login');
  };

  return (
    <button
      className={`btn btn-outline-primary ${size === 'sm' ? 'btn-sm' : ''}`}
      onClick={go}
      title={token ? '个人中心' : '登录后进入个人中心'}
    >
      <i className="bi bi-person-circle me-1"></i>
      个人中心
    </button>
  );
};

export default UserButton;
