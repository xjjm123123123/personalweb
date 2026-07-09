# Personal Web Portfolio 维护手册

这是一个基于 **Vite + React + TypeScript + Tailwind CSS + GSAP + Three.js + Supabase + Vercel** 的个人作品集站点。

本文档面向后续维护者，重点说明：本地如何启动、数据在哪里改、图片如何同步、官网如何部署、常见问题如何排查。

## 目录

- [项目结构](#项目结构)
- [技术架构](#技术架构)
- [本地启动](#本地启动)
- [环境变量](#环境变量)
- [数据维护](#数据维护)
- [图片与项目资源维护](#图片与项目资源维护)
- [部署流程](#部署流程)
- [上线前检查清单](#上线前检查清单)
- [常见问题排查](#常见问题排查)
- [安全原则](#安全原则)
- [关键文件索引](#关键文件索引)

## 项目结构

```text
personalweb/
├── README.md                         # 当前维护手册，GitHub 首页文档
├── portfolio/                        # 站点主工程，Vercel Root Directory 应指向这里
│   ├── api/                          # Vercel Serverless Functions
│   ├── docs/                         # 数据库结构、数据维护、SQL 文档
│   ├── public/                       # 前端静态资源
│   ├── scripts/                      # 数据同步、图片优化脚本
│   ├── server/                       # 本地 API / 自托管 API
│   ├── src/                          # React 前端源码
│   ├── package.json                  # 脚本和依赖
│   ├── vercel.json                   # Vercel 构建与路由配置
│   └── vite.config.ts                # Vite 配置，本地代理 /api 到 8787
└── image/                            # 原始图片素材区，按需复制进 portfolio/public
```

## 技术架构

生产环境链路：

```text
Browser
  -> Vercel Static dist
  -> /api/*
      -> Vercel Functions
      -> portfolio/server/supabase-api.mjs
      -> Supabase REST API / Storage
```

本地开发链路：

```text
Browser
  -> Vite dev server
  -> /api/*
      -> http://localhost:8787
      -> portfolio/server/projects-api.mjs
      -> portfolio/server/supabase-api.mjs
      -> Supabase
```

关键原则：

- 前端不直接连接 Supabase。
- Supabase key 只存在服务端环境变量中。
- 本地和 Vercel 共用 `portfolio/server/supabase-api.mjs`，避免两套数据逻辑分叉。
- 项目数据以 `src/data/projectArchiveSeed.js` 为本地权威源，再同步到 Supabase。
- 经历数据目前以 Supabase `experiences` 表为线上权威源，`src/data/content.ts` 提供 fallback。

## 本地启动

进入站点工程：

```bash
cd portfolio
```

安装依赖：

```bash
npm install
```

启动本地 API：

```bash
npm run api
```

默认地址：

```text
http://localhost:8787
```

另开一个终端启动前端：

```bash
npm run dev
```

Vite 会输出本地页面地址，通常是：

```text
http://localhost:5173/
```

如果同时存在很多 Vite 端口，建议清理后只保留一个：

```bash
lsof -ti tcp:5173,5174,5175,5176,5177,5178,5179,5180,5181,5190 | xargs kill
npm run dev
```

## 环境变量

本地环境变量放在：

```text
portfolio/.env
```

模板见：

```text
portfolio/.env.example
```

需要的变量：

```text
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SECRET_KEY=your-supabase-secret-key
SUPABASE_ASSETS_BUCKET=portfolio-assets
SUPABASE_EXPERIENCES_TABLE=experiences
PROJECTS_API_PORT=8787
```

兼容变量：

```text
SUPABASE_SERVICE_ROLE_KEY=your-supabase-secret-key
```

Vercel 也需要配置：

```text
SUPABASE_URL
SUPABASE_SECRET_KEY
```

可选：

```text
SUPABASE_PROJECTS_TABLE=projects
SUPABASE_EXPERIENCES_TABLE=experiences
SUPABASE_ASSETS_BUCKET=portfolio-assets
```

不需要配置：

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

原因：前端不直接读 Supabase。

## 数据维护

### 1. 项目归档数据

用于作品集项目页、分类页、详情页、iframe Demo。

本地权威源：

```text
portfolio/src/data/projectArchiveSeed.js
```

类型定义：

```text
portfolio/src/data/projectArchive.ts
```

数据库表：

```text
public.projects
```

建表 SQL：

```text
portfolio/docs/supabase-projects-schema.sql
```

同步脚本：

```text
portfolio/scripts/sync-project-archive.mjs
```

维护流程：

```bash
cd portfolio
```

1. 修改 `src/data/projectArchiveSeed.js`
2. 如果使用本地图片，把图片放进 `public/` 下的稳定路径
3. 执行同步：

```bash
npm run sync:project-archive
```

4. 重启本地 API 清缓存：

```bash
lsof -ti :8787 | xargs kill
npm run api
```

5. 验证接口：

```bash
curl http://localhost:8787/api/project-archive
```

项目字段说明：

| 字段 | 含义 |
| --- | --- |
| `slug` | 稳定路由标识，上线后不要随意改 |
| `category` | 分类，例如 `Web`、`Agent`、`VR` |
| `year` | 年份 |
| `title` | 项目标题 |
| `summary` | 项目摘要 |
| `coverImage` | 封面图路径 |
| `detailImages` | 详情图数组 |
| `embedUrls` | 详情页 iframe 链接数组 |
| `tags` | 标签数组 |
| `sortOrder` | 排序，数字越小越靠前 |

### 2. 经历与成长数据

用于经历卡片、详情弹窗、代表成果。

线上权威源：

```text
public.experiences
```

本地 fallback：

```text
portfolio/src/data/content.ts
```

建表与种子 SQL：

```text
portfolio/docs/supabase-experiences.sql
```

维护说明：

```text
portfolio/docs/experience-data-maintenance.md
```

字段说明：

| 字段 | 含义 |
| --- | --- |
| `id` | 稳定 ID，例如 `exp-1`、`exp-hit-monitor` |
| `company` | 公司 / 学校名称 |
| `role` | 岗位 / 职务 |
| `date` | 时间段 |
| `location` | 地点 |
| `responsibilities` | 主要工作 |
| `honors` | 荣誉 |
| `achievements` | 代表成果 / 竞赛科研 |
| `sort_order` | 排序 |

日常修改建议：

- 改线上展示：更新 Supabase `experiences` 表。
- 防止 API 异常时回退到旧文案：同步更新 `src/data/content.ts`。
- 防止重跑 SQL 时覆盖新文案：同步更新 `docs/supabase-experiences.sql`。

修改后验证：

```bash
curl http://localhost:8787/api/experiences
```

### 3. 字节 STAR 详情

字节经历详情里的 STAR 手风琴是前端静态展示内容。

文件：

```text
portfolio/src/data/byteStarProjects.ts
```

适用场景：

- 修改 STAR 的 S / T / A / R 长文
- 给某个 STAR 项目加站点链接
- 调整 STAR 项目标题

注意：

- 这里不走 Supabase。
- 修改后只需要重新构建和部署。
- 如果同时修改代表成果摘要，仍需同步 Supabase `experiences` 表、`content.ts` 和 `supabase-experiences.sql`。

## 图片与项目资源维护

### 封面图

推荐放在：

```text
portfolio/public/image/
```

然后在 `projectArchiveSeed.js` 中引用：

```js
coverImage: "/image/example-cover.png"
```

运行：

```bash
npm run sync:project-archive
```

脚本会把封面压缩后上传到 Supabase Storage。

### 详情图

在 `projectArchiveSeed.js` 中配置：

```js
detailImages: [
  "/project-archive/pages/page-01.jpg",
  "/project-archive/pages/page-02.jpg",
]
```

同步脚本会：

- 读取本地图片
- 生成带水印版本
- 上传到 Supabase Storage
- 清理不再使用的旧对象

### iframe Demo

在项目数据中配置：

```js
embedUrls: [
  "https://example-demo-1.vercel.app/",
  "https://example-demo-2.vercel.app/",
]
```

注意：

- HTTPS 站点里嵌入 HTTP iframe 很容易被浏览器拦截。
- 外部站点如果设置了 `X-Frame-Options` 或 CSP，也可能拒绝被嵌入。
- 如果只需要跳转，不要用 iframe，改成外链更稳。

## 部署流程

当前仓库远端：

```text
origin  https://github.com/xjjm123123123/personalweb
```

当前线上部署分支：

```text
vercel-deploy
```

Vercel 配置：

```text
Root Directory: portfolio
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

配置文件：

```text
portfolio/vercel.json
```

上线流程：

```bash
git status --short
```

只提交相关文件：

```bash
git add <changed-files>
git commit -m "Describe the change"
```

提交信息不要包含任何协作者署名 footer。

推送开发分支：

```bash
git push origin main
```

推送部署分支：

```bash
git push origin main:vercel-deploy
```

Vercel 通常会在 1-3 分钟内完成部署。

如果后续把 Vercel 改成监听 `main`，则只需要：

```bash
git push origin main
```

## 上线前检查清单

每次上线前至少执行：

```bash
cd portfolio
npm run build
git diff --check
```

如果改了项目数据：

```bash
npm run sync:project-archive
curl http://localhost:8787/api/project-archive
```

如果改了经历数据：

```bash
curl http://localhost:8787/api/experiences
```

如果改了 API 逻辑：

```bash
lsof -ti :8787 | xargs kill
npm run api
```

如果官网没有变化：

1. 确认是否推到了 `vercel-deploy`
2. 确认 Vercel 构建是否成功
3. 强刷浏览器：`Cmd + Shift + R`
4. 检查接口返回是否是新数据

## 常见问题排查

### 1. 本地页面改了，官网没变

原因通常是只推了 `main`，但 Vercel 监听 `vercel-deploy`。

处理：

```bash
git push origin main:vercel-deploy
```

### 2. Supabase 数据改了，本地页面仍是旧内容

本地 API 有缓存，且 `npm run api` 是常驻进程。

处理：

```bash
lsof -ti :8787 | xargs kill
npm run api
```

### 3. 项目详情里 iframe 看不到

排查顺序：

1. `projectArchiveSeed.js` 是否有 `embedUrls`
2. 是否运行过 `npm run sync:project-archive`
3. `/api/project-archive` 或 `/api/projects` 是否返回 `embedUrls`
4. 目标站点是否允许 iframe 嵌入
5. 目标链接是否是 HTTPS

### 4. 图片没有更新

处理：

```bash
npm run sync:project-archive
```

如果仍旧没变：

- 检查图片路径是否在 `portfolio/public/` 下
- 检查文件名是否真的变化
- 检查 Supabase Storage 对象是否被更新
- 浏览器强刷

### 5. Vite 端口越来越多

清理旧 dev server：

```bash
lsof -ti tcp:5173,5174,5175,5176,5177,5178,5179,5180,5181,5190 | xargs kill
npm run dev
```

### 6. 构建产物过大告警

Vite 可能提示某些 chunk 大于 500 kB。当前项目使用 Three.js、GSAP、React Three Fiber，出现该告警是可预期的。

优先级判断：

- 不阻塞上线。
- 如果首屏加载变慢，再考虑拆分 Three.js / PixelTrail / ProjectGallery 的动态 import。

## 安全原则

### 不要提交密钥

永远不要提交：

```text
portfolio/.env
```

`.env` 应只存在本地和 Vercel 环境变量中。

### service role key 泄露后必须轮换

`SUPABASE_SECRET_KEY` 或 `SUPABASE_SERVICE_ROLE_KEY` 是服务端高权限密钥。

一旦出现在：

- 对话记录
- 截图
- Git 提交
- 日志
- 公开文档

都应立即去 Supabase 控制台轮换密钥，并更新：

- 本地 `portfolio/.env`
- Vercel Environment Variables

### 前端不要直接读 Supabase

不要在前端新增：

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

当前项目设计是前端只访问同源 `/api/*`，由服务端代理 Supabase。

## 关键文件索引

| 文件 | 用途 |
| --- | --- |
| `portfolio/src/App.tsx` | 页面主体编排、全局动效入口 |
| `portfolio/src/components/About.tsx` | About 区块、教育经历、Professional 摘要 |
| `portfolio/src/components/Experience.tsx` | 经历卡片、详情弹窗、STAR 手风琴 |
| `portfolio/src/components/ProjectGallery.tsx` | 项目分类、项目详情、iframe Demo |
| `portfolio/src/components/PixelTrail.jsx` | 全局鼠标拖尾动效 |
| `portfolio/src/data/content.ts` | 本地 fallback 内容 |
| `portfolio/src/data/experience.ts` | 经历接口请求、类型归一化 |
| `portfolio/src/data/byteStarProjects.ts` | 字节 STAR 详情 |
| `portfolio/src/data/projectArchiveSeed.js` | 项目归档本地权威数据 |
| `portfolio/src/data/projectArchive.ts` | 项目归档类型 |
| `portfolio/server/supabase-api.mjs` | Supabase 查询与资源 URL 归一化 |
| `portfolio/server/projects-api.mjs` | 本地 API / 自托管服务 |
| `portfolio/api/experiences.js` | Vercel `/api/experiences` |
| `portfolio/api/project-archive.js` | Vercel `/api/project-archive` |
| `portfolio/api/projects.js` | Vercel `/api/projects` |
| `portfolio/scripts/sync-project-archive.mjs` | 项目数据与图片同步 |
| `portfolio/docs/current-database-schema.md` | 当前数据库结构文档 |
| `portfolio/docs/supabase-projects-schema.sql` | `projects` 表结构 |
| `portfolio/docs/supabase-experiences.sql` | `experiences` 表结构与种子 |
| `portfolio/vercel.json` | Vercel 构建与 SPA rewrite |
| `portfolio/vite.config.ts` | Vite 与本地 `/api` 代理 |

## 推荐维护策略

短期维护：

- 项目内容：改 `projectArchiveSeed.js`，再运行 `npm run sync:project-archive`
- 经历摘要：改 Supabase，同时同步 `content.ts` 和 `supabase-experiences.sql`
- STAR 长文：改 `byteStarProjects.ts`
- 样式交互：改对应 React 组件

长期优化：

- 把经历数据也做成同步脚本，对齐项目归档数据的维护方式。
- 把 Vercel 部署分支改回 `main`，减少 `main -> vercel-deploy` 的手动同步步骤。
- 对 Three.js / PixelTrail 做动态加载拆分，降低首屏 bundle。
- 给 HTTP 外链站点配置 HTTPS，避免 iframe 和浏览器安全提示问题。
