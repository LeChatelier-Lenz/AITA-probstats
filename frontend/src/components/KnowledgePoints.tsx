import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Knowledge } from '../types';
import { knowledgeApi } from '../services/api';

const KnowledgePoints: React.FC = () => {
  const navigate = useNavigate();
  const [knowledgeList, setKnowledgeList] = useState<Knowledge[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedKnowledge, setSelectedKnowledge] = useState<Knowledge | null>(null);
  const [showModal, setShowModal] = useState(false);

  const categories = [
    '全部', '样本空间', '随机事件', '概率分布', '期望与方差', 
    '大数定律', '中心极限定理', '参数估计', '假设检验'
  ];

  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    try {
      const knowledgeData = await knowledgeApi.getAll();
      setKnowledgeList(knowledgeData);
    } catch (error) {
      console.error('加载知识点失败:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadKnowledge();
      return;
    }

    try {
      const searchResults = await knowledgeApi.search(searchQuery);
      setKnowledgeList(searchResults);
    } catch (error) {
      console.error('搜索失败:', error);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiQuery.trim()) return;

    try {
      const aiKnowledge = await knowledgeApi.generate(aiQuery);
      setKnowledgeList(prev => [aiKnowledge, ...prev]);
      setAiQuery('');
    } catch (error) {
      console.error('AI生成失败:', error);
    }
  };

  const handleCategoryFilter = async (category: string) => {
    setSelectedCategory(category);
    if (category === 'all') {
      loadKnowledge();
    } else {
      try {
        const categoryKnowledge = await knowledgeApi.getByCategory(category);
        setKnowledgeList(categoryKnowledge);
      } catch (error) {
        console.error('分类筛选失败:', error);
      }
    }
  };

  const handleKnowledgeClick = async (knowledge: Knowledge) => {
    setSelectedKnowledge(knowledge);
    setShowModal(true);
    
    // 更新浏览量
    try {
      await knowledgeApi.updateViews(knowledge.id);
    } catch (error) {
      console.error('更新浏览量失败:', error);
    }
  };

  const filteredKnowledge = knowledgeList.filter(knowledge => {
    if (selectedCategory === 'all') return true;
    return knowledge.category === selectedCategory;
  });

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
                  className="nav-link"
                  onClick={() => navigate('/course-management')}
                >
                  课程管理
                </button>
              </li>
              <li className="nav-item">
                <button className="nav-link active">
                  知识点讲解
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <div className="container py-4">
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="search-container">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input" 
                placeholder="搜索知识点..." 
              />
              <button className="search-button" onClick={handleSearch}>
                <i className="bi bi-search"></i>
              </button>
            </div>
          </div>
          <div className="col-md-6">
            <div className="search-container">
              <input 
                type="text" 
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                className="search-input" 
                placeholder="输入问题，生成知识点讲解..." 
              />
              <button className="search-button" onClick={handleAiGenerate}>
                <i className="bi bi-robot"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-12">
            <h2 className="fs-4 mb-3">热门知识点</h2>
            <div className="d-flex overflow-auto pb-2">
              {categories.map(category => (
                <button 
                  key={category}
                  className={`btn me-2 ${selectedCategory === category ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleCategoryFilter(category === '全部' ? 'all' : category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="knowledge-grid">
          {filteredKnowledge.map(knowledge => (
            <div 
              key={knowledge.id}
              className={`knowledge-card ${knowledge.is_ai_generated ? 'ai-generated' : ''}`}
              onClick={() => handleKnowledgeClick(knowledge)}
            >
              <div className="knowledge-thumbnail">
                <i 
                  className={knowledge.is_ai_generated ? "bi bi-robot" : "bi bi-play-circle"} 
                  style={{fontSize: '3rem', color: knowledge.is_ai_generated ? '#5d9cec' : '#4a6fa5'}}
                ></i>
              </div>
              <div className="knowledge-info">
                <h3 className="knowledge-title">{knowledge.title}</h3>
                <p className="knowledge-description">{knowledge.description}</p>
                <div className="knowledge-meta">
                  <span>
                    <i className="bi bi-eye me-1"></i> {knowledge.views}次
                  </span>
                  <span>
                    <i className="bi bi-clock me-1"></i> {knowledge.duration}
                  </span>
                  {knowledge.is_ai_generated && (
                    <span>
                      <i className="bi bi-stars me-1"></i> AI生成
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <button className="btn btn-outline-primary px-4">
            加载更多 <i className="bi bi-arrow-down-circle ms-1"></i>
          </button>
        </div>
      </div>

      {/* 知识点详情模态框 */}
      {showModal && selectedKnowledge && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">知识点详情</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="ratio ratio-16x9 mb-3">
                  <div className="bg-light d-flex align-items-center justify-content-center">
                    <i 
                      className={selectedKnowledge.is_ai_generated ? "bi bi-robot" : "bi bi-play-circle"} 
                      style={{fontSize: '4rem', color: '#4a6fa5'}}
                    ></i>
                    <span className="ms-3 fs-5">知识点演示动画</span>
                  </div>
                </div>
                <h3 className="fs-4 mb-2">{selectedKnowledge.title}</h3>
                <p className="text-muted mb-3">
                  发布于 {new Date(selectedKnowledge.created_at).toLocaleDateString()} | {selectedKnowledge.views}次观看
                </p>
                <div dangerouslySetInnerHTML={{ __html: selectedKnowledge.content.replace(/\n/g, '<br>') }} />
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                >
                  关闭
                </button>
                <button type="button" className="btn btn-primary">下一个知识点</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgePoints;
