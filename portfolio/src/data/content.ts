export const content = {
  hero: {
    title: "保持好奇，持续创造。",
    subtitle: "一名关注数据、设计与真实问题解决的大学生，正在通过项目和实习把想法转化为可见成果。",
    labels: ["Data Lover", "Project Builder", "Always Learning"],
    ctaPrimary: { label: "查看我的项目", href: "#projects" },
    ctaSecondary: { label: "下载简历", href: "/resume.pdf" }
  },
  about: {
    core: "以前，能力决定你能学什么；现在，AI 让你能学会一切。\n所以别再问'我能不能'，去做那件不可能的事——这就是未来的速度。",
    cards: [
      { title: "我是谁", desc: "大三在读 / 交互设计与数据分析 / 热爱创造" },
      { title: "我在做什么", desc: "项目实践、数据分析、产品设计、研究学习" },
      { title: "我感兴趣的方向", desc: "数据分析、用户研究、产品设计、教育科技" },
      { title: "我正在寻找", desc: "暑期实习机会、项目合作、科研机会" }
    ]
  },
  journey: [
    { year: "2022", title: "进入大学", desc: "开始专业学习，探索技术与设计的边界" },
    { year: "2023.06", title: "首个独立项目", desc: "完成第一个全链路产品原型设计" },
    { year: "2023.09", title: "数据分析竞赛", desc: "参加数据建模大赛并获得省奖" },
    { year: "2024.06", title: "第一段实习", desc: "作为数据分析实习生，深入理解业务场景" },
    { year: "2024.12", title: "持续创造", desc: "积累更多作品，探索 AI 与产品的结合" },
    { year: "未来", title: "寻找机会", desc: "寻找更多实习、科研或合作可能" }
  ],
  projects: [
    {
      id: "project-1",
      title: "校园二手交易平台",
      description: "面向校园闲置物品流通场景设计的产品原型。",
      role: "用户调研、产品设计、原型制作",
      tools: ["Figma", "问卷", "竞品分析"],
      outcome: "完成高保真原型、用户流程图和展示 PPT。",
      image: "https://picsum.photos/seed/campus-trade/800/600",
      link: "#"
    },
    {
      id: "project-2",
      title: "学生成绩数据分析",
      description: "基于课程数据进行学生表现分析与可视化展示。",
      role: "数据清洗、图表设计、报告撰写",
      tools: ["Python", "Excel", "Tableau"],
      outcome: "输出分析报告和可视化看板。",
      image: "https://picsum.photos/seed/data-analysis/800/600",
      link: "#"
    },
    {
      id: "project-3",
      title: "学习陪伴类 App 原型",
      description: "围绕大学生学习计划与习惯养成设计的移动端应用。",
      role: "需求分析、交互设计、用户测试",
      tools: ["Figma", "用户访谈", "原型测试"],
      outcome: "完成 App 原型和用户测试反馈整理。",
      image: "https://picsum.photos/seed/study-app/800/600",
      link: "#"
    }
  ],
  experience: [
    {
      id: "exp-hit-monitor",
      company: "哈尔滨工业大学",
      role: "班长",
      date: "2022 - 2026",
      location: "哈尔滨",
      responsibilities: [],
      honors: [
        "2023-2024｜国家奖学金",
        "2026｜优秀毕设设计",
        "2025｜一等人民奖学金",
        "2023-2024｜校级优秀学生干部",
        "2022-2023｜校级优秀学生干部",
        "2023-2024｜校级二等人民奖学金",
        "2023-2024｜校级三等人民奖学金",
        "2022-2023｜校级三等人民奖学金",
        "2025-至今｜校级三等人民奖学金"
      ],
      achievements: [
        "2025｜数字媒体科技作品大赛国家级一等奖",
        "2023-2024｜大广赛国家级二等奖",
        "2022-2023｜计算机设计大赛国家级二等奖",
        "2022-2023｜全国三维数字化创新设计大赛全国三等奖",
        "2022-2023｜计算机设计大赛省级一等奖",
        "2022-2023｜大广赛省级一等奖",
        "2022-2023｜全国三维数字化创新设计大赛省级一等奖",
        "2024-2025｜计算机设计大赛省级一等奖",
        "2023-2024｜NCDA未来设计师省级二等奖",
        "2022-2023｜大广赛省级三等奖两次",
        "2023-2024｜大广赛省级三等奖",
        "2023-2024｜中国好创意大赛省级三等奖",
        "2024-2025｜数字媒体科技作品大赛省级三等奖",
        "2024-2025｜数字媒体科技作品大赛省级三等奖",
        "2022-2023｜大广赛省级优秀奖4次",
        "2022-2023｜大一年度项目校级一等奖",
        "2023-2024｜校级大创项目结题"
      ]
    },
    {
      id: "exp-1",
      company: "字节跳动 (Lark GTM)",
      role: "AI解决方案实习生",
      date: "2025.12 - 2026.07",
      location: "上海/杭州",
      responsibilities: [
        "深入剖析多行业真实业务场景，评估 AI 技术赋能潜力，独立撰写标准化 AI 解决方案架构文档",
        "基于飞书开放平台及内部 AI Infra，结合 Vibe Coding 模式快速构建并落地 20+ 个可运行的 AI 产品 MVP"
      ],
      honors: [],
      achievements: [
        "HR会议绩效系统｜搭建覆盖方案制定、主管确认、员工自评、主管管评、第三人评分和总分计算的绩效闭环系统，支持多部门多角色权限管理",
        "星巴克会员卡卡号提取｜搭建星礼卡图片识别与表格沉淀流程，将识别效率提升约 300%，卡号正确率提升至 99%",
        "CEO组织转型研修班｜将研修班站点从 0 到 1 搭建并持续维护，后续运营人员可按文档独立维护，站点影响 ARR 上亿",
        "AI出题助手｜基于知识空间搭建 CFA 题目生成助手，将单套题目生成效率提升 200% 以上，初稿生成从小时级压缩到分钟级",
        "东华链条手册助手｜构建机械手册自然语言问答助手，将资料检索效率提升约 300%，常见问题响应缩短到 30 秒内",
        "会议逐字稿质检报告生成｜设计逐字稿解析、质检维度判断和报告输出链路，将单次报告产出时间从 1 小时压缩到 10 分钟内",
        "巡检 Demo｜搭建图片/视频上传后的 AI 异常判断和整改闭环流程，将异常识别效率提升约 300%，巡检复核周期缩短 50% 以上",
        "AI简历报告生成｜整合多维表格、妙搭、Aily 和妙笔能力，将单份简历报告处理时间从 30 分钟压缩到 3 分钟内",
        "社媒热点助手｜封装热点、舆情、达人和直播内容分析链路，完成 8 个版本迭代，将方案报告产出效率提升约 500%",
        "飞书 Claude Code 连通｜完成 Claude Code 接入飞书 Bot 的一键配置方案，将配置时间从半天压缩到 30 分钟内",
        "Airdemo 前端｜维护统一 AI Demo 展示站点，沉淀项目汇总、onepage 文档和部署交接信息，将新 Demo 上架准备时间缩短约 60%",
        "华东销售机器人｜建设客户邀约推荐、已付费客户查询和销售协作场景，将客户筛选时间从 30 分钟缩短到 3 分钟内"
      ]
    }
  ],
  skills: [
    {
      category: "数据分析",
      items: ["Python", "SQL", "Excel", "SPSS", "Tableau"]
    },
    {
      category: "产品与设计",
      items: ["Figma", "Axure", "Sketch", "用户研究", "原型设计"]
    },
    {
      category: "开发能力",
      items: ["HTML", "CSS", "JavaScript", "React", "Git"]
    },
    {
      category: "办公与效率",
      items: ["PPT", "Word", "Notion", "Xmind", "Canva"]
    },
    {
      category: "语言能力",
      items: ["中文 (母语)", "英文 (CET-6)"]
    }
  ],
  beyond: [
    {
      title: "摄影",
      desc: "用镜头记录生活观察，培养视觉审美能力。",
      image: "https://picsum.photos/seed/photography/600/600"
    },
    {
      title: "阅读",
      desc: "广泛阅读科技与人文书籍，保持持续学习习惯。",
      image: "https://picsum.photos/seed/reading/600/600"
    },
    {
      title: "志愿服务",
      desc: "参与社区服务活动，承担社会责任。",
      image: "https://picsum.photos/seed/volunteer/600/600"
    },
    {
      title: "旅行",
      desc: "探索不同的文化与风景，保持开放心态。",
      image: "https://picsum.photos/seed/travel/600/600"
    }
  ],
  contact: {
    heading: "期待和你一起创造一些有意思的东西。",
    email: "xuj038904@gmail.com",
    linkedin: "https://linkedin.com",
    github: "https://github.com"
  }
}
