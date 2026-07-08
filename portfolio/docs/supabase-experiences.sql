create table if not exists public.experiences (
  id text primary key,
  company text not null,
  role text not null,
  date text not null,
  location text not null default '',
  responsibilities text[] not null default '{}',
  honors text[] not null default '{}',
  achievements text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.experiences
  add column if not exists honors text[] not null default '{}';

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
  'exp-1',
  '字节跳动 (Lark GTM)',
  'AI解决方案实习生',
  '2025.12 - 2026.07',
  '上海/杭州',
  array[
    '深入剖析多行业真实业务场景，评估 AI 技术赋能潜力，独立撰写标准化 AI 解决方案架构文档',
    '基于飞书开放平台及内部 AI Infra，结合 Vibe Coding 模式快速构建并落地 20+ 个可运行的 AI 产品 MVP'
  ],
  array[]::text[],
  array[
    '独立完成一份数据分析报告',
    '整理 30+ 条竞品功能信息',
    '协助优化项目汇报 PPT 结构'
  ],
  20
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
  'exp-hit-monitor',
  '哈尔滨工业大学',
  '班长',
  '2022 - 2026',
  '哈尔滨',
  array[]::text[],
  array[
    '2023-2024｜国家奖学金',
    '2026｜优秀毕设设计',
    '2025｜一等人民奖学金',
    '2023-2024｜校级优秀学生干部',
    '2022-2023｜校级优秀学生干部',
    '2023-2024｜校级二等人民奖学金',
    '2023-2024｜校级三等人民奖学金',
    '2022-2023｜校级三等人民奖学金',
    '2025-至今｜校级三等人民奖学金'
  ],
  array[
    '2025｜数字媒体科技作品大赛国家级一等奖',
    '2023-2024｜大广赛国家级二等奖',
    '2022-2023｜计算机设计大赛国家级二等奖',
    '2022-2023｜全国三维数字化创新设计大赛全国三等奖',
    '2022-2023｜计算机设计大赛省级一等奖',
    '2022-2023｜大广赛省级一等奖',
    '2022-2023｜全国三维数字化创新设计大赛省级一等奖',
    '2024-2025｜计算机设计大赛省级一等奖',
    '2023-2024｜NCDA未来设计师省级二等奖',
    '2022-2023｜大广赛省级三等奖两次',
    '2023-2024｜大广赛省级三等奖',
    '2023-2024｜中国好创意大赛省级三等奖',
    '2024-2025｜数字媒体科技作品大赛省级三等奖',
    '2024-2025｜数字媒体科技作品大赛省级三等奖',
    '2022-2023｜大广赛省级优秀奖4次',
    '2022-2023｜大一年度项目校级一等奖',
    '2023-2024｜校级大创项目结题'
  ],
  10
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
