# AGENTS.md

## 项目概述

`self_photograph` - 个人摄影展示站，前后端分离，单仓全栈，单管理员后台。

## 技术栈

| 层次 | 技术 |
|------|------|
| 前端 | Vite (rolldown-vite) + React 19 + TypeScript + MUI 7 + GSAP + Lenis + R3F |
| 数据层 | Axios + TanStack Query + React Hook Form + Zod |
| 后端 | NestJS + Prisma + JWT + bcryptjs + Multer |
| 数据库 | 开发 SQLite，生产 PostgreSQL |
| 媒体存储 | 本地 `uploads/`，后续切云存储 |

## 常用命令

**前端（根目录）：**
```bash
npm run dev          # -> http://localhost:5173
npm run build        # tsc -b && vite build
npm run lint         # eslint .
```

**后端（`apps/api/`）：**
```bash
npm run start:dev    # -> http://localhost:3000
npm run build        # nest build
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed  # admin@xoice.com / admin123
```

## ⚠️ 常见陷阱

- **GSAP/Lenis 是高危区域**：不要移除 Lenis 或破坏 ScrollTrigger。GallerySection 横向滚动的 `useGSAP` 依赖 `[works]`，异步数据加载后需 `ScrollTrigger.refresh()`
- **API 客户端已解包**：`src/api/client.ts` 响应拦截器返回 `body.data`（领域对象），不是 AxiosResponse。不要加 `.data`
- **图片上传不要手动设 Content-Type**：让 Axios 自动处理 `multipart/form-data`，手动设会导致上传失败
- **SQLite 不支持 `mode: "insensitive"`**：不要删除迁移历史
- **后端全局 Pipe/Interceptor/Filter 通过 DI 注册**：在 `app.module.ts` 用 `APP_PIPE`/`APP_INTERCEPTOR`/`APP_FILTER`/`APP_GUARD`，不要在 `main.ts` 中 `new`
- **后端所有 Admin 接口必须用 DTO**：gallery / videos / workshops / leads 均有 class-validator DTO，不要回退到 `any`
- **主色调是 `#E0A458` 暖琥珀色**：在 `src/theme/index.ts` 定义。不要回退到荧光绿 `#CCFF00`
- **类型定义统一在 `src/types/api.ts`**：后端字段变更必须同步更新前端类型
- **图片上传组件链路**：`ImageUploader` -> `ImageCropper` -> `MediaBrowser`，不要跳过或另建
- **Mock 模式**：`VITE_USE_MOCK=true` 用 `src/mocks/` AxiosAdapter，按 URL 路径匹配返回
- **P2025 已统一处理**：gallery/videos/workshops/leads 的 update/delete 包了 P2025 -> NotFoundException，新模块照此模式
- **workshops 子资源有 IDOR 防护**：子资源 CRUD 校验 workshopId 归属
- **`KenyaExpedition.tsx` 是旧兼容入口**：不要删除，用通用详情页替代是后续计划

## 后端约定

- 统一前缀 `/api/v1`（health 除外）
- 统一响应 `{ code: 0, message: "ok", data }`；错误由 `ApiExceptionFilter` 输出 `{ code, message, data: null }`
- JWT 策略校验用户存在且活跃
- 报名重复检查（同 workshopId + phone 不可重复）
- Multer：磁盘存储，10MB 限制，仅允许图片
- 媒体上传用 partial read 解析宽高，不读全文件

## 文档职责

| 文档 | 记录什么 | 何时更新 |
|------|----------|----------|
| `AGENTS.md` | 项目规则、约束、陷阱 | 系统级变化 |
| `README.md` | 项目总览、启动、后续建议 | 能力变化 |
| `工作.md` | 每次实质工作的操作日志 | **每次完成工作后必须追加** |
| `问题.md` | 代码审查问题清单 | 发现问题追加，修复后打 `[x]` |
| `docs/01-04` | 规划/前端/后端/接口详细文档 | 对应领域实质变化时 |

**不要创建独立日期文件**（如 `2026-7-18日优化.md`），所有内容写入上述文档。

### 工作.md 记录格式

```markdown
### YYYY-MM-DD - 标题

**完成内容：**
- ...

**文件变更：**
- 新建：...
- 修改：...

**验证结果：**
- [x] ...
```

## 接手顺序

1. 读 `工作.md` - 最新工作状态
2. 读 `AGENTS.md` - 本文件
3. 读 `README.md` - 项目全貌
4. 看 `src/App.tsx`、`src/api/client.ts`、`apps/api/src/main.ts`、`apps/api/src/app.module.ts`
5. 按任务钻取具体模块

纯 Q&A 可跳过。涉及代码修改必须预检，未预检导致回退或破坏已有功能必须回滚并重新预检。

## 红线

- 以当前代码为准，不以旧规划为准
- 以可运行性为准，不以理想结构为准
- 以不破坏现有视觉体验为优先
- 接口、类型、文档必须同步
