import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, userExerciseApi } from '@/services/api';
import { Exercise, UserProfile as UProfile } from '@/types';
import MarkdownWithLatex from '@/utils/MarkdownWithLatex';
import UserButton from './UserButton';
import { formatRelativeTime } from '@/utils/date';
import { getPlainTextSnippet } from '@/utils/text';

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UProfile | null>(null);
  const [labeled, setLabeled] = useState<Array<{ exercise: Exercise; created_at: string }>>([]);
  const [archived, setArchived] = useState<Array<{ exercise: Exercise; created_at: string }>>([]);
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [errorReport, setErrorReport] = useState<{ content: string; updated_at: string } | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

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
    if (!token) {
      navigate('/login');
      return;
    }
    const load = async () => {
      try {
        const me = await authApi.me();
        setUser(me.user);
  const lists = await userExerciseApi.myLists();
  setLabeled(lists.labeled);
  setArchived(lists.archived);
        // 加载易错报告
        setReportLoading(true);
        try {
          const r = await userExerciseApi.myErrorReport();
          setErrorReport(r);
        } finally {
          setReportLoading(false);
        }
      } catch {
        navigate('/login');
      }
    };
    load();
  }, [navigate, token]);

  const formatDate = (iso?: string) => formatRelativeTime(iso);

  const getDifficultyBadge = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: 'bg-success',
      medium: 'bg-warning text-dark',
      hard: 'bg-danger'
    };
    return colors[difficulty] || 'bg-secondary';
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      'sample-space': 'bg-info',
      'probability': 'bg-primary',
      'random-variable': 'bg-danger',
      'distribution': 'bg-secondary',
      'expectation': 'bg-success',
      'limit-theorem': 'bg-warning text-dark',
      'statistics': 'bg-dark'
    };
    return colors[category] || 'bg-secondary';
  };

  // 操作：取消收藏/取消归档
  const handleUnlabel = async (exerciseId: number) => {
    try {
      const r = await userExerciseApi.toggleLabel(exerciseId);
      if (r.status === 'unlabeled') {
        setLabeled(prev => prev.filter(it => it.exercise.id !== exerciseId));
      }
      // 收藏变化后刷新报告
      setReportLoading(true);
      try { const rep = await userExerciseApi.myErrorReport(); setErrorReport(rep); } finally { setReportLoading(false); }
    } catch {}
  };

  const handleUnarchive = async (exerciseId: number) => {
    try {
      const r = await userExerciseApi.toggleArchive(exerciseId);
      if (r.status === 'unarchived') {
        setArchived(prev => prev.filter(it => it.exercise.id !== exerciseId));
      }
    } catch {}
  };

  const ExerciseRow: React.FC<{ e: Exercise; date?: string; action?: 'unlabel' | 'unarchive'; onAction?: (id: number) => void; user_answer?: string; correct_answer?: string; explanation?: string }>
    = ({ e, date, action, onAction, user_answer, correct_answer, explanation }) => (
    <div className="exercise-item">
      {/* 顶部：标签与时间 */}
      <div className="mb-1">
        <span className={`badge me-2 ${getCategoryBadge(e.category)}`}>{topics.find(t => t.value === e.category)?.label}</span>
        <span className={`badge me-2 ${getDifficultyBadge(e.difficulty)}`}>{difficulties.find(t => t.value === e.difficulty)?.label}</span>
        <small className="text-muted">完成时间：{formatDate(date)}</small>
      </div>

      {/* 简要片段，便于快速识别 */}
      <div className="text-muted small"><MarkdownWithLatex markdownContent={getPlainTextSnippet(e.question, 80)} /></div>

      {/* 底部：操作按钮区域 */}
      <div className="d-flex justify-content-end gap-2 mt-2">
        {action && (
          <button
            className={`btn btn-sm ${action === 'unlabel' ? 'btn-outline-success' : 'btn-outline-secondary'}`}
            onClick={() => onAction && onAction(e.id)}
          >
            {action === 'unlabel' ? '取消收藏' : '取消归档'}
          </button>
        )}
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => setExpanded(prev => ({ ...prev, [e.id]: !prev[e.id] }))}
        >
          {expanded[e.id] ? '收起详情' : '查看详情'}
        </button>
      </div>

      {expanded[e.id] && (
        <div className="mt-2">
          <div className="exercise-question">
            <MarkdownWithLatex markdownContent={e.question} />
          </div>
          {e.hint && (
            <div className="text-muted small mt-1">提示：
              <MarkdownWithLatex markdownContent={e.hint} />
            </div>
          )}
          {(explanation || user_answer || correct_answer) && (
            <div className="mt-2">
              <div className="fw-semibold mb-1">错因分析</div>
              {user_answer && (
                <div className="small"><strong>我的答案：</strong> <MarkdownWithLatex markdownContent={user_answer} /></div>
              )}
              {correct_answer && (
                <div className="small"><strong>正确答案：</strong> <MarkdownWithLatex markdownContent={correct_answer} /></div>
              )}
              {explanation && (
                <div className="small"><strong>解释：</strong> <MarkdownWithLatex markdownContent={explanation} /></div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

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
            <UserButton />
          </div>
        </div>
      </header>

      <div className="container py-4">
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <i className="bi bi-person-circle" style={{ fontSize: '2.5rem', color: '#4a6fa5' }}></i>
                  <div className="ms-3">
                    <h5 className="card-title mb-0">{user?.username || '...'}</h5>
                    <div className="text-muted">{user?.email || '-'}</div>
                  </div>
                </div>
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/exercise-feedback')}>
                    <i className="bi bi-pencil-square me-1"></i> 前往练习
                  </button>
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/knowledge-points')}>
                    <i className="bi bi-journal-text me-1"></i> 知识点讲解
                  </button>
                </div>
              </div>
            </div>

            {/* 近期错因整理（移动到左半部分） */}
            <div className="card mt-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="card-title m-0">近期错因整理</h5>
                  <button className="btn btn-sm btn-outline-secondary" onClick={async () => {
                    setReportLoading(true);
                    try { const rep = await userExerciseApi.myErrorReport(); setErrorReport(rep); } finally { setReportLoading(false); }
                  }}>刷新</button>
                </div>
                {reportLoading && (
                  <div className="text-muted small">
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    正在生成/更新易错报告…
                  </div>
                )}
                {!reportLoading && (
                  <div className="markdown-body">
                    {errorReport?.content ? (
                      <MarkdownWithLatex markdownContent={errorReport.content} />
                    ) : (
                      <div className="text-muted small">暂无报告，尝试在练习页答题并收藏错误题目的错因分析。</div>
                    )}
                    {errorReport?.updated_at && (
                      <div className="text-muted small mt-2">最近更新：{formatRelativeTime(errorReport.updated_at)}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item"><span className="nav-link active">我的习题</span></li>
            </ul>

            {/* 右半部分专门显示列表（纵向排列） */}
            <div className="mb-4">
              <h5 className="mb-3">已收藏</h5>
              {labeled.length === 0 && <div className="text-muted">暂无</div>}
              {labeled.map(item => (
                <ExerciseRow
                  key={item.exercise.id}
                  e={item.exercise}
                  date={item.created_at}
                  action="unlabel"
                  onAction={handleUnlabel}
                  user_answer={(item as any).user_answer}
                  correct_answer={(item as any).correct_answer}
                  explanation={(item as any).explanation}
                />
              ))}
            </div>

            <div>
              <h5 className="mb-3">已归档</h5>
              {archived.length === 0 && <div className="text-muted">暂无</div>}
              {archived.map(item => (
                <ExerciseRow
                  key={item.exercise.id}
                  e={item.exercise}
                  date={item.created_at}
                  action="unarchive"
                  onAction={handleUnarchive}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
