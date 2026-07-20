# XOICE / self_photograph

一个高视觉表现的个人摄影展示站，前后端分离，单仓全栈。

## 项目现状

项目已完成全栈开发并通过 56 项深度代码审查修复，覆盖安全、健壮性、性能与代码质量。

### 公开站点

- 首页六大区块：`Hero`、`Bio`、`Gallery`、`Video`、`PhotographyStudy`、`Contact`
- 画廊列表页：`/gallery`（分类筛选已接通真实 API）
- 作品详情页：`/gallery/:slug`
- 研学详情页：`/workshops/:slug`
- 兼容旧链接：`/photographystudy/kenya-expedition`

### 管理后台

- 管理员登录（JWT 认证，停用用户不可登录）
- 作品管理（CRUD + 封面图上传 + 缩略图/拍摄信息字段）
- 视频管理（CRUD + publishedAt 自动管理）
- 研学管理（CRUD + 子资源 debounce 编辑）
- 线索管理（联系人/报名线索列表 + 状态管理 + 搜索）
- 媒体库管理（上传 / 浏览 / 搜索 / 删除，删除同步清理磁盘文件）
- 站点配置（品牌/关于/联系方式/社交链接）
- Dashboard（Promise.allSettled 部分失败容错）

### 后端

- 统一响应格式 `{ code, message, data }`，DI 注册全局 Interceptor/Filter/Pipe
- 统一异常处理 `ApiExceptionFilter`（含错误日志）
- P2025 错误自动转 404（gallery / videos / workshops / leads）
- Workshop 子资源 CRUD 校验 workshopId 归属（IDOR 防护）
- JWT 策略校验用户存在且活跃
- 报名重复检查（同手机号 + 同研学不可重复）
- Admin DTO 全模块校验（class-validator + forbidNonWhitelisted）
- 媒体上传：Multer 磁盘存储 + 图片宽高解析（partial read，不读全文件）
- 健康检查、限流保护、Helmet 安全头
- Prisma 连接优雅关闭（enableShutdownHooks）

## 技术栈

### 前端

- `Vite (rolldown-vite)` + `React 19` + `TypeScript`
- `MUI 7` + `GSAP` + `Lenis` + `React Three Fiber`
- `Axios` + `TanStack Query` + `React Hook Form` + `Zod`

### 后端

- `NestJS` + `Prisma` + `JWT` + `bcryptjs` + `Multer`
- `Throttler` 限流 + `Helmet` 安全头

### 数据库与存储

- 开发数据库：`SQLite`
- 生产建议：`PostgreSQL`（docker-compose 已提供）
- 媒体存储：本地 `uploads/`，后续可切云存储

## 目录结构

```text
self_photograph/
├─ src/                      # 前端站点与后台页面
│  ├─ api/                   # 8 个 API 模块
│  ├─ components/            # UI / layout 组件
│  ├─ contexts/              # AuthContext
│  ├─ hooks/                 # TanStack Query hooks
│  ├─ mocks/                 # Mock 数据 + AxiosAdapter
│  ├─ pages/                 # Home / Gallery / Workshops / Admin
│  ├─ theme/                 # MUI 主题
│  ├─ types/                 # api.ts 类型定义
│  └─ utils/                 # lenis / navigation / imageCompress / error
├─ apps/
│  └─ api/                   # NestJS API
│     ├─ prisma/             # schema + seed + migrations + dev.db
│     ├─ src/
│     │  ├─ common/          # interceptors / filters / guards / decorators
│     │  └─ modules/         # auth / site / gallery / videos / workshops / leads / media / health
│     └─ uploads/            # 本地上传文件存储
├─ docs/                     # 项目文档
├─ AGENTS.md                 # 接手与构建规则
├─ 工作.md                    # 最新推进记录
├─ 问题.md                    # 代码审查与问题追踪
├─ docker-compose.yml        # PostgreSQL 开发容器
└─ package.json
```

## 本地开发

### 1. 安装依赖

```bash
# 前端
npm install

# 后端
cd apps/api && npm install
```

### 2. 初始化数据库

```bash
cd apps/api
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

默认管理员：`admin@xoice.com` / `admin123`

### 3. 启动后端

```bash
cd apps/api
npm run start:dev
```

- API：`http://localhost:3000/api/v1`
- 健康检查：`http://localhost:3000/health`

### 4. 启动前端

```bash
npm run dev
```

- 站点：`http://localhost:5173`
- 后台登录：`http://localhost:5173/admin/login`

Vite 代理 `/api` 和 `/uploads` 到 `localhost:3000`。

## 环境变量

### 根目录 `.env`

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_UPLOAD_BASE_URL=https://cdn.example.com
VITE_BILIBILI_SPACE_URL=https://space.bilibili.com/xxxxxx
VITE_USE_MOCK=false
```

`VITE_USE_MOCK=true` 时使用 `src/mocks/` 模拟数据。

### `apps/api/.env`

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=file:./dev.db
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

## 构建

```bash
# 前端
npm run build      # tsc -b && vite build

# 后端
cd apps/api && npm run build

# 前端 lint
npm run lint
```

## 关键模块

### 前端

| 文件 | 作用 |
|------|------|
| `src/App.tsx` | 路由、懒加载、全局布局 |
| `src/api/client.ts` | Axios 客户端 + 拦截器 + Mock 切换 |
| `src/types/api.ts` | 全部业务类型定义 |
| `src/hooks/` | TanStack Query 数据获取 hooks |
| `src/contexts/AuthContext.tsx` | 后台登录态 |
| `src/components/ui/ImageUploader.tsx` | 上传入口（拖拽/点击/媒体库） |
| `src/components/ui/ImageCropper.tsx` | Canvas 裁剪 |
| `src/components/ui/MediaBrowser.tsx` | 媒体库浏览/搜索/删除 |
| `src/components/ui/ResponsiveImage.tsx` | 响应式图片组件 |
| `src/components/ScrollToTop.tsx` | 路由滚动恢复 |

### 后端

| 文件 | 作用 |
|------|------|
| `apps/api/src/main.ts` | bootstrap、CORS、Helmet、静态资源 |
| `apps/api/src/app.module.ts` | DI 注册 Pipe/Interceptor/Filter/Guard |
| `apps/api/prisma/schema.prisma` | 数据库模型 |
| `apps/api/src/modules/auth/` | 登录认证 + JWT 策略 |
| `apps/api/src/modules/gallery/` | 画廊内容（含 DTO） |
| `apps/api/src/modules/videos/` | 视频内容（含 DTO + publishedAt） |
| `apps/api/src/modules/workshops/` | 研学活动（含 DTO + 子资源所有权校验） |
| `apps/api/src/modules/leads/` | 联系与报名（含重复检查） |
| `apps/api/src/modules/media/` | 上传与媒体管理 |
| `apps/api/src/common/` | ResponseTransformer / ApiExceptionFilter / JwtAuthGuard |

## 开发约定

- **API 客户端**：`src/api/client.ts` 响应拦截器解包 `body.data`，API 函数直接返回领域对象
- **Mock 模式**：`VITE_USE_MOCK=true` 时通过 AxiosAdapter 拦截，mock 数据在 `src/mocks/`
- **图片上传**：不要手动设 `Content-Type: multipart/form-data`，让 Axios 处理
- **GSAP/Lenis**：GallerySection 横向滚动是高风险区域，异步数据加载后需 `ScrollTrigger.refresh()`
- **SQLite**：不支持 `mode: "insensitive"`，不要删除迁移历史
- **后端响应**：成功 `{ code: 0, message: "ok", data }`，错误 `{ code, message, data: null }`
- **Admin DTO**：使用 `class-validator`，不要回退到 `any`

## 代码审查

`问题.md` 记录了 56 项全栈深度审查发现，涵盖 CRITICAL / HIGH / MEDIUM / LOW 四级，已全部修复完成。

## 已知限制

- 旧页面 `KenyaExpedition.tsx` 仍保留兼容用途
- ThrottlerModule 使用内存存储，多实例部署应在反向代理层限流
- 本地上传适合开发，生产应切换云存储
- 线索管理前端已实现但功能可继续增强

## 后续建议

1. Gallery 列表页改为瀑布流布局（当前等高网格，未发挥不同比例作品的表现力）
2. 首页区块动画节奏差异化（当前各 Section 统一用 `y:50, opacity:0` 入场，缺乏起伏）
3. 真实分类与标签管理增强
4. 媒体存储切换到云端（Cloudinary / S3）
5. SEO 增强：动态 meta、sitemap、robots
6. 测试体系：Vitest + Playwright
7. 部署脚本与 CI/CD

## 文档入口

- `AGENTS.md`：构建规则与接手顺序
- `工作.md`：项目推进记录
- `问题.md`：代码审查与问题追踪
- `docs/01-项目规划.md` ~ `docs/04-API接口文档.md`
