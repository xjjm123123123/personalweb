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
      id: "exp-1",
      company: "字节跳动 (Lark GTM)",
      role: "AI解决方案实习生",
      date: "2025.12 - 2026.07",
      location: "北京",
      responsibilities: [
        "深入剖析多行业真实业务场景，评估 AI 技术赋能潜力，独立撰写标准化 AI 解决方案架构文档",
        "基于飞书开放平台及内部 AI Infra，结合 Vibe Coding 模式快速构建并落地 20+ 个可运行的 AI 产品 MVP"
      ],
      achievements: [
        "独立完成一份数据分析报告",
        "整理 30+ 条竞品功能信息",
        "协助优化项目汇报 PPT 结构"
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
