import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserButton from './UserButton';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="container-fluid main-container">
      <header className="py-4">
        <div className="d-flex justify-content-between align-items-center">
          <div></div>
          <div className="text-center">
            <h1 className="main-title">概率论与数理统计课程助手</h1>
            <p className="subtitle">智能学习辅助平台</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <UserButton />
            {localStorage.getItem('auth_token') && (
              <button className="btn btn-outline-secondary btn-sm" onClick={() => {localStorage.removeItem('auth_token'); window.location.reload();}}>退出</button>
            )}
          </div>
        </div>
      </header>

      <div className="row justify-content-center entrance-container">
        <div className="col-md-5">
          <div 
            className="entrance-card" 
            onClick={() => handleCardClick('/course-management')}
          >
            <div className="card-icon">
              <i className="bi bi-book"></i>
            </div>
            <h2>课程管理系统</h2>
            <p>课程内容管理与知识点讲解</p>
          </div>
        </div>
        <div className="col-md-5">
          <div 
            className="entrance-card" 
            onClick={() => handleCardClick('/exercise-feedback')}
          >
            <div className="card-icon">
              <i className="bi bi-pencil-square"></i>
            </div>
            <h2>课后练习 & 反馈</h2>
            <p>习题练习与个性化学习</p>
          </div>
        </div>
      </div>

      <footer className="text-center py-3">
        <p>© 2025 概率论与数理统计课程助手 | 智能学习辅助平台</p>
      </footer>
    </div>
  );
};

export default Home;
