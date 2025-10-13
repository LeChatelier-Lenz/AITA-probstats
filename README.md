# AI课程助手 - React + Django 版本

这是概率论与数理统计课程助手的React + Django版本，完全保留了原项目的功能、数据、排版和风格。

## 项目架构

- **前端**: React 18 + TypeScript + Bootstrap 5
- **后端**: Django 4.2 + Django REST Framework
- **数据库**: SQLite（开发环境）
- **API**: RESTful API设计

## 项目结构

```
├── ai_course_assistant_backend/    # Django后端
│   ├── ai_course_assistant/       # 项目主配置
│   ├── courses/                   # 课程应用
│   ├── knowledge/                 # 知识点应用
│   ├── exercises/                 # 练习应用
│   └── requirements.txt           # 后端依赖
├── ai_course_assistant_frontend/  # React前端
│   ├── src/                      # 源代码
│   ├── public/                   # 静态资源
│   └── package.json              # 前端依赖
├── start_backend.bat             # 后端启动脚本
├── start_frontend.bat            # 前端启动脚本
└── README.md                     # 项目说明
```

## 快速开始

### 1. 后端启动

```bash
# 进入后端目录
cd ai_course_assistant_backend

# 安装依赖
pip install -r requirements.txt

# 数据库迁移
python manage.py makemigrations
python manage.py migrate

# 初始化数据
python manage.py init_data

# 启动服务器
python manage.py runserver
```

或者直接运行 `start_backend.bat`

### 2. 前端启动

```bash
# 进入前端目录
cd ai_course_assistant_frontend

# 安装依赖
npm install

# 启动开发服务器
npm start
```

或者直接运行 `start_frontend.bat`

### 3. 访问应用

- 前端应用: http://localhost:3000
- 后端API: http://localhost:8000/api/
- 管理后台: http://localhost:8000/admin/

## 功能特性

### 🏠 首页
- 响应式卡片布局
- 导航到主要功能模块
- 现代化UI设计

### 📚 课程管理系统
- 三栏布局：课程目录、内容展示、AI聊天
- 可折叠的章节树形结构
- 章节内容展示
- AI助教实时问答

### 🧠 知识点讲解
- 知识点网格展示
- 搜索和分类筛选
- AI生成知识点功能
- 模态框详情展示
- 浏览量统计

### ✏️ 课后练习 & 反馈
- **作业批改**: 文件上传、历史记录、错题统计
- **习题练习**: 题目展示、答案提交、即时反馈
- **个性化训练**: 传统套题、AI推荐训练

## 技术特点

### 前端技术
- **React 18**: 最新的React版本，支持并发特性
- **TypeScript**: 类型安全，提升开发体验
- **React Router**: 单页面应用路由管理
- **Bootstrap 5**: 响应式UI框架
- **Axios**: HTTP客户端，API调用
- **CSS3**: 现代化样式，平滑动画效果

### 后端技术
- **Django 4.2**: 强大的Web框架
- **Django REST Framework**: RESTful API开发
- **SQLite**: 轻量级数据库（开发环境）
- **CORS Headers**: 跨域请求支持
- **管理后台**: 内置数据管理界面

### 数据模型
- **Knowledge**: 知识点管理
- **Course**: 课程管理
- **Chapter**: 章节管理
- **ChapterContent**: 章节内容
- **Exercise**: 练习题管理

## API接口

### 知识点API
```
GET    /api/knowledge/              # 获取所有知识点
GET    /api/knowledge/popular/      # 获取热门知识点
GET    /api/knowledge/category/{}/  # 按分类获取
POST   /api/knowledge/search/       # 搜索知识点
POST   /api/knowledge/generate/     # AI生成知识点
POST   /api/knowledge/{id}/view/    # 更新浏览量
```

### 课程API
```
GET    /api/course/courses/         # 获取所有课程
GET    /api/course/courses/{id}/    # 获取课程详情
GET    /api/course/courses/{id}/chapters/  # 获取章节
GET    /api/course/chapters/{id}/content/  # 获取章节内容
```

### 练习API
```
GET    /api/exercise/               # 获取所有练习
GET    /api/exercise/category/{}/   # 按分类获取
GET    /api/exercise/difficulty/{}/ # 按难度获取
POST   /api/exercise/{id}/check/    # 检查答案
```

## 样式设计

完全保留了原项目的视觉设计：

- **主色调**: #4a6fa5 (深蓝色)
- **强调色**: #5d9cec (浅蓝色)
- **卡片式布局**: 圆角、阴影效果
- **响应式设计**: 适配各种屏幕尺寸
- **平滑动画**: CSS过渡效果
- **图标系统**: Bootstrap Icons

## 开发说明

### 环境要求
- Python 3.8+
- Node.js 16+
- npm 或 yarn

### 开发模式
1. 后端开发服务器运行在 8000 端口
2. 前端开发服务器运行在 3000 端口
3. 前端通过代理访问后端API
4. 支持热重载，修改代码自动刷新

### 生产部署
1. 后端：使用Gunicorn + Nginx
2. 前端：构建静态文件，部署到CDN
3. 数据库：可切换到PostgreSQL/MySQL

## 与原项目对比

| 特性 | 原项目 (Node.js + MongoDB) | 新项目 (React + Django) |
|------|---------------------------|-------------------------|
| 前端框架 | 原生HTML/CSS/JS | React + TypeScript |
| 后端框架 | Node.js + Express | Django + DRF |
| 数据库 | MongoDB | SQLite/PostgreSQL |
| 类型安全 | ❌ | ✅ TypeScript |
| 组件化 | ❌ | ✅ React组件 |
| API设计 | RESTful | RESTful + DRF |
| 管理后台 | ❌ | ✅ Django Admin |
| 开发体验 | 基础 | 现代化工具链 |

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进项目！

---

**注意**: 这是一个完整的项目转换，保留了原有的所有功能和设计风格，同时提供了现代化的开发体验和更好的可维护性。
