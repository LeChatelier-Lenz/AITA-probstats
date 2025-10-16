import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Exercise, ExerciseCheckResult } from '../types';
import { exerciseApi, userExerciseApi } from '../services/api';
import UserButton from './UserButton';
import MarkdownWithLatex from '@/utils/MarkdownWithLatex';
import SimpleMathInput from './SimpleMathInput';

const topics = [
  { value: 'all', label: '全部知识点' },
  { value: 'sample-space', label: '样本空间' },
  { value: 'probability', label: '概率计算' },
  { value: 'random-variable', label: '随机变量' },
  { value: 'distribution', label: '概率分布' },
  { value: 'expectation', label: '期望与方差' },
  { value: 'limit-theorem', label: '极限定理' },
  { value: 'statistics', label: '统计推断' },
];

const difficulties = [
  { value: 'all', label: '全部难度' },
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' },
];

const ExerciseFeedback: React.FC = () => {
  const navigate = useNavigate();

  // 选项卡
  const [activeTab, setActiveTab] = useState<'practice' | 'homework' | 'training'>('practice');

  // 列表 & 过滤 & 分页
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [pageInput, setPageInput] = useState('1');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // 用户状态：收藏/归档
  const [labeledMap, setLabeledMap] = useState<Record<number, boolean>>({});
  const [archivedMap, setArchivedMap] = useState<Record<number, boolean>>({});

  // 答案、反馈、提示
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<number, string>>({});
  const [exerciseFeedback, setExerciseFeedback] = useState<Record<number, ExerciseCheckResult>>({});
  const [showHints, setShowHints] = useState<Record<number, boolean>>({});
  // 验证加载中状态（每题）
  const [checkingMap, setCheckingMap] = useState<Record<number, boolean>>({});
  // 极简：不需要 reset token，直接在输入框内置清空按钮

  // 辅助：徽章样式
  const getDifficultyBadge = (difficulty: string) => {
    const colors: any = { easy: 'bg-success', medium: 'bg-warning text-dark', hard: 'bg-danger' };
    return colors[difficulty] || 'bg-secondary';
  };
  const getCategoryBadge = (category: string) => {
    const colors: any = {
      'sample-space': 'bg-info',
      probability: 'bg-primary',
      'random-variable': 'bg-danger',
      distribution: 'bg-secondary',
      expectation: 'bg-success',
      'limit-theorem': 'bg-warning text-dark',
      statistics: 'bg-dark',
    };
    return colors[category] || 'bg-secondary';
  };

  // 登录校验
  const ensureLogin = () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/login');
      return false;
    }
    return true;
  };

  // 可选：本地缓存错因分析（已改为后端落库，当前不启用）
  // 如需本地缓存错因分析，可再次启用下列工具方法

  // 拉取用户收藏/归档列表，初始化按钮高亮
  const refreshMyLists = async () => {
    try {
      const lists = await userExerciseApi.myLists();
      const lm: Record<number, boolean> = {};
      const am: Record<number, boolean> = {};
      for (const item of lists.labeled) lm[item.exercise.id] = true;
      for (const item of lists.archived) am[item.exercise.id] = true;
      setLabeledMap(lm);
      setArchivedMap(am);
    } catch {
      // ignore if not logged in
    }
  };

  // 查询题目（分页+过滤）
  const loadExercises = async () => {
    const category = selectedTopic === 'all' ? undefined : selectedTopic;
    const difficulty = selectedDifficulty === 'all' ? undefined : selectedDifficulty;
    const resp = await exerciseApi.getByMultiplePaged({ category, difficulty, page: currentPage });
    setExercises(resp.results || []);
    setHasNext(Boolean(resp.next));
  };

  useEffect(() => { loadExercises(); }, [selectedTopic, selectedDifficulty, currentPage]);
  useEffect(() => { refreshMyLists(); }, []);

  // 交互函数
  const handleAnswerChange = (id: number, value: string) => {
    setExerciseAnswers(prev => ({ ...prev, [id]: value }));
  };
  const showHint = (id: number) => setShowHints(prev => ({ ...prev, [id]: !prev[id] }));
  const submitAnswer = async (id: number) => {
    const ans = exerciseAnswers[id] || '';
    try {
      setCheckingMap(prev => ({ ...prev, [id]: true }));
      const result = await exerciseApi.checkAnswer(id, ans);
      setExerciseFeedback(prev => ({ ...prev, [id]: result }));
    } catch {
      // ignore network errors
    } finally {
      setCheckingMap(prev => ({ ...prev, [id]: false }));
    }
  };
  const goToPage = () => {
    const n = Math.max(1, parseInt(pageInput || '1', 10));
    setCurrentPage(n);
  };

  const toggleLabel = async (id: number) => {
    if (!ensureLogin()) return;
    try {
      // 若当前未收藏，且最近一次判题为错误，则提示是否保存错因分析
      let shouldSaveAnalysis = false;
      const fb = exerciseFeedback[id];
      if (!labeledMap[id] && fb && fb.is_correct === false && (fb.explanation || fb.user_answer)) {
        shouldSaveAnalysis = window.confirm('需要保存错因分析吗？');
      }
      // 若选择保存错因，优先携带到后端
      let r;
      if (shouldSaveAnalysis) {
        const fbLocal = exerciseFeedback[id];
        r = await userExerciseApi.toggleLabelWithAnalysis(id, {
          user_answer: fbLocal?.user_answer,
          correct_answer: fbLocal?.correct_answer,
          explanation: fbLocal?.explanation,
        });
      } else {
        r = await userExerciseApi.toggleLabel(id);
      }
      setLabeledMap(prev => ({ ...prev, [id]: r.status === 'labeled' }));
      // 若后端已保存则无需本地留存；如果未来失败可回落到本地
    } catch {}
  };
  const toggleArchive = async (id: number) => {
    if (!ensureLogin()) return;
    try {
      const r = await userExerciseApi.toggleArchive(id);
      setArchivedMap(prev => ({ ...prev, [id]: r.status === 'archived' }));
      if (r.status === 'archived') {
        // 归档即隐藏
        setExercises(prev => prev.filter(e => e.id !== id));
      }
    } catch {}
  };

  return (
    <div className="container-fluid">
      <header className="py-3 mb-4 border-bottom">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <button className="d-flex align-items-center text-decoration-none btn btn-link p-0" onClick={() => navigate('/')}>
              <i className="bi bi-arrow-left me-2"></i>
              <span className="fs-5 fw-semibold text-primary">返回首页</span>
            </button>
          </div>
          <h1 className="fs-4 m-0">概率论与数理统计课程助手</h1>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary">课后练习 & 反馈</span>
            <UserButton />
          </div>
        </div>
      </header>

      <div className="container py-4">
        <ul className="nav nav-tabs mb-4" role="tablist">
          <li className="nav-item" role="presentation">
            <button className={`nav-link ${activeTab === 'practice' ? 'active' : ''}`} onClick={() => setActiveTab('practice')}>
              <i className="bi bi-journal-text me-1"></i> 习题练习
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button className={`nav-link ${activeTab === 'homework' ? 'active' : ''}`} onClick={() => setActiveTab('homework')}>
              <i className="bi bi-file-earmark-check me-1"></i> 批改作业 & 错题分析
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button className={`nav-link ${activeTab === 'training' ? 'active' : ''}`} onClick={() => setActiveTab('training')}>
              <i className="bi bi-graph-up me-1"></i> 个性化套题训练
            </button>
          </li>
        </ul>

        <div className="tab-content">
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
                    <div className="upload-text">点击或拖拽文件到此处上传</div>
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
                    <div style={{ width: '200px', height: '200px', margin: '0 auto', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <h3 className="m-0">78%</h3>
                        <p className="mb-0">正确率</p>
                      </div>
                      <svg width="200" height="200" viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r="80" fill="none" stroke="#e9ecef" strokeWidth="20" />
                        <circle cx="100" cy="100" r="80" fill="none" stroke="#4a6fa5" strokeWidth="20" strokeDasharray="502" strokeDashoffset="110" transform="rotate(-90 100 100)" />
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

          {activeTab === 'practice' && (
            <div className="exercise-container">
              <div className="exercise-header">
                <h3 className="exercise-title">习题练习</h3>
                <div className="exercise-filters">
                  <select className="filter-select" value={selectedTopic} onChange={e => { setSelectedTopic(e.target.value); setCurrentPage(1); setPageInput('1'); }}>
                    {topics.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <select className="filter-select" value={selectedDifficulty} onChange={e => { setSelectedDifficulty(e.target.value); setCurrentPage(1); setPageInput('1'); }}>
                    {difficulties.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {exercises.filter(ex => !archivedMap[ex.id]).map(exercise => (
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
                      <div className="feedback-content">
                        <MarkdownWithLatex markdownContent={exercise.hint} />
                      </div>
                    </div>
                  )}

                  <div className="exercise-actions">
                    <button className="hint-button" onClick={() => showHint(exercise.id)}>
                      <i className="bi bi-lightbulb me-1"></i>
                      {showHints[exercise.id] ? '隐藏提示' : '显示提示'}
                    </button>
                    <button
                      className="answer-button"
                      onClick={() => submitAnswer(exercise.id)}
                      disabled={!!checkingMap[exercise.id]}
                    >
                      {checkingMap[exercise.id] ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                          验证中…
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-1"></i>
                          提交答案
                        </>
                      )}
                    </button>
                    <button className={`btn btn-sm ms-2 ${labeledMap[exercise.id] ? 'btn-success' : 'btn-outline-success'}`} onClick={() => toggleLabel(exercise.id)}>
                      <i className="bi bi-bookmark-check me-1"></i>
                      {labeledMap[exercise.id] ? '已收藏' : '收藏'}
                    </button>
                    <button className={`btn btn-sm ms-2 ${archivedMap[exercise.id] ? 'btn-secondary' : 'btn-outline-secondary'}`} onClick={() => toggleArchive(exercise.id)}>
                      <i className="bi bi-archive me-1"></i>
                      {archivedMap[exercise.id] ? '已归档' : '归档'}
                    </button>
                  </div>

                  <div className="answer-input mt-2">
                    <small className="text-muted d-block mb-2">可输入 LaTeX 公式（如 x^2、\\sqrt、\\frac）</small>
                    <SimpleMathInput
                      onChange={md => handleAnswerChange(exercise.id, md)}
                      onSubmit={() => submitAnswer(exercise.id)}
                      className=""
                    />
                  </div>

                  {exerciseFeedback[exercise.id] && (
                    <div className={`feedback-message ${exerciseFeedback[exercise.id].is_correct ? 'feedback-success' : 'feedback-error'}`}>
                      <div className="feedback-title">{exerciseFeedback[exercise.id].is_correct ? '回答正确！' : '回答错误'}</div>
                      <div className="feedback-content">
                        <p>
                          <strong>您的答案：</strong>
                          <MarkdownWithLatex markdownContent={exerciseFeedback[exercise.id].user_answer} />
                        </p>
                        <p>
                          <strong>正确答案：</strong>
                          <MarkdownWithLatex markdownContent={exerciseFeedback[exercise.id].correct_answer} />
                        </p>
                        <p>
                          <strong>解释：</strong>
                          <MarkdownWithLatex markdownContent={exerciseFeedback[exercise.id].explanation} />
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="mt-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                  <button className="btn btn-outline-secondary btn-sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                    <i className="bi bi-chevron-left"></i> 上一页
                  </button>
                  <span className="text-muted small">第 {currentPage} 页 · 本页{exercises.filter(ex => !archivedMap[ex.id]).length}条</span>
                  <button className="btn btn-outline-secondary btn-sm" disabled={!hasNext} onClick={() => setCurrentPage(p => p + 1)}>
                    下一页 <i className="bi bi-chevron-right"></i>
                  </button>
                  <div className="input-group input-group-sm ms-2" style={{ width: '180px' }}>
                    <span className="input-group-text">跳转到</span>
                    <input type="number" min={1} className="form-control" value={pageInput} onChange={e => setPageInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') goToPage(); }} />
                    <span className="input-group-text">页</span>
                    <button className="btn btn-outline-primary" onClick={goToPage}>跳转</button>
                  </div>
                </div>
                <div>
                  <button className="btn btn-link" onClick={() => navigate('/my-exercises')}>
                    <i className="bi bi-collection"></i> 我的习题
                  </button>
                </div>
              </div>
            </div>
          )}

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
