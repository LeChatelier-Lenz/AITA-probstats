# AI课程助手前端 - React TypeScript + Vite

概率论与数理统计课程助手的前端应用，使用React + TypeScript + Vite构建。

## 功能特点

- **响应式设计**：适配各种设备屏幕尺寸
- **模块化组件**：可复用的React组件
- **TypeScript支持**：类型安全的开发体验
- **现代化UI**：使用Bootstrap 5和自定义样式
- **路由管理**：React Router单页面应用
- **API集成**：与Django后端无缝对接
- **极速开发**：Vite构建工具，热重载更快

## 技术栈

- React 18
- TypeScript
- Vite 5
- React Router
- Bootstrap 5
- Bootstrap Icons
- Axios
- CSS3

## 安装指南

### 前提条件

- Node.js 16+
- npm 或 yarn

### 安装步骤

1. 进入前端目录
```bash
cd frontend
```

2. 安装依赖
```bash
npm install
```

3. 创建环境配置文件
```bash
# 创建环境变量文件
echo "VITE_API_URL=http://localhost:8000/api" > .env
```

4. 启动开发服务器
```bash
npm run dev
```

5. 访问应用
打开浏览器访问 `http://localhost:3000`

## 项目结构

```
ai_course_assistant_frontend/
├── public/                 # 静态资源
│   ├── index.html         # HTML模板
│   └── manifest.json      # PWA配置
├── src/                   # 源代码
│   ├── components/        # React组件
│   │   ├── Home.tsx      # 首页组件
│   │   ├── CourseManagement.tsx  # 课程管理组件
│   │   ├── KnowledgePoints.tsx   # 知识点组件
│   │   └── ExerciseFeedback.tsx  # 练习反馈组件
│   ├── services/          # API服务
│   │   └── api.ts        # API调用封装
│   ├── types/            # TypeScript类型定义
│   │   └── index.ts      # 数据类型
│   ├── App.tsx           # 主应用组件
│   ├── index.tsx         # 应用入口
│   └── index.css         # 全局样式
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript配置
└── README.md            # 项目说明
```

## 组件说明

### Home（首页）
- 应用入口页面
- 提供导航到主要功能模块
- 响应式卡片布局

### CourseManagement（课程管理）
- 课程目录树形结构
- 章节内容展示
- AI助教聊天功能
- 三栏布局设计

### KnowledgePoints（知识点）
- 知识点网格展示
- 搜索和筛选功能
- AI生成知识点
- 分类标签过滤
- 模态框详情展示

### ExerciseFeedback（练习反馈）
- 三个标签页：作业批改、习题练习、个性化训练
- 练习题目展示
- 答案提交和检查
- 提示和反馈功能
- 错题统计分析

## API集成

前端通过 `services/api.ts` 文件与后端API进行交互：

```typescript
// 知识点API
knowledgeApi.getAll()           // 获取所有知识点
knowledgeApi.search(query)      // 搜索知识点
knowledgeApi.generate(question) // AI生成知识点

// 课程API
courseApi.getAll()              // 获取所有课程
courseApi.getChapters(id)       // 获取课程章节

// 练习API
exerciseApi.getAll()            // 获取所有练习
exerciseApi.checkAnswer(id, answer) // 检查答案
```

## 样式设计

### CSS变量
```css
:root {
    --primary-color: #4a6fa5;
    --secondary-color: #6c757d;
    --accent-color: #5d9cec;
    /* ... */
}
```

### 响应式断点
- 桌面端：> 768px
- 移动端：≤ 768px

### 组件样式
- 使用Bootstrap 5作为基础框架
- 自定义CSS增强视觉效果
- 卡片式布局和阴影效果
- 平滑过渡动画

## 开发说明

### 添加新组件
1. 在 `src/components/` 目录下创建新组件文件
2. 使用TypeScript定义Props接口
3. 在 `App.tsx` 中添加路由配置
4. 更新导航菜单

### API调用
1. 在 `src/types/index.ts` 中定义数据类型
2. 在 `src/services/api.ts` 中添加API方法
3. 在组件中使用API服务

### 样式定制
1. 修改CSS变量来调整主题色彩
2. 在 `src/index.css` 中添加全局样式
3. 使用Bootstrap类名进行快速布局

## 构建部署

### 开发构建
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

### 代码检查
```bash
npm run lint
```

## 环境变量

创建 `.env` 文件配置环境变量：

```env
VITE_API_URL=http://localhost:8000/api
```

## Vite 优势

相比 Create React App，Vite 提供了：

- **更快的启动速度**：冷启动时间显著减少
- **更快的热重载**：文件修改后即时更新
- **更好的开发体验**：原生 ES 模块支持
- **更小的包体积**：优化的构建输出
- **现代化的工具链**：基于 ESBuild 的快速构建

## 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 许可证

MIT
