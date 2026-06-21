# 首屏圆环入场修正 Spec

## Why
当前首屏圆环文字在页面初次渲染时仍会先出现在屏幕中央，再执行后续动画，和用户期待的“从右上角被引力拉入中心并入轨”不一致。需要修正首帧渲染与动画接管时机，避免中心闪现。

## What Changes
- 修正首屏圆环的初始渲染位置，使其在首次可见时位于右上角外侧
- 调整首屏入场动画的触发方式，确保浏览器首帧不会先渲染中心位置
- 保留现有“入轨”观感，但避免文字或圆环在中心提前出现
- 增加实现后的自检步骤，确认真实效果与 spec 一致

## Impact
- Affected specs: 首屏 Hero 动画、CircularText 入场表现
- Affected code: `portfolio/src/components/Hero.tsx`、`portfolio/src/components/CircularText.tsx`、`portfolio/src/components/CircularText.css`

## ADDED Requirements
### Requirement: 首屏圆环从右上角首次可见入场
系统 SHALL 在页面首次可见时让首屏圆环从右上角区域进入视口，而不是先在中心显示。

#### Scenario: 首次进入页面
- **WHEN** 用户首次打开首页或刷新页面
- **THEN** 圆环首次可见的位置位于屏幕右上角或右上角外侧
- **AND** 圆环不会先在屏幕中心闪现一帧

### Requirement: 入场动画由首帧前状态接管
系统 SHALL 在首帧绘制前完成首屏圆环的初始隐藏、位移、缩放或旋转状态设置。

#### Scenario: 浏览器首次绘制
- **WHEN** 首页 Hero 区域开始首次渲染
- **THEN** 动画元素已经带有右上角入场所需的初始状态
- **AND** 后续动画从该初始状态自然过渡到中心轨道

## MODIFIED Requirements
### Requirement: 首屏圆环入轨表现
系统 SHALL 保持首屏圆环被引力拉向中心并逐步入轨的视觉目标，但入场起点必须明确来自右上角，且不得以中心位置作为首次可见状态。

## REMOVED Requirements
### Requirement: 中心首帧可见的默认布局表现
**Reason**: 默认布局导致用户先看到圆环在中心出现，破坏“从右上角被捕获入场”的连续感。
**Migration**: 将默认中心布局改为仅负责居中容器，真实动画元素需在首次绘制前设置为右上角入场初始态。
