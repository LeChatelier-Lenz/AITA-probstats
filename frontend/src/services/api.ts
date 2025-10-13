import axios from 'axios';
import { Knowledge, Course, Chapter, Exercise, ApiResponse, ExerciseCheckResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
  // 获取所有练习
  getAll: (): Promise<Exercise[]> =>
    api.get('/exercise/').then(response => response.data.results),

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

    if (options.category && options.category !== '') params.category = options.category;

    if (options.difficulty && options.category !== '') {
      // 支持单个或数组
      params.difficulty = options.difficulty;
    }

    if (options.difficulty && options.category && options.page) params.page = options.page;

    return api
      .get('/exercise/search/', { params })
      .then(response => response.data);
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

export default api;
