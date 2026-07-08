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
    'HR会议绩效系统｜搭建覆盖方案制定、主管确认、员工自评、主管管评、第三人评分和总分计算的绩效闭环系统，支持多部门多角色权限管理',
    '星巴克会员卡卡号提取｜搭建星礼卡图片识别与表格沉淀流程，将识别效率提升约 300%，卡号正确率提升至 99%',
    'CEO组织研修班站点｜通过 vibe coding 完成官网、后台数据和交接文档建设，将站点从 0 到 1 的搭建周期压缩到约 1 周',
    'AI出题助手｜基于知识空间搭建 CFA 题目生成助手，将单套题目生成效率提升 200% 以上，初稿生成从小时级压缩到分钟级',
    '东华链条手册助手｜构建机械手册自然语言问答助手，将资料检索效率提升约 300%，常见问题响应缩短到 30 秒内',
    '会议逐字稿质检报告生成｜设计逐字稿解析、质检维度判断和报告输出链路，将单次报告产出时间从 1 小时压缩到 10 分钟内',
    '巡检 Demo｜搭建图片/视频上传后的 AI 异常判断和整改闭环流程，将异常识别效率提升约 300%，巡检复核周期缩短 50% 以上',
    'AI简历报告生成｜整合多维表格、妙搭、Aily 和妙笔能力，将单份简历报告处理时间从 30 分钟压缩到 3 分钟内',
    '社媒热点助手｜封装热点、舆情、达人和直播内容分析链路，完成 8 个版本迭代，将方案报告产出效率提升约 500%',
    '飞书 Claude Code 连通｜完成 Claude Code 接入飞书 Bot 的一键配置方案，将配置时间从半天压缩到 30 分钟内',
    'Airdemo 前端｜维护统一 AI Demo 展示站点，沉淀项目汇总、onepage 文档和部署交接信息，将新 Demo 上架准备时间缩短约 60%',
    '华东销售机器人｜建设客户邀约推荐、已付费客户查询和销售协作场景，将客户筛选时间从 30 分钟缩短到 3 分钟内'
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
