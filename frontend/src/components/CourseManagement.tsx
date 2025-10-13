import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Course, Chapter } from '../types';
import { courseApi } from '../services/api';

const CourseManagement: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set([1]));
  const [messages, setMessages] = useState<Array<{type: 'user' | 'system', content: string}>>([
    { type: 'system', content: '您好！我是您的AI助教，有任何关于概率论与数理统计的问题，都可以向我提问。' }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const coursesData = await courseApi.getAll();
      setCourses(coursesData);
    } catch (error) {
      console.error('加载课程失败:', error);
    }
  };

  const toggleChapter = (chapterId: number) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const loadCourseContent = (chapterId: number) => {
    const chapter = courses
      .flatMap(course => course.chapters)
      .find(ch => ch.id === chapterId);
    setSelectedChapter(chapter || null);
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = { type: 'user' as const, content: currentMessage };
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');

    // 模拟AI回复
    setTimeout(() => {
      const aiMessage = {
        type: 'system' as const,
        content: `关于"${currentMessage}"，我可以解释如下：\n\n在概率论中，这个概念涉及到随机变量的分布特性。根据当前打开的内容，您可以参考第一章的基本概念部分，特别是关于样本空间和随机事件的定义。\n\n需要更详细的解释吗？`
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="container-fluid">
      <header className="py-3 mb-4 border-bottom">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <button 
              className="d-flex align-items-center text-decoration-none btn btn-link p-0"
              onClick={() => navigate('/')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              <span className="fs-5 fw-semibold text-primary">返回首页</span>
            </button>
          </div>
          <h1 className="fs-4 m-0">概率论与数理统计课程助手</h1>
          <div>
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button 
                  className="nav-link active"
                  onClick={() => navigate('/course-management')}
                >
                  课程管理
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className="nav-link"
                  onClick={() => navigate('/knowledge-points')}
                >
                  知识点讲解
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <div className="course-container">
        {/* 左侧课程目录 */}
        <div className="sidebar">
          <div className="p-3">
            <h3 className="fs-5 mb-3">课程目录</h3>
            <div className="input-group mb-3">
              <input type="text" className="form-control" placeholder="搜索课程内容..." />
              <button className="btn btn-outline-secondary" type="button">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </div>
          
          <div className="course-menu">
            {courses.map(course => 
              course.chapters.map((chapter, index) => (
                <div key={chapter.id}>
                  <div 
                    className={`chapter-title ${expandedChapters.has(chapter.id) ? '' : 'collapsed'}`}
                    onClick={() => toggleChapter(chapter.id)}
                  >
                    {chapter.title}
                    <i className="bi bi-chevron-down toggle-icon"></i>
                  </div>
                  <div className={`chapter-content ${expandedChapters.has(chapter.id) ? 'show' : ''}`}>
                    {chapter.contents.map(content => (
                      <div 
                        key={content.id}
                        className="course-menu-item" 
                        onClick={() => loadCourseContent(chapter.id)}
                      >
                        <i className={`bi bi-${content.content_type === 'ppt' ? 'file-earmark-slides' : 'journal-text'} me-2`}></i>
                        {content.title}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* 中间内容区域 */}
        <div className="content-area">
          {selectedChapter ? (
            <div>
              <h2>{selectedChapter.title}</h2>
              <p className="text-muted">{selectedChapter.description}</p>
              <div className="mt-4">
                {selectedChapter.contents.map(content => (
                  <div key={content.id} className="mb-3 p-3 border rounded">
                    <h5>{content.title}</h5>
                    <p className="text-muted">类型: {content.content_type}</p>
                    <a href={content.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                      查看内容
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="bi bi-file-earmark-text" style={{fontSize: '3rem', color: '#6c757d'}}></i>
              </div>
              <h3>欢迎使用课程管理系统</h3>
              <p className="text-muted">请从左侧选择课程内容进行查看</p>
            </div>
          )}
        </div>
        
        {/* 右侧AI对话区域 */}
        <div className="chat-area">
          <div className="chat-header">
            <h4 className="fs-5">AI助教</h4>
            <p className="text-muted mb-0">基于当前内容进行提问</p>
          </div>
          
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.type}-message`}>
                <div className="message-content">
                  {message.content.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < message.content.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="chat-input">
            <input 
              type="text" 
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入您的问题..." 
              className="form-control" 
            />
            <button className="btn btn-primary" onClick={sendMessage}>
              <i className="bi bi-send"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;
