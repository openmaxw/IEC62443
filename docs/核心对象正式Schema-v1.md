# 核心对象正式 Schema v1

## 1. 目的

本文档定义当前项目最关键的三个正式业务对象：

- `OwnerAssessment`
- `IntegratorPlan`
- `SelectionResults`

目标不是“描述页面上现在碰巧用了哪些字段”，而是定义：

- 哪些字段是正式字段；
- 字段类型是什么；
- 默认值应该是什么；
- 哪些字段允许为空；
- 哪些页面应当消费这些对象。

这三个对象确定后，后续的 `normalize`、`selector`、`view model` 才有稳定基线。

---

## 2. 统一约定

### 2.1 空值约定

- 列表字段默认值统一为 `[]`
- 文本字段默认值统一为 `''`
- 枚举字段默认值统一为 `''`
- 嵌套对象默认值统一为 `null` 或标准空对象，不能是“半空半缺”
- 页面层不得自行发明默认值

### 2.2 阶段约定

- 编辑页主要读 `draft`
- 结果页主要读正式结果对象
- 正式结果对象必须经过 normalize 后才能进入页面消费

### 2.3 页面消费约定

- 页面不直接依赖原始 context 深层字段
- 页面通过 selector 获取 normalized object 或 view model
- 页面不承担 schema 修补责任

---

## 3. `OwnerAssessment`

### 3.1 对象语义

表示业主侧的正式需求输入结果，是风险翻译与后续集成设计的直接上游。

### 3.2 使用位置

- 编辑来源：`src/pages/Owner/OwnerInterview.jsx`
- 结果消费：`src/pages/Owner/OwnerResult.jsx`
- 下游依赖：风险画像生成、集成设计依据摘要、项目进度判断

### 3.3 正式字段

```ts
interface OwnerAssessment {
  projectName: string;
  industry: string;

  safetyImpact: 'low' | 'medium' | 'high' | '';
  environmentalImpact: 'low' | 'medium' | 'high' | '';
  productionImpact: 'low' | 'medium' | 'high' | '';
  qualityImpact: 'low' | 'medium' | 'high' | '';
  financialImpact: 'low' | 'medium' | 'high' | '';
  complianceImpact: 'low' | 'medium' | 'high' | '';
  brandImpact: 'low' | 'medium' | 'high' | '';

  remoteAccessNeed: 'none' | 'limited' | 'extensive' | '';
  thirdPartyAccess: 'none' | 'occasional' | 'regular' | '';
  itOtIntegration: 'low' | 'moderate' | 'high' | '';

  networkSegmentationMaturity: 'low' | 'medium' | 'high' | '';
  identityMaturity: 'low' | 'medium' | 'high' | '';
  loggingMaturity: 'low' | 'medium' | 'high' | '';
  patchMaturity: 'low' | 'medium' | 'high' | '';

  maintenanceWindow: string;
  upgradeWindow: string;
  remoteOperationsOwnership: 'owner' | 'vendor' | 'shared' | '';
  acceptancePreference: 'security-first' | 'availability-first' | 'balanced' | '';

  criticalAssets: string[];
  keySystems: string;
  externalConnections: string;
  maintenanceAccessPath: string;
  initialBoundaryNotes: string;
  continuityRequirements: string;
  complianceNotes: string;
}
```

### 3.4 默认值规范

```ts
const EMPTY_OWNER_ASSESSMENT: OwnerAssessment = {
  projectName: '',
  industry: '',
  safetyImpact: '',
  environmentalImpact: '',
  productionImpact: '',
  qualityImpact: '',
  financialImpact: '',
  complianceImpact: '',
  brandImpact: '',
  remoteAccessNeed: '',
  thirdPartyAccess: '',
  itOtIntegration: '',
  networkSegmentationMaturity: '',
  identityMaturity: '',
  loggingMaturity: '',
  patchMaturity: '',
  maintenanceWindow: '',
  upgradeWindow: '',
  remoteOperationsOwnership: '',
  acceptancePreference: '',
  criticalAssets: [],
  keySystems: '',
  externalConnections: '',
  maintenanceAccessPath: '',
  initialBoundaryNotes: '',
  continuityRequirements: '',
  complianceNotes: ''
};
```

### 3.5 强约束

- `criticalAssets` 必须始终为数组
- 所有影响等级字段必须始终为枚举或空字符串
- 文本字段即使未填写，也必须是空字符串而不是 `undefined`
- `assessment` 一旦进入结果页，不能再出现半结构对象

### 3.6 当前主要风险

当前风险不是对象不存在，而是：

- 有的页面假设 `criticalAssets` 一定存在；
- 有的页面自己用 `|| []` 兜底；
- 这说明 `OwnerAssessment` 还不是强对象，只是“弱对象”。

目标是把它变成强对象。

---

## 4. `IntegratorPlan`

### 4.1 对象语义

表示集成商侧的正式设计结果，是厂商能力核对与闭环的直接输入。

### 4.2 使用位置

- 编辑来源：`src/pages/Integrator/IntegratorWorkspace.jsx`
- 结果消费：`src/pages/Integrator/IntegratorResult.jsx`
- 下游依赖：厂商结果、匹配分析、交付汇总、项目进度判断

### 4.3 正式字段

```ts
interface IntegratorAsset {
  id: string;
  name: string;
  zone: string;
  role: string;
  groupingReason: string;
}

interface CommunicationFlow {
  id: string;
  source: string;
  target: string;
  protocol: string;
  direction: string;
  necessity: string;
  businessReason: string;
  boundaryControl: string;
}

interface CapabilityRequirement {
  id: string;
  capabilityId: string;
  controlObjective: string;
  implementationHint: string;
  sourceFR?: string[];
  targetSL?: number | string;
  requirementLevel?: string;
  traceability?: {
    inputConditions?: string[];
    riskConcerns?: string[];
  };
}

interface DesignBasisSummary {
  keySystems: string;
  externalConnections: string;
  maintenanceAccessPath: string;
  initialBoundaryNotes: string;
  continuityRequirements: string;
  designBasis: string;
}

interface IntegratorPlan {
  targetSL: number | string | null;
  designBasis: string;
  zones: string[];
  conduits: string[];
  assets: IntegratorAsset[];
  communicationFlows: CommunicationFlow[];
  capabilityRequirements: CapabilityRequirement[];
  designBasisSummary: DesignBasisSummary | null;
  communicationMatrix?: {
    complete: boolean;
    missingFields: string[];
    rows: Array<Record<string, unknown>>;
  } | null;
}
```

### 4.4 默认值规范

```ts
const EMPTY_INTEGRATOR_PLAN: IntegratorPlan = {
  targetSL: null,
  designBasis: '',
  zones: [],
  conduits: [],
  assets: [],
  communicationFlows: [],
  capabilityRequirements: [],
  designBasisSummary: {
    keySystems: '',
    externalConnections: '',
    maintenanceAccessPath: '',
    initialBoundaryNotes: '',
    continuityRequirements: '',
    designBasis: ''
  },
  communicationMatrix: null
};
```

### 4.5 强约束

- `zones`、`conduits`、`assets`、`communicationFlows`、`capabilityRequirements` 必须永远是数组
- `designBasisSummary` 不能在页面消费阶段表现为“有时是对象，有时是 undefined”
- `targetSL` 可以为空，但其空值必须统一为 `null`
- 正式结果页只能读取 normalized `IntegratorPlan`

### 4.6 当前主要风险

这次报错已经证明：

- `plan` 存在，不代表 `plan.assets`、`plan.zones` 等字段一定存在；
- 页面层直接 `.length` / `.map` 是高风险模式；
- 只要 `IntegratorPlan` 没做对象级 normalize，同类问题会重复出现。

---

## 5. `SelectionResults`

### 5.1 对象语义

表示能力匹配与选型阶段的正式分析结果，是闭环与交付汇总的核心依据。

### 5.2 使用位置

- 编辑/生成来源：`src/pages/Selection/SelectionMatrix.jsx`
- 下游依赖：闭环页、交付中心、项目进度判断

### 5.3 正式字段

结合当前页面与上下游使用方式，建议定义：

```ts
interface SelectionResultRow {
  id: string;
  capabilityId: string;
  controlObjective: string;
  status: 'native' | 'configured' | 'external' | 'compensating' | 'missing' | '';
  evidenceType: string;
  gapNote: string;
  severity: 'low' | 'medium' | 'high' | '';
  owner: string;
}

interface SelectionResultSummary {
  native: number;
  configured: number;
  external: number;
  compensating: number;
  missing: number;
  overallScore?: number;
}

interface SelectionResults {
  results: SelectionResultRow[];
  summary: SelectionResultSummary;
}
```

### 5.4 默认值规范

```ts
const EMPTY_SELECTION_RESULTS: SelectionResults = {
  results: [],
  summary: {
    native: 0,
    configured: 0,
    external: 0,
    compensating: 0,
    missing: 0,
    overallScore: 0
  }
};
```

### 5.5 强约束

- `results` 必须始终为数组
- `summary` 必须始终为完整对象
- `status` 与 `severity` 必须始终受控于枚举
- 闭环页不得直接处理“可能不存在的结果集合”

### 5.6 当前主要风险

从 `useProject.js` 和选择阶段逻辑看，当前存在：

- `state.selectionAnalysis?.results?.results`
- `state.matchResults?.results`

这说明结果对象的正式结构和 legacy 结构仍在并行。

风险是：

- 页面作者不清楚 `SelectionResults` 的正式入口到底是哪一个；
- 逻辑层必须不断写回退兼容；
- 一旦某页忘记兼容，就会出现空态混乱或运行时错误。

---

## 6. 这三个对象的关系

建议把主链路明确为：

```ts
OwnerAssessment
  -> RiskProfile
  -> IntegratorPlan
  -> VendorCapabilities
  -> SelectionResults
  -> GapClosureItems
  -> DeliverableReports
```

这条链路里，三者职责分别是：

- `OwnerAssessment`：定义需求输入
- `IntegratorPlan`：定义设计响应
- `SelectionResults`：定义能力满足度与差距

如果这三个对象的 schema 不稳定，后续所有页面都会持续被连带污染。

---

## 7. 建议的代码落点

### 7.1 新建 domain/schema 文件

建议新增：

- `src/domain/schema/ownerAssessment.js`
- `src/domain/schema/integratorPlan.js`
- `src/domain/schema/selectionResults.js`

每个文件至少包含：

- 空对象常量
- normalize 函数
- 可选的 isValid / hasMinimumContent 函数

### 7.2 在状态中心收口 normalize

建议把 `src/context/ProjectContext.jsx` 中当前的轻量 normalize，升级为对象级 normalize：

- `normalizeOwnerProfile()` 内调用 `normalizeOwnerAssessment()`
- `normalizeIntegratorDesign()` 内调用 `normalizeIntegratorPlan()`
- `normalizeSelectionAnalysis()` 内调用 `normalizeSelectionResults()`

### 7.3 在 hooks 层收口 selector

建议后续把：

- `useOwnerPath()`
- `useIntegratorPath()`
- `useVendorPath()`

升级为：

- 返回 normalized object
- 或直接返回 page view model

这样页面层可以逐步退出数据清洗职责。

---

## 8. v1 的判定标准

这份 schema v1 生效后，至少要满足：

- 页面不再因为数组字段缺失而崩溃
- 结果页不再依赖页面内临时兜底
- hooks 输出的数据形状对页面作者是可预测的
- 新增页面时，开发者知道应该依赖哪一个正式对象

做到这一步，系统才算开始从“代码统一”进入“契约统一”。

## 9. 与当前代码的直接对应

当前最适合先替换的三个入口：

- `src/context/ProjectContext.jsx`：把轻量 `normalizeXxx` 升级为对象级 normalize
- `src/hooks/useProject.js`：把路径型 hooks 升级为 normalized selector
- `src/pages/*/Result.jsx`：优先切换到 selector / view model，停止页面内临时兜底

推荐首批改造顺序：

1. `OwnerAssessment`
2. `IntegratorPlan`
3. `SelectionResults`

原因：它们分别位于需求、设计、闭环三段主链路，一旦收口，能明显降低后续页面随机崩溃概率。
