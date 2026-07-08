# 当前 Supabase 数据库结构

本文档记录当前作品集项目正在使用的 Supabase 数据结构、字段语义、接口映射和维护规则。

## 数据库连接

后端通过 Supabase REST API 读取数据，前端不直接连接 Supabase，也不暴露任何 Supabase key。

运行时依赖的环境变量：

| 环境变量 | 用途 |
| --- | --- |
| `SUPABASE_URL` | Supabase 项目地址 |
| `SUPABASE_SECRET_KEY` | 后端服务密钥，优先使用 |
| `SUPABASE_SERVICE_ROLE_KEY` | 后端服务密钥，作为 `SUPABASE_SECRET_KEY` 的 fallback |
| `SUPABASE_PROJECTS_TABLE` | 可选，项目表名，默认 `projects` |
| `SUPABASE_EXPERIENCES_TABLE` | 可选，经历表名，默认 `experiences` |
| `SUPABASE_ASSETS_BUCKET` | 可选，项目图片所在 Storage bucket |

生产链路统一为：浏览器请求同源 `/api/*` 接口，服务端读取 Supabase，并把结果返回给前端。

Vercel 部署时：

```text
浏览器 -> Vercel Static dist
浏览器 -> Vercel /api Functions -> server/supabase-api.mjs -> Supabase
```

自托管 / 本地生产验证时：

```bash
npm run build
npm start
```

`npm start` 会启动 `portfolio/server/projects-api.mjs`，该服务同时处理 `/api/*` 和 `dist` 静态文件。Vercel Functions 和本地 Node server 共用 `portfolio/server/supabase-api.mjs` 中的 Supabase 查询逻辑。

## 表一：`public.projects`

项目归档表，服务于 `/api/projects` 和 `/api/project-archive`。

建表 SQL 维护在 `portfolio/docs/supabase-projects-schema.sql`。

### 字段结构

| 字段 | 类型 | 约束 / 默认值 | 前端含义 |
| --- | --- | --- | --- |
| `id` | `uuid` | 主键，默认 `gen_random_uuid()` | 项目内部 ID |
| `slug` | `text` | 唯一索引 `projects_slug_uidx` | 项目详情页稳定路由标识 |
| `category` | `text` | 非空，只允许 `Agent`、`VR`、`PC Game`、`Robot`、`Web` | 项目分类 |
| `year` | `text` | 可空 | 项目年份 |
| `title` | `text` | 非空 | 项目标题 |
| `description` | `text` | 非空，默认空字符串 | 项目描述 / 详情摘要 |
| `image` | `text` | 非空，默认空字符串 | 封面图路径或外部 URL |
| `detail_images` | `text[]` | 非空，默认空数组 | 详情页图片列表 |
| `embed_urls` | `text[]` | 非空，默认空数组 | 详情页 iframe 嵌入链接列表 |
| `tags` | `text[]` | 非空，默认空数组 | 项目标签 |
| `sort_order` | `integer` | 非空，默认 `0` | 排序，数字越小越靠前 |
| `created_at` | `timestamptz` | 非空，默认 `now()` | 创建时间 |

### 索引

| 索引 | 字段 | 用途 |
| --- | --- | --- |
| `projects_slug_uidx` | `slug` | 保证项目详情路由稳定唯一 |
| `projects_category_sort_idx` | `category, sort_order, title` | 支撑分类页排序查询 |

### API 映射

`/api/projects`：

```text
select: slug,id,category,title,description,image,tags,sort_order
filter: category = query.category
order: sort_order.asc,title.asc
```

`/api/project-archive`：

```text
select: slug,id,category,year,title,description,image,detail_images,embed_urls,tags,sort_order
filter: category = query.category
order: sort_order.asc,title.asc
```

后端会把 `image` 和 `detail_images` 通过 `toPublicAssetUrl()` 归一化为可访问资源地址。`embed_urls` 会直接映射为前端的 `embedUrls`，用于项目详情页 iframe 展示。

## 表二：`public.experiences`

经历与成长表，服务于 `/api/experiences`。

建表和种子数据 SQL 维护在 `portfolio/docs/supabase-experiences.sql`。

### 字段结构

| 字段 | 类型 | 约束 / 默认值 | 前端含义 |
| --- | --- | --- | --- |
| `id` | `text` | 主键 | 经历稳定 ID，例如 `exp-hit-monitor` |
| `company` | `text` | 非空 | 学校 / 公司名称 |
| `role` | `text` | 非空 | 岗位 / 职务，是当前卡片的主视觉标题 |
| `date` | `text` | 非空 | 经历时间段 |
| `location` | `text` | 非空，默认空字符串 | 地点 |
| `responsibilities` | `text[]` | 非空，默认空数组 | 主要工作 / 职责 |
| `honors` | `text[]` | 非空，默认空数组 | 个人荣誉 |
| `achievements` | `text[]` | 非空，默认空数组 | 代表成果 / 竞赛科研 |
| `sort_order` | `integer` | 非空，默认 `0` | 排序，数字越小越靠前 |
| `created_at` | `timestamptz` | 非空，默认 `now()` | 创建时间 |
| `updated_at` | `timestamptz` | 非空，默认 `now()` | 更新时间 |

### 当前排序

| `sort_order` | `id` | 展示对象 |
| --- | --- | --- |
| `10` | `exp-hit-monitor` | 哈尔滨工业大学 |
| `20` | `exp-1` | 字节跳动 (Lark GTM) |

### API 映射

`/api/experiences`：

```text
select: id,company,role,date,location,responsibilities,honors,achievements,sort_order
order: sort_order.asc,date.desc,company.asc
```

后端返回格式：

```json
{
  "experiences": [
    {
      "id": "exp-hit-monitor",
      "company": "哈尔滨工业大学",
      "role": "班长",
      "date": "2022 - 2026",
      "location": "哈尔滨",
      "responsibilities": [],
      "honors": [],
      "achievements": [],
      "sortOrder": 10
    }
  ]
}
```

前端 `portfolio/src/data/experience.ts` 会把数据库字段归一化为 `ExperienceItem`：

```ts
type ExperienceItem = {
  id: string;
  company: string;
  role: string;
  date: string;
  location: string;
  responsibilities: string[];
  honors: string[];
  achievements: string[];
  sortOrder?: number;
};
```

## 数据展示规则

### 经历卡片

- `role` 是主标题。
- `company` 是副标题。
- 有 `honors` 时，卡片预览展示“个人荣誉”。
- 没有 `honors` 时，卡片预览展示 `responsibilities`。
- 卡片未进入详情页前，个人荣誉只展示前 5 条，后面追加 `...`。

### 详情弹窗

- `honors` 展示为“个人荣誉”。
- `responsibilities` 展示为“主要工作”。
- `achievements` 展示为：
  - 如果存在 `honors` 且 `responsibilities` 为空，标题为“竞赛/科研”。
  - 否则标题为“代表成果”。

## 本地 fallback

当前页面具备本地降级数据：

| 文件 | 用途 |
| --- | --- |
| `portfolio/src/data/content.ts` | 本地内容源，包含 `content.experience` |
| `portfolio/src/data/experience.ts` | 请求 `/api/experiences`，失败时由上层回退到本地数据 |

维护数据库时，建议同步更新 `content.ts` 的对应 fallback 数据，避免 API 或 Supabase 异常时页面展示旧内容。

## 维护原则

1. 新增记录时必须指定稳定 `id`，不要依赖标题或公司名生成 ID。
2. 调整展示顺序只改 `sort_order`，不要在前端硬编码反转数组。
3. 个人荣誉放入 `honors`，职责放入 `responsibilities`，科研竞赛和成果放入 `achievements`。
4. 数组字段使用 PostgreSQL `text[]`，例如 `array['A', 'B']`。
5. `projects.slug` 是路由稳定标识，已经上线后不要随意修改。
6. 图片字段优先存 Supabase Storage 对象路径或稳定外部 URL，不要存临时链接。

## 相关文件

| 文件 | 说明 |
| --- | --- |
| `portfolio/docs/supabase-projects-schema.sql` | `projects` 表结构 |
| `portfolio/docs/supabase-experiences.sql` | `experiences` 表结构和种子数据 |
| `portfolio/docs/experience-data-maintenance.md` | 经历数据维护说明 |
| `portfolio/server/supabase-api.mjs` | Supabase 查询和数据归一化共享服务层 |
| `portfolio/api/experiences.js` | Vercel `/api/experiences` Function |
| `portfolio/api/project-archive.js` | Vercel `/api/project-archive` Function |
| `portfolio/api/projects.js` | Vercel `/api/projects` 兼容 Function |
| `portfolio/server/projects-api.mjs` | 本地 / 自托管 Node API；生产环境可同时托管 `dist` 静态文件 |
| `portfolio/vercel.json` | Vercel 构建、输出目录和 SPA rewrite 配置 |
| `portfolio/src/data/experience.ts` | 前端经历数据类型和归一化 |
| `portfolio/src/data/content.ts` | 本地 fallback 内容 |
