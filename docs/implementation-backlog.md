# IEC 62443 协同工作台实施任务清单（按开发优先级拆分）

## 1. 使用说明

本清单基于当前系统页面结构与 `docs/system-flow-redesign.md` 的重构建议整理，目标是：

- 优先复用已有页面与状态结构
- 先打通主工作流，再逐步增强解释层与交付层
- 将任务拆分为可执行的前端改造 backlog
- 使每个阶段都能形成可演示、可验证的中间版本

建议实施原则：
- 先补主链路，再补增强页
- 先补状态流转，再补解释文案
- 先保证“项目推进闭环”，再优化“学习与展示体验”

---

## 2. 开发阶段总览

建议拆为 4 个实施阶段：

### P0：打通项目主工作流
目标：恢复真正可推进的项目流程骨架。

### P1：强化设计分配与设备对照
目标：让系统更像 IEC 62443 协同设计工具，而不是静态演示页。

### P2：补齐差距闭环与追溯中心
目标：形成“要求 -> 设计 -> 能力 -> 差距 -> 补偿”的完整闭环。

### P3：完善交付中心与解释层
目标：增强交付包、专家可读性和学习辅助体验。

---

## 3. P0：打通项目主工作流（最高优先级）

## 3.1 任务组：恢复 Dashboard 为真实工作台

### 目标
将 `/dashboard` 从重定向页恢复为项目主控页。

### 涉及文件
- `src/pages/Dashboard/Dashboard.jsx`
- `src/pages/Dashboard/Dashboard.module.css`
- `src/hooks/useProject.js`
- `src/context/ProjectContext.jsx`

### 任务项
- 替换当前重定向逻辑，渲染真实 Dashboard 页面
- 展示项目基础信息摘要
- 增加项目阶段进度条
- 增加“缺失输入提醒”模块
- 增加“下一步建议动作”模块
- 增加“最新交付物”模块
- 汇总 owner / integrator / vendor / selection 的完成状态

### 完成标志
- 用户进入 `/dashboard` 可以看到项目状态总览
- 系统能明确提示当前缺少哪些输入
- 用户能从 Dashboard 进入下一步页面

### 优先级
`P0-1`

---

## 3.2 任务组：恢复 Owner Result 为正式交接物页

### 目标
让业主阶段形成独立可交接成果，而不是回跳输入页。

### 涉及文件
- `src/pages/Owner/OwnerResult.jsx`
- `src/pages/Owner/OwnerResult.module.css`
- `src/pages/Owner/OwnerInterview.jsx`
- `src/hooks/useProject.js`

### 任务项
- 替换当前重定向逻辑，渲染真实结果页
- 输出项目背景与范围摘要
- 输出关键资产与关键约束摘要
- 输出后果驱动和风险关注摘要
- 输出远程接入 / 第三方接入约束
- 输出待集成商确认事项
- 在业主页完成后可跳转到结果页

### 完成标志
- 业主填写完成后可获得一页结构化交接摘要
- 集成商可把该页作为后续设计输入查看

### 优先级
`P0-2`

---

## 3.3 任务组：补强项目元数据与阶段状态管理

### 目标
把“单页面数据录入”升级为“项目阶段化推进状态”。

### 涉及文件
- `src/context/ProjectContext.jsx`
- `src/context/projectContextInstance.js`
- `src/hooks/useProject.js`
- `src/data/deliverables.js`
- `src/data/viewModes.js`

### 任务项
- 在 project state 中加入阶段状态字段
- 增加 owner / integrator / vendor / gap / report 完成标志
- 增加“缺失输入检查”工具函数
- 增加“推荐下一步”计算逻辑
- 统一 Dashboard、Report、Translation Center 的状态读取方式

### 完成标志
- 系统可以根据已有数据判断项目处于哪个阶段
- 多页面可以共享一致的完成度状态

### 优先级
`P0-3`

---

## 3.4 任务组：梳理主导航与入口跳转

### 目标
让用户从页面结构上感受到“项目流程”，而不是“孤立功能页”。

### 涉及文件
- `src/App.jsx`
- `src/components/Layout/Header.jsx`
- `src/components/Layout/Header.module.css`
- `src/pages/Landing/Landing.jsx`
- `src/pages/Home/Home.jsx`

### 任务项
- 重新梳理 Header 导航分组
- 增加 Dashboard 入口
- 调整 Landing / Home 的入口表达
- 让主链路更清晰：Owner -> Integrator -> Vendor -> Selection/Gap -> Report
- 为每个阶段增加更明确的 CTA 按钮文案

### 完成标志
- 用户能清楚知道当前处于哪个阶段、下一步去哪里

### 优先级
`P0-4`

---

## 4. P1：强化设计分配与设备对照

## 4.1 任务组：扩展 Owner 输入维度

### 目标
把 `/owner` 从风险问卷升级为“项目场景与约束输入页”。

### 涉及文件
- `src/pages/Owner/OwnerInterview.jsx`
- `src/pages/Owner/OwnerInterview.module.css`
- `src/data/industries.js`
- `src/utils/riskEngine.js`
- `src/hooks/useRiskAssessment.js`

### 任务项
- 增加关键资产清单输入
- 增加关键系统/角色输入
- 增加外部连接方式输入
- 增加维护接入方式输入
- 增加初始网络边界描述输入
- 增加工艺连续性和安全/环保/合规后果细化项
- 调整页面结构为 4 个分组模块

### 完成标志
- 业主输入足以支撑后续 Zone/Conduit 设计

### 优先级
`P1-1`

---

## 4.2 任务组：强化 Integrator Workspace 为设计工作台

### 目标
让 `/integrator` 体现“设计依据 + 要求分配 + 通信设计”。

### 涉及文件
- `src/pages/Integrator/IntegratorWorkspace.jsx`
- `src/pages/Integrator/IntegratorWorkspace.module.css`
- `src/utils/planningEngine.js`
- `src/utils/designInputEngine.js`
- `src/data/zones.js`
- `src/data/rules.js`

### 任务项
- 增加资产归组到 zone 的说明字段
- 增加 conduit 建立原因字段
- 增加通信用途、方向、必要性说明字段
- 增加边界控制建议字段
- 增加 zone / conduit 目标要求候选展示
- 增加“待设备商确认要求项”列表
- 强化从 Owner 输入到 Integrator 设计的映射关系

### 完成标志
- 集成商页面不仅有结果，还能解释为什么这样设计

### 优先级
`P1-2`

---

## 4.3 任务组：强化 Integrator Result 为要求分配页

### 目标
把集成结果页从展示页升级为正式“设计输出页”。

### 涉及文件
- `src/pages/Integrator/IntegratorResult.jsx`
- `src/pages/Integrator/IntegratorResult.module.css`
- `src/utils/planningEngine.js`
- `src/data/deliverables.js`

### 任务项
- 增加 zone 目标要求摘要
- 增加 conduit 控制要求摘要
- 增加系统级要求清单
- 增加组件级能力需求清单
- 增加风险保留项展示
- 增加“需要设备商确认的能力项”区域
- 保留并增强“业主需求—设计响应”匹配表

### 完成标志
- 集成结果页可作为设计与选型的正式输入

### 优先级
`P1-3`

---

## 4.4 任务组：强化 Vendor 页为项目要求对照声明

### 目标
把 `/vendor` 从“产品能力维护页”升级为“围绕项目要求的符合性声明页”。

### 涉及文件
- `src/pages/Vendor/VendorCapability.jsx`
- `src/pages/Vendor/VendorCapability.module.css`
- `src/data/capabilities.js`
- `src/data/matchStatuses.js`
- `src/utils/matchEngine.js`

### 任务项
- 默认优先展示项目要求项，而不是全量能力项
- 每项要求显示来源与说明
- 统一满足状态为：满足 / 部分满足 / 不满足 / 需外部补偿 / 不适用
- 增加“由产品实现 / 由外部系统实现”的区分
- 增加证据、依赖、适用边界、已知限制字段联动
- 优化表格结构，让“项目要求对照”更明显

### 完成标志
- 设备商能围绕项目要求逐项声明，而不是泛泛录入产品画像

### 优先级
`P1-4`

---

## 4.5 任务组：强化 Vendor Result 为设备符合性结果页

### 目标
输出真正可供项目决策使用的设备符合性摘要。

### 涉及文件
- `src/pages/Vendor/VendorResult.jsx`
- `src/pages/Vendor/VendorResult.module.css`
- `src/utils/matchPresentation.js`

### 任务项
- 增加项目要求满足度总览
- 增加部分满足项列表
- 增加不满足项列表
- 增加需外部补偿项列表
- 增加已知限制项和依赖项摘要
- 增加证据摘要模块

### 完成标志
- 设备结果页可直接被选型和差距分析页引用

### 优先级
`P1-5`

---

## 5. P2：补齐差距闭环与追溯中心

## 5.1 任务组：强化 Selection 为差距分析中心

### 目标
弱化“打分展示”，强化“差距识别与处置建议”。

### 涉及文件
- `src/pages/Selection/SelectionMatrix.jsx`
- `src/pages/Selection/SelectionMatrix.module.css`
- `src/utils/matchEngine.js`
- `src/utils/matchPresentation.js`

### 任务项
- 降低总体百分比的页面权重
- 增加差距项清单
- 增加差距严重度分层
- 增加是否可通过补偿措施关闭的判断
- 增加责任归属建议
- 增加验收影响提示
- 增加推荐处置动作

### 完成标志
- Selection 页面成为“差距与候选方案比较中心”

### 优先级
`P2-1`

---

## 5.2 任务组：新增 Gap / Mitigation 页面

### 目标
新增闭环页承接不满足项、补偿措施和残余风险。

### 建议路由
- `/gap`
- 或 `/mitigation`

### 建议新增文件
- `src/pages/Gap/GapCenter.jsx`
- `src/pages/Gap/GapCenter.module.css`
- `src/utils/gapEngine.js`
- `src/data/residualRisk.js`（如需要）

### 任务项
- 汇总来自 Selection / Vendor Result 的差距项
- 增加补偿措施录入与展示
- 增加责任归属字段
- 增加验收影响字段
- 增加残余风险登记字段
- 支持从 Gap 页面回写 Report Center

### 完成标志
- 系统具备完整的“差距 -> 补偿 -> 风险保留”闭环能力

### 优先级
`P2-2`

---

## 5.3 任务组：强化 Translation Center 为追溯链中心

### 目标
展示“需求如何一步步转化为设计、能力与差距”的完整追溯链。

### 涉及文件
- `src/pages/TranslationCenter/TranslationCenter.jsx`
- `src/pages/TranslationCenter/TranslationCenter.module.css`
- `src/utils/reportGenerator.js`

### 任务项
- 将当前摘要表扩展为 4 层追溯结构
- 展示业务输入 -> 风险关注 -> 设计响应 -> 能力/差距状态
- 支持显示 requirement source
- 支持显示 zone / conduit / capability 的映射关系
- 增加缺口项在追溯链中的可见性

### 完成标志
- Translation Center 可作为解释层与专家复核入口

### 优先级
`P2-3`

---

## 6. P3：完善交付中心与解释层

## 6.1 任务组：强化 Report Center 为交付包中心

### 目标
从“ready/not ready 清单”升级为“可交付章节化中心”。

### 涉及文件
- `src/pages/Report/ReportCenter.jsx`
- `src/pages/Report/ReportCenter.module.css`
- `src/utils/reportGenerator.js`
- `src/data/deliverables.js`

### 任务项
- 重新组织交付章节结构
- 增加项目背景与范围摘要
- 增加资产与连接识别摘要
- 增加 Zone / Conduit 摘要
- 增加通信矩阵摘要
- 增加要求分配表摘要
- 增加设备符合性摘要
- 增加差距与补偿措施摘要
- 增加残余风险与验收关注点摘要

### 完成标志
- Report 页面本身就能作为演示级交付包浏览入口

### 优先级
`P3-1`

---

## 6.2 任务组：优化 Learning 模式与主流程联动

### 目标
保留学习价值，但不打断主工作流。

### 涉及文件
- `src/pages/Learning/LearningMode.jsx`
- `src/pages/Learning/LearningMode.module.css`
- `src/data/disclaimer.js`
- `src/data/enums.js`

### 任务项
- 增加从各主流程页面跳转到对应知识点的入口
- 为 FR / SL / Zone / Conduit / 角色关系补充解释映射
- 让学习模式更像“辅助解释层”而不是独立流程页

### 完成标志
- 用户在主流程中能按需查看概念解释，但不会脱离项目上下文

### 优先级
`P3-2`

---

## 7. 横向支撑任务（贯穿多个阶段）

## 7.1 状态模型整理

### 目标
避免页面各自持有孤立状态，统一项目对象模型。

### 任务项
- 统一 owner / integrator / vendor / selection / gap 数据结构
- 为 deliverables 增加统一计算逻辑
- 抽离缺失输入检查和阶段状态推导函数

### 优先级
`Cross-1`

---

## 7.2 规则引擎表达优化

### 目标
把系统表达从“自动目标等级候选”调整为“候选要求与解释链”。

### 涉及文件
- `src/utils/riskEngine.js`
- `src/utils/planningEngine.js`
- `src/utils/designInputEngine.js`
- `src/utils/matchEngine.js`

### 任务项
- 统一“SL / target level / requirement strength”的文案口径
- 增加要求来源说明
- 增加推荐项与人工确认项的区分
- 增加补偿措施触发条件

### 优先级
`Cross-2`

---

## 7.3 文案与术语统一

### 目标
让产品在专家视角下更专业，减少误导。

### 任务项
- 将“目标等级候选”统一调整为“目标等级候选 / 要求建议”
- 将“合规”表达调整为“辅助分析 / 需求分配 / 能力核对”
- 统一三方角色命名
- 统一 deliverable 命名

### 优先级
`Cross-3`

---

## 8. 推荐实施顺序（可直接作为 Sprint 划分）

## Sprint 1
- `P0-1` 恢复 Dashboard
- `P0-2` 恢复 Owner Result
- `P0-3` 补强项目状态管理
- `P0-4` 梳理主导航

## Sprint 2
- `P1-1` 扩展 Owner 输入
- `P1-2` 强化 Integrator Workspace
- `P1-3` 强化 Integrator Result

## Sprint 3
- `P1-4` 强化 Vendor Capability
- `P1-5` 强化 Vendor Result
- `P2-1` 强化 Selection

## Sprint 4
- `P2-2` 新增 Gap / Mitigation 页面
- `P2-3` 强化 Translation Center

## Sprint 5
- `P3-1` 强化 Report Center
- `P3-2` 优化 Learning 联动
- `Cross-2` / `Cross-3` 统一规则表达与术语

---

## 9. 最小可行改造路径（MVP）

如果你希望先用最少改动验证方向，建议先做以下 6 项：

- 恢复 `Dashboard`
- 恢复 `OwnerResult`
- 扩展 `OwnerInterview` 的资产与连接输入
- 强化 `IntegratorWorkspace` 的设计依据说明
- 强化 `VendorCapability` 的项目要求对照逻辑
- 强化 `Selection` 的差距分析展示

完成这 6 项后，系统就会从“演示原型”明显升级为“项目协同原型”。

---

## 10. 结论

按开发优先级来看，当前系统最值得优先投入的不是视觉层，而是：

- 恢复项目主工作流
- 强化设计依据和要求分配
- 强化设备对照与差距闭环
- 最后再完善交付中心与学习层

一句话总结：

> 先把系统做成“能推进项目”的协同工作台，再把它做成“讲得更清楚”的 IEC 62443 解释平台。

