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
        "面向教育场景的数字产品项目，围绕 AI Agent、OCR、流程设计、后台系统、APP 端体验和运营链路展开。按你的分类口径，这里归入 Agent。",
      coverImage: page(8),
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
        "以海洋塑料污染为主题的沉浸式 VR 体验项目，围绕场景叙事、交互流程、视觉设定和 Unity 开发实现展开，作品页覆盖系统设计、关卡体验与效果展示。",
      coverImage: page(3),
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
        "基于 Unity 的东方题材飞行 VR 项目，内容包含视觉概念、玩法设计、特效与 UI、开发流程、实现细节和用户测试，属于完整的沉浸式作品集章节。",
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
        "国风叙事向游戏项目，作品页集中展示关卡环境、玩法机制、战斗画面与结果展示，整体更接近 PC 游戏作品而不是 Web 或 Agent 类型。",
      coverImage: page(22),
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
      coverImage: page(24),
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
  ],
};
