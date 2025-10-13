# AI课程助手后端 - Django

概率论与数理统计课程助手的后端API服务，使用Django REST Framework构建。

## 功能特点

- **知识点管理**：CRUD操作，支持AI生成知识点
- **课程管理**：章节和内容管理
- **练习管理**：题目、答案检查、难度分类
- **RESTful API**：完整的API接口
- **CORS支持**：跨域请求支持

## 技术栈

- Django 4.2
- Django REST Framework
- SQLite（开发环境）
- CORS Headers

## 安装指南

### 前提条件

- Python 3.8+
- pip

### 安装步骤

1. 进入后端目录
```bash
cd ai_course_assistant_backend
```

2. 创建虚拟环境
```bash
python -m venv venv
```

3. 激活虚拟环境
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

4. 安装依赖
```bash
pip install -r requirements.txt
```

5. 数据库迁移
```bash
python manage.py makemigrations
python manage.py migrate
```

6. 创建超级用户
```bash
python manage.py createsuperuser
```

7. 启动开发服务器
```bash
python manage.py runserver
```

8. 访问管理后台
打开浏览器访问 `http://localhost:8000/admin/`

## API文档

### 知识点API

- `GET /api/knowledge/` - 获取所有知识点
- `GET /api/knowledge/popular/` - 获取热门知识点
- `GET /api/knowledge/category/{category}/` - 获取指定分类的知识点
- `GET /api/knowledge/{id}/` - 获取单个知识点详情
- `POST /api/knowledge/search/` - 搜索知识点
- `POST /api/knowledge/generate/` - AI生成知识点
- `POST /api/knowledge/{id}/view/` - 更新知识点浏览量

### 课程API

- `GET /api/course/courses/` - 获取所有课程
- `GET /api/course/courses/{id}/` - 获取单个课程详情
- `GET /api/course/courses/{id}/chapters/` - 获取课程章节
- `GET /api/course/chapters/{id}/content/` - 获取章节内容

### 练习API

- `GET /api/exercise/` - 获取所有练习
- `GET /api/exercise/category/{category}/` - 获取指定分类的练习
- `GET /api/exercise/difficulty/{difficulty}/` - 获取指定难度的练习
- `GET /api/exercise/{id}/` - 获取单个练习详情
- `POST /api/exercise/{id}/check/` - 检查练习答案

## 项目结构

```
ai_course_assistant_backend/
├── ai_course_assistant/     # 项目主配置
│   ├── settings.py         # 设置文件
│   ├── urls.py            # 主URL配置
│   └── wsgi.py            # WSGI配置
├── courses/               # 课程应用
│   ├── models.py          # 课程数据模型
│   ├── views.py           # API视图
│   ├── serializers.py     # 序列化器
│   └── urls.py           # URL路由
├── knowledge/             # 知识点应用
│   ├── models.py          # 知识点数据模型
│   ├── views.py           # API视图
│   ├── serializers.py     # 序列化器
│   └── urls.py           # URL路由
├── exercises/             # 练习应用
│   ├── models.py          # 练习数据模型
│   ├── views.py           # API视图
│   ├── serializers.py     # 序列化器
│   └── urls.py           # URL路由
├── requirements.txt       # 依赖包
└── manage.py             # Django管理脚本
```

## 数据模型

### Knowledge（知识点）
- title: 标题
- description: 描述
- content: 内容
- category: 分类
- views: 浏览次数
- duration: 时长
- is_ai_generated: 是否AI生成
- created_at: 创建时间

### Course（课程）
- title: 课程标题
- description: 课程描述
- created_at: 创建时间

### Chapter（章节）
- course: 所属课程
- title: 章节标题
- description: 章节描述
- order: 排序

### ChapterContent（章节内容）
- chapter: 所属章节
- title: 内容标题
- content_type: 内容类型（ppt/preview/video/document）
- url: 内容链接
- order: 排序

### Exercise（练习）
- question: 题目
- options: 选项（JSON）
- answer: 答案
- explanation: 解释
- hint: 提示
- difficulty: 难度（easy/medium/hard）
- category: 分类
- chapter: 所属章节
- created_at: 创建时间

## 开发说明

1. 添加新功能时，请遵循Django REST Framework的最佳实践
2. 所有API都应该有适当的错误处理
3. 使用序列化器进行数据验证
4. 遵循RESTful API设计原则
5. 添加适当的文档字符串和注释

## 许可证

MIT
