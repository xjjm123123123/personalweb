# Portfolio

Vite + React 作品集站点。前端只请求同源 `/api/*`，Supabase 访问统一收敛到服务端。

## 架构

```text
Browser
  -> Vite static site
  -> /api/*
      -> server/supabase-api.mjs
      -> Supabase
```

## 本地开发

启动 API：

```bash
npm run api
```

启动 Vite：

```bash
npm run dev
```

Vite 会把 `/api` 代理到 `http://localhost:8787`。

## Vercel 部署

Vercel 使用：

- `vercel.json`
- `api/experiences.js`
- `api/project-archive.js`
- `api/projects.js`

构建配置：

```text
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

环境变量：

```text
SUPABASE_URL
SUPABASE_SECRET_KEY
```

或：

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

可选：

```text
SUPABASE_PROJECTS_TABLE=projects
SUPABASE_EXPERIENCES_TABLE=experiences
SUPABASE_ASSETS_BUCKET=portfolio-assets
```

不需要配置 `VITE_SUPABASE_URL` 或 `VITE_SUPABASE_PUBLISHABLE_KEY`。

## 自托管

```bash
npm install
npm run build
npm start
```
