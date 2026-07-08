# 经历与成长数据维护

## 数据源

页面优先读取 Supabase 的 `public.experiences` 表，接口路径是 `/api/experiences`。

如果接口失败或表里没有数据，前端会回退到 `src/data/content.ts` 里的 `content.experience`。

## 首次建表

在 Supabase 控制台打开 SQL Editor，执行：

```sql
-- docs/supabase-experiences.sql
```

也就是把 `docs/supabase-experiences.sql` 的内容完整粘贴进去执行。

执行后重启本地 API：

```bash
npm run api
```

再访问：

```bash
curl http://localhost:8787/api/experiences
```

能看到 `experiences` 数组就说明数据库链路正常。

## 字段说明

| 字段 | 含义 | 示例 |
| --- | --- | --- |
| `id` | 唯一 ID，不要重复 | `exp-hit-monitor` |
| `company` | 模块标题 / 机构名称 | `哈尔滨工业大学` |
| `role` | 职务 / 角色 | `班长` |
| `date` | 时间范围 | `2022 - 2026` |
| `location` | 地点 | `哈尔滨` |
| `responsibilities` | 经历内容，字符串数组 | `{"担任班长..."}` |
| `honors` | 个人荣誉，字符串数组 | `{"优秀学生干部"}` |
| `achievements` | 奖项 / 成果，字符串数组 | `{"优秀毕设（2026）"}` |
| `sort_order` | 排序，数字越小越靠前 | `20` |

## 后续新增一条经历

推荐在 Supabase Table Editor 里直接新增一行；字段按上表填写。

如果用 SQL，模板如下：

```sql
insert into public.experiences (
  id,
  company,
  role,
  date,
  location,
  responsibilities,
  honors,
  achievements,
  sort_order
) values (
  'exp-your-id',
  '机构名称',
  '职务',
  '时间',
  '地点',
  array[
    '经历内容 1',
    '经历内容 2'
  ],
  array[
    '个人荣誉 1',
    '个人荣誉 2'
  ],
  array[
    '成果 1',
    '成果 2'
  ],
  30
) on conflict (id) do update set
  company = excluded.company,
  role = excluded.role,
  date = excluded.date,
  location = excluded.location,
  responsibilities = excluded.responsibilities,
  honors = excluded.honors,
  achievements = excluded.achievements,
  sort_order = excluded.sort_order,
  updated_at = now();
```

## 维护原则

1. 日常只改 Supabase 表，不改 React 组件。
2. 新增经历时固定一个稳定 `id`，不要用中文标题当 ID。
3. 个人荣誉放 `honors`，奖项成果放 `achievements`，职责和经历描述放 `responsibilities`。
4. 需要调顺序只改 `sort_order`。
5. 如果改字段名，需要同步更新 `server/projects-api.mjs` 和 `src/data/experience.ts`。
