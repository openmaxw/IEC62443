# IEC 62443 工作流稳定性检查清单

## 1. 状态兼容
- 新增状态字段时，必须同时更新 `src/context/ProjectContext.jsx` 中的默认值、normalize、legacy compat。
- 所有数组字段必须通过 `ensureArray` 兜底。
- 所有对象字段必须通过 `ensureObject` 兜底。
- 本地存储升级后，旧缓存必须能安全加载。

## 2. 草稿同步
- 禁止在 `setState((prev) => ...)` 的 updater 中调用 Context action。
- 表单页草稿统一采用：本地 state 编辑，`useEffect` 同步到 Context。
- 任何 effect 同步若依赖对象，避免把不稳定引用（如 `actions` 整对象）放进依赖数组。

## 3. 页面前置条件
- 每个结果页必须在缺失前置数据时进入空态，而不是直接访问深层字段。
- 所有 `.map/.filter/.length` 前必须确认数据类型安全。
- 对象数组展示时，禁止直接渲染对象本身，必须取 `text/summary/title` 等明确字段。

## 4. 关键回归路径
- 新项目空白流程：Dashboard -> Owner -> Integrator -> Vendor -> Selection -> Gap -> Report
- 演示数据流程：加载演示数据后逐页打开所有主流程页面
- 刷新恢复：在 Owner / Integrator / Vendor 填写中途刷新页面，验证 draft 恢复
- 旧缓存兼容：保留旧 localStorage/sessionStorage 后启动，验证不崩溃

## 5. 视觉一致性
- 结果页统一使用深色半透明面板：`background: rgba(255,255,255,.03)`
- 卡片统一使用 `var(--color-border)` 和 `var(--radius-lg/md)`
- 新结果页上线前，至少对齐一个已稳定结果页（如 `VendorResult`）

## 6. 提交前快速检查
- 搜索 render-phase update 风险：`actions.set` + `setState((prev)`
- 搜索对象直接渲染风险：`<p>{item}</p>`、`join('；')` 等
- 搜索新字段兼容风险：ProjectContext 中是否已补齐 normalize / default / legacy compat
