import axios from 'axios';
import { Knowledge, Course, Chapter, Exercise, ApiResponse, ExerciseCheckResult, AuthResponse, UserProfile, UserExercises } from '../types';

const API_BASE_URL = "/api"
// import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 注入 Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any)['Authorization'] = `Token ${token}`;
  }
  return config;
});

// 知识点相关API
export const knowledgeApi = {
  // 获取所有知识点
  getAll: (): Promise<Knowledge[]> =>
    api.get('/knowledge/').then(response => response.data.results),

  // 获取热门知识点
  getPopular: (): Promise<Knowledge[]> =>
    api.get('/knowledge/popular/').then(response => response.data),

  // 根据分类获取知识点
  getByCategory: (category: string): Promise<Knowledge[]> =>
    api.get(`/knowledge/category/?category=${category}/`).then(response => response.data),

  // 搜索知识点
  search: (query: string): Promise<Knowledge[]> =>
    api.post('/knowledge/search/', { query }).then(response => response.data),

  // AI生成知识点
  generate: (question: string): Promise<Knowledge> =>
    api.post('/knowledge/generate/', { question }).then(response => response.data),

  // 更新浏览量
  updateViews: (id: number): Promise<{ views: number }> =>
    api.post(`/knowledge/${id}/view/`).then(response => response.data),

  // 获取单个知识点
  getById: (id: number): Promise<Knowledge> =>
    api.get(`/knowledge/${id}/`).then(response => response.data),
};

// 课程相关API
export const courseApi = {
  // 获取所有课程
  getAll: (): Promise<Course[]> =>
    api.get('/course/courses/').then(response => response.data.results),

  // 获取课程章节
  getChapters: (courseId: number): Promise<Chapter[]> =>
    api.get(`/course/courses/${courseId}/chapters/`).then(response => response.data),

  // 获取章节内容
  getChapterContent: (chapterId: number): Promise<Chapter> =>
    api.get(`/course/chapters/${chapterId}/content/`).then(response => response.data),

  // 获取单个课程
  getById: (id: number): Promise<Course> =>
    api.get(`/course/courses/${id}/`).then(response => response.data),
};

// 练习相关API
export const exerciseApi = {
  // 获取所有练习（支持分页）
  // 若传入 page，则从后端获取对应页并返回列表；否则取第一页
  getAll: (page?: number): Promise<Exercise[]> =>
    api
      .get('/exercise/', { params: page ? { page } : {} })
      .then(response => (response.data.results ?? response.data)),

  // 获取所有练习（分页原始响应）
  // 返回 { count, next, previous, results }，便于前端做分页控件
  getAllPaged: (page?: number): Promise<ApiResponse<Exercise>> =>
    api
      .get('/exercise/', { params: page ? { page } : {} })
      .then(response => response.data),

  // // 根据分类获取练习
  // getByCategory: (category: string): Promise<Exercise[]> =>
  //   api.get(`/exercise/category/?category=${category}`).then(response => response.data),

  // // 根据难度获取练习
  // getByDifficulty: (difficulty: string): Promise<Exercise[]> =>
  //   api.get(`/exercise/difficulty/?difficulty=${difficulty}`).then(response => response.data),

  // 复杂查询
  getByMultiple: (options: {
    category?: string;
    difficulty?: string | string[];
    page?: number;
  }): Promise<Exercise[]> => {
    const params: Record<string, any> = {};

    if (options.category && options.category !== '') {
      params.category = options.category;
    }

    if (options.difficulty && options.difficulty !== '') {
      // 支持单个或数组
      params.difficulty = options.difficulty;
    }

    if (typeof options.page === 'number' && options.page > 0) {
      params.page = options.page;
    }

    return api
      .get('/exercise/search/', { params })
      .then(response => (response.data.results ?? response.data));
  },

  // 复杂查询（分页原始响应）
  getByMultiplePaged: (options: {
    category?: string;
    difficulty?: string | string[];
    page?: number;
  }): Promise<ApiResponse<Exercise>> => {
    const params: Record<string, any> = {};
    if (options.category && options.category !== '') params.category = options.category;
    if (options.difficulty && options.difficulty !== '') params.difficulty = options.difficulty;
    if (typeof options.page === 'number' && options.page > 0) params.page = options.page;
    return api.get('/exercise/search/', { params }).then(res => res.data);
  },

  // 检查练习答案
  checkAnswer: (id: number, answer: string): Promise<ExerciseCheckResult> =>
    api
      .get('/exercise/check/', {
        params: { id, answer },
      })
      .then(res => res.data),

  // 获取单个练习
  getById: (id: number): Promise<Exercise> =>
    api.get(`/exercise/${id}/`).then(response => response.data),
};

// 用户与认证相关 API
export const authApi = {
  login: (username: string, password: string): Promise<AuthResponse> =>
    api.post('/users/login/', { username, password }).then(res => res.data),
  register: (username: string, email: string, password: string): Promise<AuthResponse> =>
    api.post('/users/register/', { username, email, password }).then(res => res.data),
  me: (): Promise<{ user: UserProfile }> => api.get('/users/me/').then(res => res.data),
};

export const userExerciseApi = {
  toggleLabel: (exerciseId: number): Promise<{ status: 'labeled' | 'unlabeled' }> =>
    api.post(`/users/exercises/${exerciseId}/toggle-label/`).then(res => res.data),
  toggleLabelWithAnalysis: (
    exerciseId: number,
    data: { user_answer?: string; correct_answer?: string; explanation?: string }
  ): Promise<{ status: 'labeled' | 'unlabeled' }> =>
    api.post(`/users/exercises/${exerciseId}/toggle-label/`, data).then(res => res.data),
  toggleArchive: (exerciseId: number): Promise<{ status: 'archived' | 'unarchived' }> =>
    api.post(`/users/exercises/${exerciseId}/toggle-archive/`).then(res => res.data),
  myLists: (): Promise<UserExercises> => api.get('/users/me/exercises/').then(res => res.data),
  myErrorReport: (): Promise<{ content: string; updated_at: string }> =>
    api.get('/users/me/error-report/').then(res => res.data),
};

export default api;
