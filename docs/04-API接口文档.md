# API 接口文档

## 1. 说明

本文档描述当前代码已实现的接口，而不是早期设计稿。

### 基础约定

- Base URL：`/api/v1`
- 鉴权：后台接口使用 `Authorization: Bearer <token>`
- 健康检查接口除外：`/health`
- 响应格式统一为：

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

### 分页结构

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "pageSize": 12,
      "total": 0,
      "totalPages": 0
    }
  }
}
```

## 2. 公开接口

### 健康检查

`GET /health`

说明：

- 用于服务存活检测
- 不走 `/api/v1` 前缀

### 获取站点配置

`GET /api/v1/site/config`

响应示例：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "brandName": "XOICE",
    "heroTitle": "XOICE PHOTOGRAPH",
    "heroSubtitle": "Capturing the soul of the county & stars.",
    "bioTitle": "关于 Xoice",
    "bioContent": "我是一名摄影师，专注于捕捉城市与星空的交汇点。",
    "contact": {
      "phone": "18470532623",
      "email": "lionlyx@163.com",
      "wechat": "StephenLeeYee",
      "location": "中国"
    },
    "socialLinks": {
      "bilibili": "https://space.bilibili.com/xxxxxx"
    },
    "footerText": "Designed for XOICE"
  }
}
```

### 获取画廊分类

`GET /api/v1/gallery/categories`

查询参数：

- `visibleOnly`：可选，默认 `true`

响应示例：

```json
{
  "code": 0,
  "message": "ok",
  "data": [
    {
      "id": "uuid",
      "name": "人像",
      "slug": "portrait",
      "children": [
        {
          "id": "uuid",
          "name": "私房",
          "slug": "private"
        }
      ]
    }
  ]
}
```

### 获取作品列表

`GET /api/v1/gallery/works`

查询参数：

- `page`
- `pageSize`
- `category`
- `tag`
- `featured`
- `keyword`
- `sortBy`
- `sortOrder`

说明：

- 公开接口只返回 `isPublished=true` 的作品

响应示例：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "寂静的山脊",
        "slug": "silent-ridge",
        "summary": "精选风景作品",
        "coverImage": "https://picsum.photos/seed/mountains/600/900.jpg",
        "category": {
          "name": "风景",
          "slug": "landscape"
        },
        "tags": [],
        "isFeatured": true,
        "publishedAt": "2026-06-14T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 12,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### 获取作品详情

`GET /api/v1/gallery/works/:slug`

响应示例：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": "uuid",
    "title": "寂静的山脊",
    "slug": "silent-ridge",
    "summary": "精选风景作品",
    "description": null,
    "coverImage": "https://picsum.photos/seed/mountains/600/900.jpg",
    "images": [
      "https://picsum.photos/seed/mountains/600/900.jpg"
    ],
    "category": {
      "name": "风景",
      "slug": "landscape"
    },
    "tags": [],
    "location": null,
    "shootDate": null,
    "cameraInfo": null
  }
}
```

### 获取视频列表

`GET /api/v1/videos`

查询参数：

- `page`
- `pageSize`
- `category`
- `publishedOnly`

说明：

- 默认只返回已发布视频
- 后台列表会传 `publishedOnly=false`

响应示例：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "摄影基础入门",
        "slug": "photo-basic",
        "description": "从零开始学习摄影基础知识",
        "platform": "bilibili",
        "videoUrl": "https://www.bilibili.com/video/BV1xx411c7mD",
        "coverImage": "https://via.placeholder.com/400x225/1a1a1a/ffffff?text=摄影基础入门",
        "durationSeconds": 930,
        "durationText": "15:30",
        "category": "教学视频",
        "publishedAt": "2026-06-14T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 12,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### 获取研学列表

`GET /api/v1/workshops`

查询参数：

- `page`
- `pageSize`
- `featured`
- `status`
- `keyword`

说明：

- 公开接口只返回 `isPublished=true` 的活动
- 当前 `tags` 字段已返回，但默认是空数组

响应示例：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "肯尼亚\"野生动物行为\"摄影远征团",
        "slug": "kenya-wildlife-expedition",
        "subtitle": "Kenya Wildlife Expedition",
        "summary": "深入马赛马拉国家保护区",
        "coverImage": "https://picsum.photos/seed/kenya/600/900.jpg",
        "priceText": "¥36,800/人",
        "location": "马赛马拉国家保护区",
        "startDate": null,
        "endDate": null,
        "capacity": 8,
        "enrolledCount": 3,
        "level": "高级",
        "durationText": "11天",
        "status": "registration_open",
        "isFeatured": true,
        "tags": []
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### 获取研学详情

`GET /api/v1/workshops/:slug`

响应示例：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": "uuid",
    "title": "肯尼亚\"野生动物行为\"摄影远征团",
    "slug": "kenya-wildlife-expedition",
    "subtitle": "Kenya Wildlife Expedition",
    "summary": "深入马赛马拉国家保护区",
    "content": null,
    "coverImage": "https://picsum.photos/seed/kenya/600/900.jpg",
    "priceText": "¥36,800/人",
    "location": "马赛马拉国家保护区",
    "startDate": null,
    "endDate": null,
    "capacity": 8,
    "enrolledCount": 3,
    "level": "高级",
    "durationText": "11天",
    "status": "registration_open",
    "isFeatured": true,
    "tags": [],
    "highlights": [
      {
        "title": "独家拍摄角度",
        "content": "深入马赛马拉核心区域"
      }
    ],
    "itinerary": [
      {
        "dayIndex": 1,
        "title": "第1天：抵达内罗毕",
        "content": "抵达后入住酒店"
      }
    ],
    "feeIncludes": ["全程住宿"],
    "feeExcludes": ["国际机票"],
    "contact": {
      "phone": "18470532623",
      "email": "lionlyx@163.com",
      "wechat": "StephenLeeYee",
      "location": "马赛马拉国家保护区"
    }
  }
}
```

### 提交联系表单

`POST /api/v1/leads/contact`

请求体：

```json
{
  "name": "张三",
  "email": "zhangsan@example.com",
  "message": "我想咨询合作拍摄",
  "sourcePage": "/"
}
```

响应示例：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": "lead_uuid"
  }
}
```

### 提交研学报名

`POST /api/v1/leads/workshop-enrollments`

请求体：

```json
{
  "workshopSlug": "kenya-wildlife-expedition",
  "name": "李四",
  "phone": "13800000000",
  "wechat": "lisi-photo",
  "email": "lisi@example.com",
  "message": "想咨询器材要求"
}
```

成功响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": "enrollment_uuid"
  }
}
```

满员时会返回错误。

## 3. 后台接口

## 登录

### 管理员登录

`POST /api/v1/admin/auth/login`

请求体：

```json
{
  "email": "admin@xoice.com",
  "password": "admin123"
}
```

响应示例：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "accessToken": "jwt_token",
    "user": {
      "id": "uuid",
      "email": "admin@xoice.com",
      "name": "Xoice",
      "role": "admin"
    }
  }
}
```

### 获取当前用户

`GET /api/v1/admin/auth/me`

## 站点配置

### 获取站点配置

`GET /api/v1/admin/site/config`

### 更新站点配置

`PUT /api/v1/admin/site/config`

请求体字段支持：

- `brandName`
- `heroTitle`
- `heroSubtitle`
- `bioTitle`
- `bioContent`
- `contactPhone`
- `contactEmail`
- `contactWechat`
- `locationText`
- `bilibiliUrl`
- `footerText`

## 作品管理

### 获取作品列表

`GET /api/v1/admin/gallery/works`

查询参数：

- `page`
- `pageSize`

### 创建作品

`POST /api/v1/admin/gallery/works`

常用字段：

- `title`
- `slug`
- `summary`
- `coverImage`
- `isFeatured`
- `isPublished`
- `categoryId`

### 更新作品

`PATCH /api/v1/admin/gallery/works/:id`

### 删除作品

`DELETE /api/v1/admin/gallery/works/:id`

## 分类管理

### 获取全部分类

`GET /api/v1/admin/gallery/categories`

说明：

- 返回全部分类，含 `isVisible=false` 的不可见分类
- 公开接口 `GET /api/v1/gallery/categories` 默认仅返回可见分类

### 创建分类

`POST /api/v1/admin/gallery/categories`

请求体：

```json
{
  "name": "人像",
  "slug": "portrait",
  "parentId": "uuid",
  "sortOrder": 0,
  "isVisible": true
}
```

字段说明：

- `name`：必填，分类名称
- `slug`：必填，URL 标识
- `parentId`：可选，父分类 ID，用于构建层级
- `sortOrder`：可选，排序权重，默认 0
- `isVisible`：可选，是否在公开站点可见，默认 `true`

### 更新分类

`PATCH /api/v1/admin/gallery/categories/:id`

请求体支持 `name`、`slug`、`parentId`、`sortOrder`、`isVisible` 等字段的部分更新。

### 删除分类

`DELETE /api/v1/admin/gallery/categories/:id`

说明：

- 当分类下存在关联作品或子分类时返回 `409 Conflict`，需先解除关联再删除

## 视频管理

### 获取视频列表

`GET /api/v1/admin/videos`

### 创建视频

`POST /api/v1/admin/videos`

常用字段：

- `title`
- `slug`
- `description`
- `videoUrl`
- `coverImage`
- `category`
- `durationSeconds`
- `platform`
- `isPublished`

### 更新视频

`PATCH /api/v1/admin/videos/:id`

### 删除视频

`DELETE /api/v1/admin/videos/:id`

## 研学管理

### 获取活动列表

`GET /api/v1/admin/workshops`

### 创建活动

`POST /api/v1/admin/workshops`

常用字段：

- `title`
- `slug`
- `subtitle`
- `summary`
- `coverImage`
- `priceText`
- `location`
- `level`
- `durationText`
- `status`
- `capacity`
- `enrolledCount`
- `isFeatured`
- `isPublished`

### 更新活动

`PATCH /api/v1/admin/workshops/:id`

### 删除活动

`DELETE /api/v1/admin/workshops/:id`

## 线索管理

### 获取联系线索

`GET /api/v1/admin/leads/contact`

查询参数：

- `page`
- `pageSize`
- `status`
- `keyword`

### 更新联系线索状态

`PATCH /api/v1/admin/leads/contact/:id/status`

请求体：

```json
{
  "status": "contacted"
}
```

### 获取报名记录

`GET /api/v1/admin/leads/workshop-enrollments`

查询参数：

- `page`
- `pageSize`

### 更新报名状态

`PATCH /api/v1/admin/leads/workshop-enrollments/:id/status`

请求体：

```json
{
  "status": "contacted"
}
```

说明：

- 用于标记报名记录的处理进度（如 `pending`、`contacted`、`confirmed`、`cancelled`）

## 媒体管理

### 上传媒体

`POST /api/v1/admin/media/upload`

请求类型：

- `multipart/form-data`
- 字段名：`file`

限制：

- 仅支持图片
- 最大 10MB

响应示例：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": "media_uuid",
    "url": "/uploads/1781427729851-369158021.jpg",
    "fileName": "cover.jpg",
    "width": null,
    "height": null,
    "sizeBytes": 123456
  }
}
```

### 获取媒体列表

`GET /api/v1/admin/media`

查询参数：

- `page`
- `pageSize`
- `type`

### 重命名媒体

`PATCH /api/v1/admin/media/:id`

请求体：

```json
{
  "fileName": "new-name.jpg"
}
```

说明：

- 用于修改媒体文件的展示名称，不影响物理文件路径

### 删除媒体

`DELETE /api/v1/admin/media/:id`

## 4. 常见错误

- `401`：未登录或 token 无效
- `404`：资源不存在
- `409`：`slug` 冲突，或分类删除时存在关联作品 / 子分类
- `400`：参数错误或业务状态不允许

## 5. 安全特性

后端在全局层面内置以下安全机制，所有后台接口默认受其保护：

- **JWT 策略校验用户存在且活跃**：解析 token 后会再次查询数据库，确认用户仍然存在且 `isActive=true`，否则返回 `401`
- **IDOR 防护**：workshops 子资源 CRUD 校验 `workshopId` 归属，防止越权访问他人资源
- **报名重复检查**：同一手机号 + 同一研学不可重复报名，重复提交返回 `409`
- **P2025 错误自动转 404**：Prisma 的 `P2025`（记录不存在）错误在 gallery / videos / workshops / leads 模块自动转换为 `404 NotFoundException`
- **Throttler 限流**：全局限流 100 req/min，超过返回 `429 Too Many Requests`
- **Helmet 安全头**：通过 Helmet 中间件自动设置 `X-Content-Type-Options`、`X-Frame-Options`、`Strict-Transport-Security` 等安全响应头
- **ValidationPipe forbidNonWhitelisted**：全局 `ValidationPipe` 开启 `forbidNonWhitelisted`，请求体中出现未声明的字段直接返回 `400`

## 6. 当前前端重点依赖接口

前端当前核心依赖这些接口：

### 公开页面

1. `GET /api/v1/site/config`
2. `GET /api/v1/gallery/categories`
3. `GET /api/v1/gallery/works`
4. `GET /api/v1/gallery/works/:slug`
5. `GET /api/v1/videos`
6. `GET /api/v1/workshops`
7. `GET /api/v1/workshops/:slug`
8. `POST /api/v1/leads/contact`
9. `POST /api/v1/leads/workshop-enrollments`

### 后台

10. `POST /api/v1/admin/auth/login`
11. `GET /api/v1/admin/auth/me`
12. `GET /api/v1/admin/gallery/works`
13. `POST /api/v1/admin/gallery/works`
14. `PATCH /api/v1/admin/gallery/works/:id`
15. `DELETE /api/v1/admin/gallery/works/:id`
16. `GET /api/v1/admin/gallery/categories`
17. `POST /api/v1/admin/gallery/categories`
18. `PATCH /api/v1/admin/gallery/categories/:id`
19. `DELETE /api/v1/admin/gallery/categories/:id`
20. `GET /api/v1/admin/videos`
21. `POST /api/v1/admin/videos`
22. `PATCH /api/v1/admin/videos/:id`
23. `DELETE /api/v1/admin/videos/:id`
24. `GET /api/v1/admin/workshops`
25. `POST /api/v1/admin/workshops`
26. `PATCH /api/v1/admin/workshops/:id`
27. `DELETE /api/v1/admin/workshops/:id`
28. `GET /api/v1/admin/leads/contact`
29. `PATCH /api/v1/admin/leads/contact/:id/status`
30. `GET /api/v1/admin/leads/workshop-enrollments`
31. `PATCH /api/v1/admin/leads/workshop-enrollments/:id/status`
32. `GET /api/v1/admin/media`
33. `POST /api/v1/admin/media/upload`
34. `PATCH /api/v1/admin/media/:id`
35. `DELETE /api/v1/admin/media/:id`
