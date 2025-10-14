import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Exercise, ExerciseCheckResult } from '../types';
import { exerciseApi } from '../services/api';
import MarkdownWithLatex from '@/utils/MarkdownWithLatex';

const ExerciseFeedback: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('homework');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [exerciseAnswers, setExerciseAnswers] = useState<{[key: number]: string}>({});
  const [exerciseFeedback, setExerciseFeedback] = useState<{[key: number]: ExerciseCheckResult}>({});
  const [showHints, setShowHints] = useState<{[key: number]: boolean}>({});

  const topics = [
    { value: 'all', label: '全部知识点' },
    { value: 'sample-space', label: '样本空间' },
    { value: 'probability', label: '概率计算' },
    { value: 'random-variable', label: '随机变量' },
    { value: 'distribution', label: '概率分布' },
    { value: 'expectation', label: '期望与方差' },
    { value: 'limit-theorem', label: '极限定理' },
    { value: 'statistics', label: '统计推断' }
  ];

  const difficulties = [
    { value: 'all', label: '全部难度' },
    { value: 'easy', label: '简单' },
    { value: 'medium', label: '中等' },
    { value: 'hard', label: '困难' }
  ];

  useEffect(() => {
    loadExercises();
  }, [selectedTopic, selectedDifficulty]);

  const loadExercises = async () => {
    try {
      let exercisesData: Exercise[] = [];

      if (selectedDifficulty !== 'all' || selectedTopic !== 'all'){
        var topic = selectedTopic === 'all'?'':selectedTopic
        var difficulty = selectedDifficulty === 'all'?'':selectedDifficulty

        exercisesData = await exerciseApi.getByMultiple({category:topic,difficulty:difficulty,page:1})
      } else {
        exercisesData = await exerciseApi.getAll()
      }
      
      setExercises(exercisesData);
      // console.log(exercisesData); 
    } catch (error) {
      console.error('加载练习失败:', error);
    }
  };

  const showHint = (exerciseId: number) => {
    setShowHints(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  const submitAnswer = async (exerciseId: number) => {
    const answer = exerciseAnswers[exerciseId];
    if (!answer?.trim()) {
      alert('请先输入答案');
      return;
    }

    try {
      const result = await exerciseApi.checkAnswer(exerciseId, answer);
      setExerciseFeedback(prev => ({
        ...prev,
        [exerciseId]: result
      }));
    } catch (error) {
      console.error('提交答案失败:', error);
    }
  };

  const handleAnswerChange = (exerciseId: number, answer: string) => {
    setExerciseAnswers(prev => ({
      ...prev,
      [exerciseId]: answer
    }));
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      easy: 'bg-success',
      medium: 'bg-warning text-dark',
      hard: 'bg-danger'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-secondary';
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      'sample-space': 'bg-info',
      'probability': 'bg-primary',
      'random-variable': 'bg-danger',
      'distribution': 'bg-secondary',
      'expectation': 'bg-success',
      'limit-theorem': 'bg-warning text-dark',
      'statistics': 'bg-dark'
    };
    return colors[category as keyof typeof colors] || 'bg-secondary';
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
            <span className="badge bg-primary">课后练习 & 反馈</span>
          </div>
        </div>
      </header>

      <div className="container py-4">
        <ul className="nav nav-tabs mb-4" id="exerciseTabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'homework' ? 'active' : ''}`}
              onClick={() => setActiveTab('homework')}
            >
              <i className="bi bi-file-earmark-check me-1"></i> 批改作业 & 错题分析
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'practice' ? 'active' : ''}`}
              onClick={() => setActiveTab('practice')}
            >
              <i className="bi bi-journal-text me-1"></i> 习题练习
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'training' ? 'active' : ''}`}
              onClick={() => setActiveTab('training')}
            >
              <i className="bi bi-graph-up me-1"></i> 个性化套题训练
            </button>
          </li>
        </ul>

        <div className="tab-content" id="exerciseTabContent">
          {/* 批改作业 & 错题分析 */}
          {activeTab === 'homework' && (
            <div className="row">
              <div className="col-md-8">
                <div className="exercise-container">
                  <div className="exercise-header">
                    <h3 className="exercise-title">作业上传与批改</h3>
                  </div>
                  
                  <div className="upload-area">
                    <div className="upload-icon">
                      <i className="bi bi-cloud-arrow-up"></i>
                    </div>
                    <div className="upload-text">
                      点击或拖拽文件到此处上传
                    </div>
                    <p className="text-muted">支持PDF、Word文档、图片等格式</p>
                    <button className="upload-button">
                      <i className="bi bi-upload me-1"></i> 上传作业
                    </button>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="fs-5 mb-3">历史作业记录</h4>
                    <div className="list-group">
                      <div className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="mb-1">第一章作业</h5>
                          <p className="mb-1 text-muted">提交时间: 2023-09-10</p>
                        </div>
                        <span className="badge bg-success rounded-pill">已批改</span>
                      </div>
                      <div className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="mb-1">第二章作业</h5>
                          <p className="mb-1 text-muted">提交时间: 2023-09-17</p>
                        </div>
                        <span className="badge bg-success rounded-pill">已批改</span>
                      </div>
                      <div className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="mb-1">第三章作业</h5>
                          <p className="mb-1 text-muted">提交时间: 2023-09-24</p>
                        </div>
                        <span className="badge bg-warning text-dark rounded-pill">批改中</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="exercise-container">
                  <div className="exercise-header">
                    <h3 className="exercise-title">错题统计</h3>
                  </div>
                  
                  <div className="text-center py-3">
                    <div style={{width: '200px', height: '200px', margin: '0 auto', position: 'relative'}}>
                      <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center'}}>
                        <h3 className="m-0">78%</h3>
                        <p className="mb-0">正确率</p>
                      </div>
                      <svg width="200" height="200" viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r="80" fill="none" stroke="#e9ecef" strokeWidth="20"/>
                        <circle cx="100" cy="100" r="80" fill="none" stroke="#4a6fa5" strokeWidth="20" strokeDasharray="502" strokeDashoffset="110" transform="rotate(-90 100 100)"/>
                      </svg>
                    </div>
                  </div>
                  
                  <h4 className="fs-5 mb-3">常见错误类型</h4>
                  <ul className="list-group mb-3">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      条件概率计算错误
                      <span className="badge bg-primary rounded-pill">5</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      随机变量分布混淆
                      <span className="badge bg-primary rounded-pill">3</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      期望方差计算错误
                      <span className="badge bg-primary rounded-pill">2</span>
                    </li>
                  </ul>
                  
                  <button className="btn btn-outline-primary w-100">
                    <i className="bi bi-journal-check me-1"></i> 查看详细错题分析
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* 习题练习 */}
          {activeTab === 'practice' && (
            <div className="exercise-container">
              <div className="exercise-header">
                <h3 className="exercise-title">习题练习</h3>
                <div className="exercise-filters">
                  <select 
                    className="filter-select" 
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                  >
                    {topics.map(topic => (
                      <option key={topic.value} value={topic.value}>{topic.label}</option>
                    ))}
                  </select>
                  <select 
                    className="filter-select" 
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                  >
                    {difficulties.map(difficulty => (
                      <option key={difficulty.value} value={difficulty.value}>{difficulty.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {exercises.map(exercise => (
                <div key={exercise.id} className="exercise-item">
                  <div className="exercise-question">
                    <span className={`badge me-2 ${getCategoryBadge(exercise.category)}`}>
                      {topics.find(t => t.value === exercise.category)?.label}
                    </span>
                    <span className={`badge me-2 ${getDifficultyBadge(exercise.difficulty)}`}>
                      {difficulties.find(d => d.value === exercise.difficulty)?.label}
                    </span>
                    <MarkdownWithLatex markdownContent={exercise.question} />
                  </div>
                  
                  {showHints[exercise.id] && (
                    <div className="feedback-message feedback-info">
                      <div className="feedback-title">提示</div>
                      <div className="feedback-content"><MarkdownWithLatex markdownContent={exercise.hint}/></div>
                    </div>
                  )}
                  
                  <div className="exercise-actions">
                    <button 
                      className="hint-button" 
                      onClick={() => showHint(exercise.id)}
                    >
                      <i className="bi bi-lightbulb me-1"></i> 
                      {showHints[exercise.id] ? '隐藏提示' : '显示提示'}
                    </button>
                    <button 
                      className="answer-button" 
                      onClick={() => submitAnswer(exercise.id)}
                    >
                      <i className="bi bi-check-circle me-1"></i> 提交答案
                    </button>
                  </div>
                  
                  <div className="answer-input mt-2">
                    <textarea 
                      value={exerciseAnswers[exercise.id] || ''}
                      onChange={(e) => handleAnswerChange(exercise.id, e.target.value)}
                      className="form-control" 
                      rows={3} 
                      placeholder="在此输入您的答案..."
                    ></textarea>
                  </div>
                  
                  {exerciseFeedback[exercise.id] && (
                    <div className={`feedback-message ${
                      exerciseFeedback[exercise.id].is_correct ? 'feedback-success' : 'feedback-error'
                    }`}>
                      <div className="feedback-title">
                        {exerciseFeedback[exercise.id].is_correct ? '回答正确！' : '回答错误'}
                      </div>
                      <div className="feedback-content">
                        <p><strong>您的答案：</strong><MarkdownWithLatex markdownContent={exerciseFeedback[exercise.id].user_answer} /></p>
                        <p><strong>正确答案：</strong><MarkdownWithLatex markdownContent={exerciseFeedback[exercise.id].correct_answer} /></p>
                        <p><strong>解释：</strong><MarkdownWithLatex markdownContent={exerciseFeedback[exercise.id].explanation} /></p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="mt-4 text-center">
                <button className="btn btn-outline-primary px-4">
                  加载更多习题 <i className="bi bi-arrow-down-circle ms-1"></i>
                </button>
              </div>
            </div>
          )}
          
          {/* 个性化套题训练 */}
          {activeTab === 'training' && (
            <div>
              <div className="training-options">
                <div className="training-option">
                  <div className="training-icon">
                    <i className="bi bi-journal-text"></i>
                  </div>
                  <h3 className="training-title">传统套题训练</h3>
                  <p className="training-description">按照教材章节顺序练习，系统掌握概率论与数理统计的基础知识</p>
                  <div className="start-button">
                    <i className="bi bi-play-fill me-1"></i> 开始训练
                  </div>
                </div>
                
                <div className="training-option">
                  <div className="training-icon">
                    <i className="bi bi-graph-up"></i>
                  </div>
                  <h3 className="training-title">个性化推荐训练</h3>
                  <p className="training-description">基于您的学习记录和错题分析，AI智能推荐针对性练习</p>
                  <div className="start-button">
                    <i className="bi bi-play-fill me-1"></i> 开始训练
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseFeedback;
