// 知识点类型
export interface Knowledge {
  id: number;
  title: string;
  description: string;
  content: string;
  category: string;
  views: number;
  duration: string;
  is_ai_generated: boolean;
  created_at: string;
}

// 课程类型
export interface Course {
  id: number;
  title: string;
  description: string;
  created_at: string;
  chapters: Chapter[];
}

// 章节类型
export interface Chapter {
  id: number;
  title: string;
  description: string;
  order: number;
  contents: ChapterContent[];
}

// 章节内容类型
export interface ChapterContent {
  id: number;
  title: string;
  content_type: 'ppt' | 'preview' | 'video' | 'document';
  url: string;
  order: number;
}

// 练习类型
export interface Exercise {
  id: number;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  chapter: number | null;
  created_at: string;
}

// API响应类型
export interface ApiResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

// 练习检查结果类型
export interface ExerciseCheckResult {
  is_correct: boolean;
  correct_answer: string;
  explanation: string;
  user_answer: string;
}
