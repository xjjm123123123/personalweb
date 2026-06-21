# Tasks
- [x] Task 1: 排查首帧为何仍在中心出现
  - [x] SubTask 1.1: 检查 `Hero` 中动画容器的默认布局与初始样式
  - [x] SubTask 1.2: 检查 `CircularText` 是否在挂载时先以中心状态渲染
  - [x] SubTask 1.3: 明确是首帧渲染时机问题还是动画目标元素选择问题

- [x] Task 2: 修正右上角入场实现
  - [x] SubTask 2.1: 调整首屏动画元素的初始隐藏与右上角偏移状态
  - [x] SubTask 2.2: 确保动画在首帧绘制前接管，避免中心闪现
  - [x] SubTask 2.3: 保留现有“被引力拉入中心并入轨”的节奏

- [x] Task 3: 验证真实表现
  - [x] SubTask 3.1: 运行构建或必要检查，确认没有引入新错误
  - [x] SubTask 3.2: 对照页面行为确认首次可见位置来自右上角
  - [x] SubTask 3.3: 更新任务状态与核对 checklist

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
