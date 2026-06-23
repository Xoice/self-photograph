# XOICE / self_photograph

一个已经完成前后端分离改造的摄影展示与内容管理项目。

当前仓库同时包含：

- 公开站点前端
- 管理后台前端
- NestJS 后端 API
- Prisma 数据模型与种子数据
- 本地媒体上传能力

## 项目现状

项目已经不再是"纯前端展示页"，而是完整的全栈工程。

### 已有公开站点能力

- 首页六大区块：`Hero`、`Bio`、`Gallery`、`Video`、`PhotographyStudy`、`Contact`
- 画廊列表页：`/gallery`
- 作品详情页：`/gallery/:slug`
- 研学详情页：`/workshops/:slug`
- 兼容旧链接：`/photographystudy/kenya-expedition`

### 已有后台能力

- 管理员登录
- 作品管理（CRUD + 封面图上传）
- 视频管理（CRUD + 封面图上传）
- 研学管理（CRUD + 封面图上传）
- 媒体库管理（上传 / 浏览 / 删除 / 复制 URL）

### 已有后端能力

- 站点配置接口
- 画廊分类、作品列表、作品详情接口
- 视频列表接口
- 研学列表、详情接口
- 联系表单与报名提交接口
- 后台内容 CRUD 接口
- 图片上传、媒体列表、媒体删除接口
- Admin DTO 校验
- JWT 认证

## 技术栈

### 前端

- `Vite (rolldown-vite)`
- `React 19`
- `TypeScript`
- `MUI 7`
- `GSAP`
- `Lenis`
- `React Three Fiber`
- `Axios`
- `TanStack Query`
- `React Hook Form`
- `Zod`

### 后端

- `NestJS`
- `Prisma`
- `JWT`
- `bcryptjs`
- `Multer`

### 数据库与存储

- 开发数据库：`SQLite`
- 生产建议：`PostgreSQL`
- 当前媒体存储：本地 `uploads`

## 目录结构

```text
self_photograph/
├─ src/                      # 前端站点与后台页面
│  ├─ api/                   # 8 个 API 模块 (client, auth, site, gallery, videos, workshops, leads, media)
│  ├─ components/            # UI / layout / three 组件
│  ├─ contexts/              # AuthContext
│  ├─ hooks/                 # 9 个 TanStack Query hooks
│  ├─ mocks/                 # Mock 数据 + AxiosAdapter
│  ├─ pages/                 # Home / Gallery / Workshops / Admin 页面
│  ├─ theme/                 # MUI 主题
│  ├─ types/                 # api.ts 类型定义
│  └─ utils/                 # lenis / navigation 工具
├─ apps/
│  └─ api/                   # NestJS API
│     ├─ prisma/             # schema + seed + migrations + dev.db
│     ├─ src/
│     │  ├─ common/          # interceptors / filters / guards / decorators
│     │  └─ modules/         # auth / site / gallery / videos / workshops / leads / media / health
│     └─ uploads/            # 本地上传文件存储
├─ docs/                     # 项目文档
├─ AGENTS.md                 # 接手与构建规则
├─ 工作.md                    # 最新推进记录与交接摘要
├─ docker-compose.yml        # PostgreSQL 开发容器
├─ package.json              # 前端依赖
└─ apps/api/package.json     # 后端依赖
```

## 关键模块

### 前端

- `src/App.tsx`：前端总路由、懒加载、全局布局
- `src/main.tsx`：`QueryClientProvider` 注入入口
- `src/api/client.ts`：Axios 客户端 + 拦截器 + Mock 切换
- `src/types/api.ts`：全部业务类型定义
- `src/hooks/`：9 个数据获取与表单提交 hooks
- `src/contexts/AuthContext.tsx`：后台登录态
- `src/components/ui/ImageUploader.tsx`：上传、裁剪、媒体库选择入口
- `src/components/ui/ImageCropper.tsx`：Canvas 裁剪（1:1/4:3/16:9/自由）
- `src/components/ui/MediaBrowser.tsx`：媒体库浏览/搜索/删除
- `src/pages/Admin/`：后台页面
- `src/pages/Gallery/`：作品列表与详情页
- `src/pages/Workshops/`：研学详情页

### 后端

- `apps/api/src/main.ts`：全局前缀、CORS、静态资源、拦截器、过滤器
- `apps/api/prisma/schema.prisma`：13 个数据库模型
- `apps/api/prisma/seed.ts`：初始化数据
- `apps/api/src/modules/auth/`：登录认证
- `apps/api/src/modules/site/`：站点配置
- `apps/api/src/modules/gallery/`：画廊内容（含 DTO）
- `apps/api/src/modules/videos/`：视频内容（含 DTO）
- `apps/api/src/modules/workshops/`：研学活动（含 DTO）
- `apps/api/src/modules/leads/`：联系与报名
- `apps/api/src/modules/media/`：上传与媒体列表
- `apps/api/src/common/`：ResponseTransformer / ApiExceptionFilter / JwtAuthGuard / CurrentUser

## 本地开发

### 1. 安装前端依赖

```bash
cd e:\Learning\Projects\self_photograph
npm install
```

### 2. 安装后端依赖

```bash
cd e:\Learning\Projects\self_photograph\apps\api
npm install
```

### 3. 启动后端

```bash
cd e:\Learning\Projects\self_photograph\apps\api
npm run start:dev
```

默认地址：

- API：`http://localhost:3000/api/v1`
- 健康检查：`http://localhost:3000/health`

### 4. 初始化数据库

```bash
cd e:\Learning\Projects\self_photograph\apps\api
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 5. 启动前端

```bash
cd e:\Learning\Projects\self_photograph
npm run dev
```

默认地址：

- 站点：`http://localhost:5173`
- 后台登录：`http://localhost:5173/admin/login`

## 环境变量

### 根目录 `.env`

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_UPLOAD_BASE_URL=https://cdn.example.com
VITE_BILIBILI_SPACE_URL=https://space.bilibili.com/xxxxxx
VITE_USE_MOCK=false
```

说明：

- `VITE_USE_MOCK=true` 时使用 `src/mocks/`（通过 AxiosAdapter 拦截）
- `VITE_USE_MOCK=false` 时请求真实后端

### `apps/api/.env`

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=file:./dev.db
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

## 默认管理员

- 邮箱：`admin@xoice.com`
- 密码：`admin123`

## 当前开发建议

### 如果你要改公开站点

- 优先检查 `src/hooks/` 与 `src/api/`
- 不要破坏 `GSAP` 与 `Lenis` 动画链路
- 画廊区块是高风险区域，改动前先理解 `ScrollTrigger`

### 如果你要改后台

- 认证统一走 `AuthContext`
- 现有表单是 MVP，可继续增强字段和校验
- 上传入口优先复用 `ImageUploader`

### 如果你要改后端

- 保持统一响应格式
- 改字段时同步更新前端类型和接口文档
- 改 Prisma schema 前确认 seed 与后台表单是否需要联动修改
- Admin 接口使用 DTO 校验，不要回退到 `any`

## 当前已知限制

- 画廊分类下拉菜单仍是静态展示
- 后台尚未提供独立线索管理页面
- 媒体删除未删除磁盘原文件
- 本地上传适合开发，生产应切换云存储
- 旧页面 `KenyaExpedition.tsx` 仍保留兼容用途

## 文档入口

- `AGENTS.md`：构建规则与接手顺序
- `工作.md`：本次项目推进摘要
- `docs/01-项目规划.md`
- `docs/02-前端文档.md`
- `docs/03-后端文档.md`
- `docs/04-API接口文档.md`
- `docs/05-实施计划.md`
- `docs/06-推进记录.md`

## 构建与检查

### 前端构建

```bash
cd e:\Learning\Projects\self_photograph
npm run build
```

### 后端构建

```bash
cd e:\Learning\Projects\self_photograph\apps\api
npm run build
```

## 后续建议

- 完善后台表单字段
- 做真实分类与标签管理
- 增加线索管理页面
- 切换云端图片存储
- 增加 SEO、测试、CI/CD
