# AGENTS.md

## 1. 文件目标

本文件用于指导任何新会话、协作者或自动化代理，快速接手并持续构建当前项目。

以当前代码为准，不以旧规划为准。

## 2. 项目定义

项目名：`self_photograph` — 高视觉表现的个人摄影展示站，前后端分离，单一管理员后台。

技术栈：
- 前端：`Vite (rolldown-vite) + React 19 + TypeScript + MUI 7 + GSAP + Lenis + React Three Fiber`
- 数据层：`Axios + TanStack Query + React Hook Form + Zod`
- 后端：`NestJS + Prisma + JWT + bcryptjs + Multer`
- 数据库：开发 `SQLite`，生产建议 `PostgreSQL`
- 媒体存储：本地 `uploads/`，后续可切云存储

## 3. 仓库结构

```
self_photograph/
├─ src/                  # 前端站点与后台前端
│  ├─ api/               # 8 个 API 模块
│  ├─ components/        # UI / layout / three 组件
│  ├─ contexts/          # AuthContext
│  ├─ hooks/             # TanStack Query hooks
│  ├─ mocks/             # Mock 数据 + AxiosAdapter
│  ├─ pages/             # Home / Gallery / Workshops / Admin
│  ├─ theme/             # MUI 主题（主色 #E0A458 暖琥珀）
│  ├─ types/             # api.ts 类型定义
│  └─ utils/             # lenis / navigation / imageCompress / error
├─ apps/api/             # NestJS 后端
│  ├─ prisma/            # schema + seed + migrations + dev.db
│  ├─ src/
│  │  ├─ common/         # interceptors / filters / guards / decorators
│  │  └─ modules/        # auth / site / gallery / videos / workshops / leads / media / health
│  └─ uploads/           # 本地上传文件存储
├─ docs/                 # 项目文档
├─ AGENTS.md             # 本文件
├─ README.md             # 项目说明
├─ 工作.md                # 工作日志
├─ 问题.md                # 代码审查与问题追踪
└─ docker-compose.yml    # PostgreSQL 开发容器
```

## 4. 启动命令

**前端（根目录）：**
```bash
npm run dev          # Vite dev server -> http://localhost:5173
npm run build        # tsc -b && vite build
npm run lint         # eslint .
```

**后端（`apps/api/`）：**
```bash
npm run start:dev    # NestJS watch mode -> http://localhost:3000
npm run build        # nest build
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed  # Default admin: admin@xoice.com / admin123
```

## 5. 环境配置

根目录 `.env`：
- `VITE_USE_MOCK=false` 走真实后端，`true` 走 `src/mocks/` 模拟数据
- Vite 代理 `/api` 和 `/uploads` 到 `localhost:3000`

`apps/api/.env`：SQLite（`file:./dev.db`）、JWT Secret、CORS。

## 6. 已完成能力概览

**公开站点**：首页六区块（Hero/Bio/Gallery/Video/PhotographyStudy/Contact）、画廊列表页（分类筛选接通 API）、作品详情页、研学详情页

**后台**：登录、Dashboard、作品/视频/研学/分类/线索/媒体/站点配置管理

**后端**：8 模块、统一响应格式、DI 注册全局 Pipe/Interceptor/Filter/Guard、JWT 认证（校验用户存在且活跃）、DTO 全模块校验、P2025 自动转 404、子资源 IDOR 防护、报名重复检查、媒体上传（partial read 解析宽高）

**代码审查**：`问题.md` 记录的 56 项全栈深度审查已全部完成

## 7. 前端关键约束

- **GSAP/Lenis**：GallerySection 横向滚动是高风险区域。不要移除 Lenis 或破坏 ScrollTrigger。异步数据加载后需 `ScrollTrigger.refresh()`
- **API 客户端**：`src/api/client.ts` 响应拦截器解包 `body.data`，API 函数直接返回领域对象，不是 AxiosResponse
- **类型定义**：统一放 `src/types/api.ts`，后端字段变更必须同步更新
- **图片上传**：复用 `ImageUploader` -> `ImageCropper` -> `MediaBrowser`，不要手动设 `Content-Type: multipart/form-data`
- **Mock 模式**：`VITE_USE_MOCK=true` 时用 `src/mocks/` AxiosAdapter，按 URL 路径匹配返回
- **主色调**：`#E0A458` 暖琥珀色，在 `src/theme/index.ts` 中定义。不要回退到荧光绿

## 8. 后端关键约束

- **统一前缀**：`/api/v1`（health 除外）
- **统一响应**：`{ code: 0, message: "ok", data }`；错误 `{ code, message, data: null }` 由 `ApiExceptionFilter` 输出
- **DI 注册**：ValidationPipe / ResponseTransformer / ApiExceptionFilter / ThrottlerGuard 均通过 `APP_PIPE` / `APP_INTERCEPTOR` / `APP_FILTER` / `APP_GUARD` 在 `app.module.ts` 中注册，不要在 `main.ts` 中 `new`
- **DTO 校验**：gallery / videos / workshops / leads 均有 class-validator DTO，不要回退到 `any`
- **SQLite 限制**：不支持 `mode: "insensitive"`，不要删除迁移历史
- **Multer**：磁盘存储，10MB 限制，仅允许图片
- **P2025 处理**：gallery / videos / workshops / leads 的 update/delete 已包 P2025 -> NotFoundException
- **IDOR 防护**：workshops 子资源 CRUD 校验 workshopId 归属

## 9. 已知限制

- `KenyaExpedition.tsx` 仍保留为旧页面兼容入口
- ThrottlerModule 使用内存存储，多实例部署应在反向代理层限流
- 本地上传适合开发，生产应切换云存储

## 10. 文档职责与更新规则

项目维护以下文档，每个文档有明确职责，**不要创建独立日期文件**（如 `2026-7-18日优化.md`）。

### 各文档职责

| 文档 | 职责 | 何时更新 |
|------|------|----------|
| `AGENTS.md` | 项目结构、技术约束、工作方式、文档规则 | 系统级变化（模块新增、约束变更、工作流调整） |
| `README.md` | 面向外部/新人的项目总览、技术栈、启动方式、后续建议 | 能力变化、后续计划调整、已知限制变化 |
| `工作.md` | 每次实质工作的操作日志（完成内容、文件变更、验证结果） | **每次完成实质工作后必须追加** |
| `问题.md` | 代码审查发现、问题清单、修复状态 | 发现新问题时追加，修复后打 `[x]` |
| `docs/01-06` | 详细规划/前端/后端/接口/实施/推进文档 | 对应领域发生实质变化时同步 |

### 工作记录规则

每次完成实质性工作后，**必须**在 `工作.md` 末尾追加记录，格式：

```markdown
### YYYY-MM-DD - 本次工作标题

**完成内容：**
- ...

**文件变更：**
- 新建：...
- 修改：...

**验证结果：**
- [x] ...
```

### 问题追踪规则

- 所有代码审查发现和问题统一写入 `问题.md`
- 用 `- [ ]` 标记未完成，`- [x]` 标记已完成
- 按严重度分级：CRITICAL / HIGH / MEDIUM / LOW
- 修复后立即打勾，不要删除问题记录

## 11. 新会话接手顺序

1. 先读 `工作.md` — 了解最新工作状态
2. 再读 `AGENTS.md` — 理解项目约束与工作方式
3. 再读 `README.md` — 了解项目全貌
4. 看 `src/App.tsx`、`src/api/client.ts`、`apps/api/src/main.ts`
5. 根据任务钻取具体模块

纯 Q&A 可跳过预检。涉及代码修改必须预检，因未预检导致回退或破坏已有功能必须回滚并重新预检。

## 12. 最重要的原则

- 以当前代码为准，不以旧规划为准
- 以可运行性为准，不以理想结构为准
- 以不破坏现有视觉体验为优先
- 以接口、类型、文档同步为基本纪律
