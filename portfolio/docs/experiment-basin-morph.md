# 实验方案：粒子场从「人像」过渡到「盆地·山脉·门」

> 目标：在 `#projects` 区段，让 `ThreePixelStarField` 的粒子在原有「星空 → 人像」形态之上，**追加一段形变**——汇聚成一个四周环绕山脉、中央散布若干「门」的盆地地形，每道门代表一类项目。
>
> 本文为实验/设计方案，**不修改现有任何代码**，仅作为后续实现的依据。

---

## 1. 背景与现状（基于现有代码）

| 模块 | 文件 | 关键点 |
| --- | --- | --- |
| 粒子场 | `src/components/ThreePixelStarField.tsx` | 全屏 `fixed inset-0 z-[50] pointer-events-none mix-blend-difference` 的 Three.js 画布 |
| 形变驱动 | 同上 `setupScroll()` | 绑定 `#hero`：`start: top top / end: bottom top`，`uProgress` 0→1，相机 z 12→7，整体绕 Y 旋转 |
| 形变目标 | 同上 `loadModelGeometry()` | 用 `MeshSurfaceSampler` 在 GLB 人像表面采样得到 `targetPositions` |
| 着色 | vertex/fragment shader | `mix(currentPos, aTargetPosition, p)` 完成位置插值；菲涅尔强调边缘；像素方块 + CRT 扫描线风格 |
| 项目区 | `src/components/Projects.tsx` | 桌面端水平滚动劫持：`pin: true`，`x: -distance` 随滚动 scrub |
| 数据 | `src/data/content.ts` | `projects[]` 共 3 个项目，可归纳为「产品设计 / 数据分析 / 交互设计」等类别 |

**当前关键约束（务必延续）**
- 粒子数：桌面 `6000`，移动 `2400`；后一半被标记为 `aIsExtra`（滚动时才显形）。
- 单一形变目标：现仅有一个 `aTargetPosition`，由 `uProgress` 单值驱动。
- 画布是 `pointer-events-none` 背景层、`mix-blend-difference`，颜色会与 `#projects` 背景 `#0a0f1c` 做差值反相。
- `Projects` 已占用一个 `pin` 型 ScrollTrigger，新增 trigger 需考虑共存与 `invalidateOnRefresh`。

---

## 2. 设计目标与验收标准

**形态目标**
1. 盆地：中心低、四周高的环形地势（碗状）。
2. 山脉：盆地外圈由起伏脊线构成的「山墙」，有方位感（非完美圆环）。
3. 门：盆地内部 N 道独立的「拱门 / 鸟居」状粒子簇，数量 = 项目类别数（建议 3–4，可配置）。
4. 视角：从人像的正视，过渡到能俯瞰盆地全貌的 **俯视/等距视角**。

**验收标准**
- 滚动进入 `#projects` 时形变平滑、无跳变、无闪烁（参考已知的 hero-ring flash 问题，见 `debug-hero-ring-flash.md`）。
- 桌面端帧率 ≥ 50fps（6000 粒子），移动端不崩溃、可降级。
- 门的数量与位置由参数驱动，改动 `projects` 类别不需要改 shader。
- 不破坏 Hero/About 已有的「星空 → 人像」体验。

---

## 3. 总体思路：把「两态形变」升级为「三态形变」

现状是 `星空(progress=0) → 人像(progress=1)` 的两态。方案把它扩展成三态时间线：

```
阶段A  星空        →  阶段B 人像        →  阶段C 盆地+山脉+门
uProgress: 0→1 (绑定 #hero)         uMorph2: 0→1 (绑定 #projects)
```

核心做法：**新增第二组目标属性 + 第二个进度 uniform**，在 shader 里做二级插值：

```glsl
// 伪代码
vec3 a = mix(startPos, portraitTarget, p);      // 既有：星空→人像
vec3 b = mix(a,        basinTarget,    p2);      // 新增：人像→盆地
vec3 finalPosition = b;
```

这样既复用现有粒子缓冲与渲染管线，又不破坏 A→B 阶段。

---

## 4. 三套候选实现（建议按 4.1 优先验证）

### 4.1 方案一：程序化高度场（首选，零额外资源）
- **地形**：在 `xz` 平面网格上用径向高度函数生成碗状盆地 + 噪声山脊，再采样为目标点。
  ```
  r = length(xz - center)
  basin = -depth * exp(-(r/R0)^2)                // 中央下凹
  ridge = ridgeHeight * smoothstep(R1,R2,r) * (1 + 0.4*noise(angle))  // 外圈山墙、带方位起伏
  y = basin + ridge
  ```
- **门**：取 M 个粒子子集，按拱门参数方程排布（两根立柱 + 横梁，或半圆拱），均匀分布在盆地半径 `R_gate` 的圆周上，朝向圆心。
- **粒子分配**：`particleCount` 拆分为「地形粒子 (~85%) + 门粒子 (~15%)」，新增 `aRole` 属性标记。
- 优点：无需新模型文件，参数全可调；与现有「在 JS 端预计算 target 数组」的写法完全一致。
- 缺点：山脉细节靠噪声调参，需要美术迭代。

### 4.2 方案二：预制 GLB 地形模型
- 用一个低模盆地地形 GLB，复用现有 `MeshSurfaceSampler` 采样为 `basinTarget`；门作为模型一部分或单独簇。
- 优点：形态可控、易做精致山形。缺点：需新增资源、模型与门数量耦合、不易随类别数动态变化。

### 4.3 方案三：双 Canvas / 区段独立场景
- `#projects` 用一套独立的 Three 场景（而非复用人像粒子）。
- 优点：解耦、互不影响。缺点：粒子「延续感」丢失（用户明确想要「转换」而非「重建」），且多一套生命周期管理；**不推荐**。

---

## 5. 详细技术设计（基于方案一）

### 5.1 新增 GPU 属性与 uniform（仅规划，未写入代码）
- 属性：`aBasinPosition (vec3)`、`aBasinNormal (vec3)`、`aRole (float: 0=地形,1=门)`、`aGateIndex (float)`。
- uniform：`uMorph2 (float 0→1)`、`uViewBlend (float 0→1，相机/旋转混合)`。
- shader 改动点：在现有 `finalPosition` 计算后追加 `mix(..., aBasinPosition, smoothstep(0,1,uMorph2))`；门粒子可在 `uMorph2` 后期叠加轻微「呼吸」发光。

### 5.2 目标点生成（JS 端，预计算一次）
- 在现有 `initParticles` 完成人像采样后，**额外**生成 `basinTargets`：
  - 地形粒子：在极坐标 `(r, θ)` 上分层撒点，按上面的 `y=f(r,θ)` 求高度。
  - 门粒子：`gateCount = deriveCategories(projects).length`；每门分配 `floor(gatePool/gateCount)` 个点，按拱门参数排布并平移到第 k 个方位。
- 类别推导（示例）：从 `content.projects[].tools/role` 归纳 → `["产品设计","数据分析","交互设计"]`，作为门的标签来源。

### 5.3 滚动与相机
- 新增 ScrollTrigger：`trigger: #projects, start: "top bottom", end: "top top", scrub`，驱动 `uMorph2` 0→1（即用户滚到 Projects 顶部前完成形变）。
- 相机过渡：复用 `lookAtTarget` + `camera.position`，在 `uViewBlend` 内从「人像正视」插值到「俯视盆地」（如 `position.y` 抬高、`lookAt` 指向盆地中心）。
- 与 `Projects` 自身 `pin` 协调：新增 trigger 放在 pin **之前**完成；统一 `ScrollTrigger.refresh()`，所有相关 trigger 设 `invalidateOnRefresh: true`，避免布局变化导致错位。

### 5.4 视觉与图层
- `mix-blend-difference` + `#0a0f1c` 背景下需实测门/山脊配色，必要时在 Projects 区临时切换 blend 或加深粒子亮度。
- 决策点：Projects 的卡片在粒子层（z-50）之下。可选 (a) 让粒子在 Projects 降透明度作背景氛围；(b) 卡片提层至粒子之上。建议 (a)，保持「盆地舞台」氛围。

### 5.5 门 ↔ 项目类别的交互（可选增强）
- 粒子层不可点击，如需点击进入类别，叠加透明 DOM 热区，按门的屏幕投影坐标定位（`Vector3.project(camera)`），hover 时提升对应 `aGateIndex` 粒子亮度。

---

## 6. 分阶段实验计划

| 阶段 | 实验内容 | 验证假设 | 成功判据 |
| --- | --- | --- | --- |
| E0 | 在独立 demo（复制 ThreePixelStarField 到临时页）跑通「单态星空→盆地」 | 程序化高度场能形成可辨识盆地+山脉 | 截图肉眼可辨碗状+外圈山墙 |
| E1 | 加入门粒子簇与方位排布 | 门可参数化、数量随类别变化 | 改 gateCount 即时生效 |
| E2 | 接入第二进度 `uMorph2` 与 `#projects` ScrollTrigger（仍在 demo） | 三态形变平滑、无闪烁 | 滚动录屏无跳变 |
| E3 | 相机俯视过渡 + blend/配色实测 | 盆地全貌在 Projects 背景下可读 | 对比度达标、帧率≥50fps |
| E4 | 移动端降级（减门、降粒子、关俯视） | 移动端稳定 | 中端机不卡顿 |
| E5 | 正式合入主组件（替换/扩展现有 shader 与 setupScroll） | 不破坏 Hero/About | 全站回归通过 |

> 调试建议：沿用仓库已有的逐帧截图方法（参考 `.debug-artifacts/hero-ring-*.png` 与 `debug-hero-ring-flash.md`），对 `uMorph2` 关键帧出图核对。

---

## 7. 风险与对策

| 风险 | 影响 | 对策 |
| --- | --- | --- |
| 粒子数不足以表现地形+门 | 山脊/门稀疏不可辨 | 提高 Projects 区有效粒子占比；或仅此区段临时增密 |
| `mix-blend-difference` 导致配色反相不可读 | 看不清盆地 | E3 实测，必要时区段切 blend 模式 |
| 新 trigger 与 Projects `pin` 冲突错位 | 形变与水平滚动打架 | 统一 refresh + `invalidateOnRefresh`，trigger 时序错开 |
| 闪烁（已有先例） | 体验破裂 | 复用逐帧截图调试法定位 |
| 移动端性能 | 卡顿/崩溃 | E4 降级策略 |

---

## 8. 不在本方案范围内
- 不修改现有 `ThreePixelStarField.tsx`、`Projects.tsx` 等任何源码（仅规划）。
- 不新增正式资源文件（方案一为程序化，无需 GLB）。
- 不改动 Hero/About 既有交互逻辑。

---

## 9. 下一步
确认采用方案一后，建议先在临时实验页（非主组件）完成 E0–E3，产出录屏与截图供评审；评审通过再进入 E5 合入。
