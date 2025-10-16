import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userExerciseApi } from '@/services/api';
import { Exercise } from '@/types';
import MarkdownWithLatex from '@/utils/MarkdownWithLatex';
import { formatRelativeTime } from '@/utils/date';
import { getPlainTextSnippet } from '@/utils/text';

const MyExercises: React.FC = () => {
  const navigate = useNavigate();
  const [labeled, setLabeled] = useState<Array<{ exercise: Exercise; created_at: string }>>([]);
  const [archived, setArchived] = useState<Array<{ exercise: Exercise; created_at: string }>>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});


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
    userExerciseApi.myLists().then(data => {
      setLabeled(data.labeled);
      setArchived(data.archived);
    }).catch(() => {
      // 未登录则跳登录
      navigate('/login');
    });
  }, [navigate]);

  const getDifficultyBadge = (difficulty: string) => {
    const colors: any = { easy: 'bg-success', medium: 'bg-warning text-dark', hard: 'bg-danger' };
    return colors[difficulty] || 'bg-secondary';
  };
  const getCategoryBadge = (category: string) => {
    const colors: any = {
      'sample-space': 'bg-info', 'probability': 'bg-primary', 'random-variable': 'bg-danger',
      'distribution': 'bg-secondary', 'expectation': 'bg-success', 'limit-theorem': 'bg-warning text-dark', 'statistics': 'bg-dark'
    };
    return colors[category] || 'bg-secondary';
  };
  const formatDate = (iso?: string) => formatRelativeTime(iso);

  const renderItem = (item: { exercise: Exercise; created_at: string; user_answer?: string; correct_answer?: string; explanation?: string }) => {
    const e = item.exercise;
    return (
      <div key={e.id} className="exercise-item">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <span className={`badge me-2 ${getCategoryBadge(e.category)}`}>{topics.find(t => t.value === e.category)?.label}</span>
            <span className={`badge me-2 ${getDifficultyBadge(e.difficulty)}`}>{difficulties.find(d => d.value === e.difficulty)?.label}</span>
            <small className="text-muted">完成时间：{formatDate(item.created_at)}</small>
          </div>
          <button className="btn btn-sm btn-outline-primary" onClick={() => setExpanded(prev => ({...prev, [e.id]: !prev[e.id]}))}>
            {expanded[e.id] ? '收起详情' : '查看详情'}
          </button>
        </div>
        {expanded[e.id] && (
          <div className="mt-2">
            <div className="exercise-question">
              <MarkdownWithLatex markdownContent={e.question} />
            </div>
            {(item.explanation || item.user_answer || item.correct_answer) && (
              <div className="mt-2">
                <div className="fw-semibold mb-1">错因分析</div>
                {item.user_answer && (
                  <div className="small"><strong>我的答案：</strong> <MarkdownWithLatex markdownContent={item.user_answer} /></div>
                )}
                {item.correct_answer && (
                  <div className="small"><strong>正确答案：</strong> <MarkdownWithLatex markdownContent={item.correct_answer} /></div>
                )}
                {item.explanation && (
                  <div className="small"><strong>解释：</strong> <MarkdownWithLatex markdownContent={item.explanation} /></div>
                )}
              </div>
            )}
          </div>
        )}
        {/* 简要片段，便于快速识别 */}
        <div className="text-muted small mt-1">题目：{getPlainTextSnippet(e.question, 80)}</div>
      </div>
    );
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-link" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left"></i> 返回
        </button>
        <h2 className="m-0">我的习题</h2>
        <div></div>
      </div>
      <div className="row">
        <div className="col-md-6">
          <h4>已收藏</h4>
          {labeled.length === 0 ? <div className="text-muted">暂无</div> : labeled.map(renderItem)}
        </div>
        <div className="col-md-6">
          <h4>已归档</h4>
          {archived.length === 0 ? <div className="text-muted">暂无</div> : archived.map(renderItem)}
        </div>
      </div>
    </div>
  );
};

export default MyExercises;
