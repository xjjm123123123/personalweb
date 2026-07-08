const page = (pageNumber) =>
  `/project-archive/pages/page-${String(pageNumber).padStart(2, "0")}.jpg`;

export const projectArchiveSeedByCategory = {
  Agent: [
    {
      id: "guokebang",
      slug: "guokebang-ai-agent",
      category: "Agent",
      year: "2025",
      title: "果课帮",
      summary:
        "通过上海畅学教育科技有限公司提供的AIGC+智慧教学平台和智能体开发工具，开发了一个专注于初中物理教学的专业小模型。该模型可调节智能体参数并输入知识库，优化系统提示词和模型关键词，确保教学的全流程实施，并具备丰富的教学功能，专注于物理学科的深度知识。作品结合AIGC+平台、COZE、figma、python等技术，构建了一个完善的AI辅助初中物理学习平台。",
      coverImage: "/image/Group 37427.png",
      detailImages: [page(8), page(9), page(10), page(11), page(12), page(13), page(14)],
      tags: ["EdTech", "AI Agent", "OCR"],
      sortOrder: 10,
    },
  ],
  VR: [
    {
      id: "plastic-ocean",
      slug: "plastic-ocean-vr",
      category: "VR",
      year: "2024",
      title: "塑料海洋",
      summary:
        "本项目基于联合国可持续发展目标（SDG 14），设计一款面向虚拟现实晕动症患者的海底环保教育游戏。通过在关键交互中植入静态射频元素，缓解用户在运动场景中的眩晕不适。玩家将以清洁者身份深入未来污染海洋，完成生态修复任务，寓教于乐，探索VR技术在健康适配与可持续教育中的融合创新。",
      coverImage: "/image/Mask group.png",
      detailImages: [page(3), page(4), page(5), page(6), page(7)],
      tags: ["Unity", "VR", "交互设计"],
      sortOrder: 10,
    },
    {
      id: "oriental-fantasy",
      slug: "dongpo-fantasy-vr",
      category: "VR",
      year: "2025",
      title: "东坡幻境",
      summary:
        "本项目以北宋文学巨匠苏轼为核心人物，运用虚拟现实(VR)技术与人工智能(AI)手段，构建一个沉浸式、多维度的数字文化体验平台。通过整合苏轼的诗词、书法与哲学思想，实现互动化、可视化的数字再现，让用户“身临其境”地感受苏轼的文化魅力。",
      coverImage: "/image/dongpo-fantasy-cover.png",
      detailImages: [page(15), page(16), page(17), page(18), page(19), page(20), page(21)],
      tags: ["Unity", "VR", "游戏设计"],
      sortOrder: 20,
    },
  ],
  "PC Game": [
    {
      id: "yongcheng-journey",
      slug: "yongzhi-journey-game",
      category: "PC Game",
      year: "2024",
      title: "维纸之旅",
      summary:
        "《维纸之旅》是一款以传统剪纸艺术为核心的跨维度冒险游戏，结合数字媒体艺术与现代设计，借助Unity引擎与Shader技术打造独特的视觉风格与交互体验。玩家将在二维与三维之间自由穿梭，剪裁、重组纸质世界，探索隐藏的秘密与挑战。游戏旨在通过创新的玩法与艺术表达，向世界展示中国剪纸文化的独特魅力与文化软实力。",
      coverImage: "/image/Mask group2.png",
      detailImages: [page(22)],
      tags: ["Unity", "国风", "游戏关卡"],
      sortOrder: 10,
    },
  ],
  Robot: [
    {
      id: "lunanest",
      slug: "lunanest-robotics",
      category: "Robot",
      year: "2025",
      title: "LUNANEST",
      summary:
        "LunaNest 是一套面向未来月面栖居的智能系统，结合仿生机器人与交互平台，完成熔岩管探测与建造模拟。系统采集三维数据，构建高精度模型，科研人员可通过 VR 沉浸式接管操作，辅助选址与规划“月球村”。",
      coverImage: "/image/coverimg.png",
      detailImages: [page(24)],
      tags: ["VR Assist", "Lava Tube", "AI System"],
      sortOrder: 10,
    },
  ],
  Web: [
    {
      id: "digital-twin-dashboard",
      slug: "northeast-revitalization-interactive-news",
      category: "Web",
      year: "2023",
      title: "“数”说东北振兴，“拼”出伟大征程",
      summary:
        "《“数”说东北振兴，“拼”出伟大征程——可视化交互新闻》通过“技术+艺术+人文”的形式，以拼图游戏为载体，采用数据动态可视化技术，引入智能数据问答机器人，动态生成可分享的个性化明信片，全方位展现党的十八大以来东北振兴取得的辉煌成就。该作品荣获第16届中国大学生计算机设计大赛国家级二等奖，代表哈工大参加中国南京设计周，并刊登在哈工大学报上。",
      coverImage: "/image/Rectangle.png",
      detailImages: [page(23)],
      tags: ["Interactive News", "Data Viz", "AI QA Bot"],
      sortOrder: 10,
    },
    {
      id: "binfeng-scroll-interaction",
      slug: "binfeng-scroll-interaction-system",
      category: "Web",
      year: "2025",
      title: "豳风图交互系统设计",
      summary:
        "本设计以《诗经·豳风》及《豳风图》为文化对象，构建“AI意象视频+长卷交互阅读”的数字展示系统。系统通过长卷横向浏览、8个文化热点、局部意象视频、沉浸/解读双模式、RAG导览助手和读画报告，将静态古画转化为可探索、可观看、可提问的交互作品。个人部分主要完成分镜筛选、视频生成与后处理、前端交互、热点数据组织、意象档案和展示材料整合。",
      coverImage: "/image/binfeng-cover.png",
      detailImages: [],
      embedUrls: [
        "https://middle-ppt.vercel.app/",
        "https://ai-digital-scroll-platform.vercel.app/",
      ],
      tags: ["数字艺术", "机器学习", "Web"],
      sortOrder: 20,
    },
  ],
};
