# AGENTS.md

## Structure

Single-repo fullstack: React frontend at root, NestJS backend at `apps/api/`.

```
src/           # React 19 + MUI 7 + GSAP + Lenis + R3F frontend
apps/api/      # NestJS + Prisma + JWT backend
docs/          # Project docs
工作.md         # Work log — read this first every session
```

## Commands

**Frontend (root):**
```bash
npm run dev          # Vite dev server → http://localhost:5173
npm run build        # tsc -b && vite build
npm run lint         # eslint .
```

**Backend (`apps/api/`):**
```bash
npm run start:dev    # NestJS watch mode → http://localhost:3000
npm run build        # nest build
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed  # Default admin: admin@xoice.com / admin123
```

## Environment

Root `.env` — `VITE_USE_MOCK=false` switches between mock adapter and real API.
`apps/api/.env` — SQLite locally, PostgreSQL for production (see `docker-compose.yml`).

Vite proxies `/api` and `/uploads` to `localhost:3000`.

## Critical Gotchas

- **GSAP/Lenis**: GallerySection horizontal scroll is high-risk. Never remove Lenis or break ScrollTrigger. Async data loads must call `ScrollTrigger.refresh()`.
- **API client**: `src/api/client.ts` response interceptor unwraps `body.data` — API functions return domain objects directly, not AxiosResponse.
- **Mock mode**: `VITE_USE_MOCK=true` uses `src/mocks/index.ts` AxiosAdapter. Mock data files: `src/mocks/{siteConfig,gallery,videos,workshops}.ts`.
- **Multer uploads**: Never set `Content-Type: multipart/form-data` manually — let Axios handle it.
- **SQLite limits**: `mode: "insensitive"` not supported. Prisma datasource is `sqlite` — don't delete migration history.
- **Admin DTOs**: Gallery/videos/workshops admin endpoints use `class-validator` DTOs. Don't revert to `any`.
- **Backend response**: `{ code: 0, message: "ok", data }` on success. Errors: `{ code, message, data: null }` via `ApiExceptionFilter`.
- **Work log**: After any real work, append to `工作.md` with: 完成内容, 文件变更 (新建/修改分类), 验证结果, 注意事项.
- **问题.md**: All code review findings and problem lists go to `问题.md`. Never create separate dated files like `2026-7-18日优化.md`. Append new review records to `问题.md` with a dated section header. Mark fixed items with `[x]`.

## Backend Modules

8 modules under `apps/api/src/modules/`: auth, site, gallery, videos, workshops, leads, media, health.
Prefix: `/api/v1` (health excluded). All admin routes guarded by `JwtAuthGuard`.

## Frontend Conventions

- Types: `src/types/api.ts`
- API modules: `src/api/` (8 files)
- Hooks: `src/hooks/` (TanStack Query)
- Auth: `src/contexts/AuthContext.tsx`
- Image upload: reuse `ImageUploader` → `ImageCropper` → `MediaBrowser`

## Pre-check Rule

Before any code task, read `工作.md` then `AGENTS.md`. Skip only for pure Q&A.


# AGENTS.md

## 1. 文件目标

本文件用于指导任何新会话、协作者或自动化代理，快速接手并持续构建当前项目。

这里记录的不是最初规划，而是**当前项目已经落地后的真实工作方式**：

- 项目已经是前后端分离形态
- 前端、后端、后台管理、媒体上传都已接通
- 文档更新必须以当前代码为准，而不是以旧规划为准

## 2. 当前项目定义

项目名：`self_photograph`

项目定位：

- 一个高视觉表现的个人摄影展示站
- 前后端分离
- 单一管理员后台
- 公开站点面向访客
- 后台面向内容维护与媒体管理

当前技术栈：

- 前端：`Vite (rolldown-vite) + React 19 + TypeScript + MUI 7 + GSAP + Lenis + React Three Fiber`
- 数据层：`Axios + TanStack Query + React Hook Form + Zod`
- 后端：`NestJS + Prisma + JWT + bcryptjs + Multer`
- 数据库：开发环境 `SQLite`，生产建议 `PostgreSQL`
- 媒体存储：当前为本地 `uploads`，后续可切 `Cloudinary / S3`

## 3. 仓库结构

当前仓库已经是单仓全栈结构：

```text
self_photograph/
├─ src/                  # 前端站点与后台前端
│  ├─ api/               # 8 个 API 模块
│  ├─ components/        # UI / layout / three 组件
│  ├─ contexts/          # AuthContext
│  ├─ hooks/             # 9 个 TanStack Query hooks
│  ├─ mocks/             # Mock 数据 + AxiosAdapter
│  ├─ pages/             # Home / Gallery / Workshops / Admin 页面
│  ├─ theme/             # MUI 主题
│  ├─ types/             # api.ts 类型定义
│  └─ utils/             # lenis / navigation 工具
├─ apps/
│  └─ api/               # NestJS 后端
│     ├─ prisma/         # schema + seed + migrations + dev.db
│     ├─ src/
│     │  ├─ common/      # interceptors / filters / guards / decorators
│     │  └─ modules/     # auth / site / gallery / videos / workshops / leads / media / health
│     └─ uploads/        # 本地上传文件存储
├─ docs/                 # 项目文档
├─ AGENTS.md
├─ README.md
├─ 工作.md
└─ docker-compose.yml
```

关键目录：

- `src/`：公开站点与后台前端
- `apps/api/`：后端 API 与 Prisma
- `docs/`：规划、前端、后端、接口、实施、推进文档
- `工作.md`：最新工作摘要与交接记录

## 4. 当前已完成能力

### 公开站点

- 首页六大区块：`Hero`、`Bio`、`Gallery`、`Video`、`PhotographyStudy`、`Contact`
- 画廊列表页：`/gallery`
- 作品详情页：`/gallery/:slug`
- 研学详情页：`/workshops/:slug`
- 旧研学页面兼容路由：`/photographystudy/kenya-expedition`

### 后台

- 登录页：`/admin/login`
- 后台首页：`/admin`
- 作品管理：`/admin/works`
- 视频管理：`/admin/videos`
- 研学管理：`/admin/workshops`
- 媒体库：`/admin/media`

### 后端

- 公开接口：`site`、`gallery`、`videos`、`workshops`、`leads`
- 管理接口：`auth`、`admin/site`、`admin/gallery`、`admin/videos`、`admin/workshops`、`admin/media`、`admin/leads`
- 统一响应格式 `{ code, message, data }`
- 统一异常处理 `ApiExceptionFilter`
- JWT 认证 `JwtAuthGuard`
- 本地图片上传与访问
- Admin DTO 校验（gallery / videos / workshops）

## 5. 当前运行模式

### 前端环境

根目录 `.env` 关键变量：

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_UPLOAD_BASE_URL=https://cdn.example.com
VITE_BILIBILI_SPACE_URL=https://space.bilibili.com/xxxxxx
VITE_USE_MOCK=false
```

说明：

- `VITE_USE_MOCK=true`：前端走 `src/mocks/` 模拟数据（通过 AxiosAdapter 拦截）
- `VITE_USE_MOCK=false`：前端走真实后端 API

Vite proxy 配置（`vite.config.ts`）：

- `/api` → `http://localhost:3000`
- `/uploads` → `http://localhost:3000`

### 后端环境

`apps/api/.env` 当前开发配置：

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=file:./dev.db
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

说明：

- 当前本地开发默认使用 `SQLite`
- 根目录 `docker-compose.yml` 提供了 `PostgreSQL` 容器，供后续生产化或切库使用

## 6. 启动方式

### 启动前端

```bash
cd e:\Learning\Projects\self_photograph
npm run dev
```

默认访问：

- 站点：`http://localhost:5173`
- 后台登录：`http://localhost:5173/admin/login`

### 启动后端

```bash
cd e:\Learning\Projects\self_photograph\apps\api
npm run start:dev
```

默认访问：

- API：`http://localhost:3000/api/v1`
- 健康检查：`http://localhost:3000/health`

### 数据库初始化

```bash
cd e:\Learning\Projects\self_photograph\apps\api
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

默认管理员：

- 邮箱：`admin@xoice.com`
- 密码：`admin123`

## 7. 前端关键约束

### 视觉与动画

- 不要轻易破坏 `GSAP` 动画结构
- 不要轻易移除 `Lenis` 平滑滚动链路
- `GallerySection` 的横向滚动是高风险区域，改动前必须理解 `useGSAP + ScrollTrigger`
- 异步数据渲染完成后，若影响布局，必须考虑 `ScrollTrigger.refresh()`

### 数据层

- 公开页面优先走 `src/hooks/` 中的 Query Hooks
- API 访问统一通过 `src/api/`
- 类型定义统一放在 `src/types/api.ts`
- 若后端字段变更，必须同步更新前端类型与文档

### API 客户端

- `src/api/client.ts` 响应拦截器已解包为 `body.data`，API 函数直接返回领域对象
- 请求拦截器自动附加 `Authorization: Bearer <token>`
- 错误统一转为 `ApiError`（含 code + message）

### 后台

- 后台认证状态统一走 `src/contexts/AuthContext.tsx`
- 后台页面当前以 `apiClient` 直接请求为主，若要增强可逐步迁移到 Query
- 图片选择和上传统一复用：
  - `ImageUploader`：上传入口（支持拖拽、点击、媒体库选择）
  - `ImageCropper`：Canvas 裁剪（1:1/4:3/16:9/自由）
  - `MediaBrowser`：媒体库浏览/搜索/删除

### Mock 模式

- `VITE_USE_MOCK=true` 时，`api/client.ts` 使用 `createMockAdapter()` 替代真实请求
- Mock 数据在 `src/mocks/` 中，按 URL 路径匹配返回
- 切换到真实 API 只需设 `VITE_USE_MOCK=false`

## 8. 后端关键约束

### 接口风格

- 统一前缀：`/api/v1`
- `health` 不走全局前缀
- 统一响应：`{ code, message, data }`
- 错误统一由 `ApiExceptionFilter` 输出

### 模块边界

后端模块保持如下分工：

- `auth`：登录与当前用户
- `site`：站点配置
- `gallery`：作品与分类
- `videos`：视频内容
- `workshops`：研学活动
- `leads`：联系与报名线索
- `media`：媒体上传与管理
- `health`：健康检查

### 数据库

- 当前 Prisma `datasource` 是 `sqlite`
- 迁移文件已存在，不要随意删除历史 migration
- 修改 schema 前先确认是否要兼容现有 seed 与管理端表单

### DTO 校验

- `gallery/dto/gallery.dto.ts`：CreateWorkDto, UpdateWorkDto
- `videos/dto/videos.dto.ts`：CreateVideoDto, UpdateVideoDto
- `workshops/dto/workshops.dto.ts`：CreateWorkshopDto, UpdateWorkshopDto
- Admin 控制器已使用 DTO 替代 `any`

### 文件上传

- Multer 磁盘存储，10MB 限制，仅允许图片
- 静态文件服务：`/uploads/*`
- 上传时不要手动设置 `Content-Type: multipart/form-data`，让 Axios 自动处理

## 9. 当前已知限制

- 画廊下拉分类菜单仍是静态展示，尚未真正接分类筛选
- 后台作品/视频/研学表单仍偏 MVP，字段不算完整
- 线索管理已有后端接口，但前端未做独立管理页
- 媒体删除当前删除数据库记录，未删除磁盘源文件
- `KenyaExpedition.tsx` 仍保留为旧页面兼容入口，长期应被通用详情页替代
- 公开接口已检查 `isPublished`，但后台列表仍可能暴露未发布内容的 slug

## 10. 推荐后续优先级

建议后续按下面顺序继续构建：

1. 完善后台表单字段与校验
2. 接通真实分类与标签管理
3. 增加线索管理页面
4. 将媒体存储切换到云端
5. 做 SEO 增强：动态 meta、sitemap、robots
6. 做测试体系：Vitest + Playwright
7. 做部署脚本与 CI/CD

## 11. 文档维护规则

每次对业务、接口、结构做了实质修改时，至少同步检查这些文档：

- `README.md`
- `工作.md`
- `docs/04-API接口文档.md`
- `docs/06-推进记录.md`

涉及系统级变化时，同时更新：

- `AGENTS.md`
- `docs/01-项目规划.md`
- `docs/02-前端文档.md`
- `docs/03-后端文档.md`
- `docs/05-实施计划.md`

## 12. 新会话接手顺序

任何新会话进入本项目，建议按如下顺序理解项目：

1. 先读 `工作.md`
2. 再读 `AGENTS.md`
3. 再读 `README.md`
4. 再看 `src/App.tsx`、`src/api/client.ts`、`apps/api/src/main.ts`
5. 最后根据任务再钻取具体模块

## 13. 强制性预检规则

任何 AI 模型或协作者在每次执行任务之前，**必须**先完成以下预检步骤：

### 13.1 预检文档清单

按以下顺序阅读，不可跳过：

1. **`工作.md`** — 了解当前项目状态、已完成工作、已知问题、注意事项
2. **`AGENTS.md`** — 理解项目结构、技术约束、操作纪律
3. **与当前任务直接相关的文档**（从 `docs/` 中选择）

### 13.2 例外情况

以下情况可跳过预检：

- 纯对话/纯咨询类问题，不涉及代码修改
- 用户明确要求"不要看文档，直接做 X"

### 13.3 违规后果

- 若因未预检导致回退、重做、破坏已有功能，必须回滚变更并重新预检

## 14. 工作记录规则

每次完成实质性工作后，**必须**在 `工作.md` 中追加记录。

### 14.1 必须记录的内容

每条记录应包含：

- **本次完成内容**：做了什么（新增、修改、删除）
- **变更的文件清单**：按 `新建文件` 和 `修改文件` 分类列出
- **遇到的问题与解决方案**：如果有
- **验证结果**：构建是否通过、功能是否可运行
- **需要下一个人注意的事项**：如果有

### 14.2 记录格式

使用 `工作.md` 中已有的 markdown 格式，在文件末尾追加新的记录块：

```markdown
### YYYY-MM-DD — 本次工作标题

**完成内容：**
- ...

**文件变更：**
- 新建：...
- 修改：...

**验证结果：**
- [x] ...
```

### 14.3 记录时机

- 每次提交 PR 或变更集之前
- 每次会话结束时

## 15. 最重要的原则

- 以当前代码为准，不以旧规划为准
- 以可运行性为准，不以理想结构为准
- 以不破坏现有视觉体验为优先
- 以接口、类型、文档同步为基本纪律
