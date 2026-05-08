import { useContext } from 'react';
import { ProjectContext } from '../context/projectContextInstance';

const STAGES = [
  { id: 'project', label: '项目建立', route: '/owner' },
  { id: 'owner', label: '业主输入', route: '/owner' },
  { id: 'integrator', label: '集成设计', route: '/integrator' },
  { id: 'vendor', label: '设备声明', route: '/vendor' },
  { id: 'selection', label: '闭环', route: '/selection' },
  { id: 'report', label: '交付汇总', route: '/report' }
];

const OWNER_SUBSTEPS = [
  { id: '01-01', label: '项目场景', done: (state) => isFilled(state.projectMeta?.projectName) && isFilled(state.projectMeta?.industry) },
  { id: '01-02', label: '业务后果', done: (state) => { const assessment = ensureObject(state.ownerProfile?.assessment ?? state.ownerAssessment, null); return Boolean(assessment?.safetyImpact && assessment?.environmentalImpact && assessment?.productionImpact); } },
  { id: '01-03', label: '暴露面', done: (state) => { const assessment = ensureObject(state.ownerProfile?.assessment ?? state.ownerAssessment, null); return Boolean(assessment?.remoteAccessNeed && assessment?.thirdPartyAccess); } },
  { id: '01-04', label: '现状基础', done: (state) => { const assessment = ensureObject(state.ownerProfile?.assessment ?? state.ownerAssessment, null); return Boolean(assessment?.networkSegmentationMaturity && assessment?.identityMaturity && assessment?.loggingMaturity && assessment?.patchMaturity); } },
  { id: '01-05', label: '约束与对象', done: (state) => { const assessment = ensureObject(state.ownerProfile?.assessment ?? state.ownerAssessment, null); return Boolean(assessment?.criticalAssets?.length && assessment?.keySystems && assessment?.externalConnections); } }
];

const INTEGRATOR_SUBSTEPS = [
  { id: '02-01', label: '设计依据', done: (state) => isFilled(state.integratorDesign?.draft?.designBasis ?? state.integratorDesign?.plan?.designBasis) },
  { id: '02-02', label: '分区与通道', done: (state) => { const plan = ensureObject(state.integratorDesign?.draft ?? state.integratorPlan ?? state.integratorDesign?.plan, null); return Boolean(plan?.zones?.length && plan?.conduits?.length); } },
  { id: '02-03', label: '资产归组', done: (state) => { const plan = ensureObject(state.integratorDesign?.draft ?? state.integratorPlan ?? state.integratorDesign?.plan, null); return Boolean(plan?.assets?.length); } },
  { id: '02-04', label: '跨区通信', done: (state) => { const plan = ensureObject(state.integratorDesign?.draft ?? state.integratorPlan ?? state.integratorDesign?.plan, null); return Boolean(plan?.communicationFlows?.length); } },
  { id: '02-05', label: '设计校核', done: (state) => { const plan = ensureObject(state.integratorDesign?.plan ?? state.integratorPlan, null); return Boolean(plan?.capabilityRequirements?.length); } }
];

const VENDOR_SUBSTEPS = [
  { id: '03-01', label: '产品信息', done: (state) => { const draft = ensureObject(state.vendorCatalog?.draft, null); return Boolean(draft?.productMeta?.productName && draft?.productMeta?.productType && draft?.productMeta?.deploymentScope); } },
  { id: '03-02', label: '能力声明', done: (state) => { const draft = ensureObject(state.vendorCatalog?.draft, null); return Boolean(draft?.capabilityClaims?.length); } },
  { id: '03-03', label: '边界与依赖', done: (state) => { const draft = ensureObject(state.vendorCatalog?.draft, null); return Boolean(draft?.dependencies || draft?.capabilityClaims?.some((item) => item.claimScope || item.dependencyNote)); } },
  { id: '03-04', label: '证据与限制', done: (state) => { const draft = ensureObject(state.vendorCatalog?.draft, null); return Boolean(draft?.capabilityClaims?.some((item) => item.evidenceType) || draft?.limitations); } },
  { id: '03-05', label: '声明汇总', done: (state) => { const capabilities = ensureArray(state.vendorCatalog?.capabilities ?? state.vendorCapabilities); return Boolean(capabilities.length); } }
];

const SELECTION_SUBSTEPS = [
  { id: '04-01', label: '匹配结果总览', done: (state) => Boolean(state.selectionAnalysis?.results?.results?.length || state.matchResults?.results?.length) },
  { id: '04-02', label: '待闭环项', done: (state) => { const rows = ensureArray(state.selectionAnalysis?.results?.results ?? state.matchResults?.results); return rows.some((item) => item.status === 'missing' || item.status === 'external' || item.status === 'partial'); } },
  { id: '04-03', label: '补偿措施', done: (state) => { const items = ensureArray(state.gapClosure?.items ?? state.gapClosureItems); return items.some((item) => isFilled(item.mitigation)); } },
  { id: '04-04', label: '验收与风险', done: (state) => { const items = ensureArray(state.gapClosure?.items ?? state.gapClosureItems); return items.some((item) => isFilled(item.acceptanceImpact) || isFilled(item.residualRisk) || isFilled(item.owner)); } },
  { id: '04-05', label: '闭环确认', done: (state) => { const rows = ensureArray(state.selectionAnalysis?.results?.results ?? state.matchResults?.results).filter((item) => item.status === 'missing' || item.status === 'external' || item.status === 'partial'); const items = ensureArray(state.gapClosure?.items ?? state.gapClosureItems); return rows.length === 0 || items.length >= rows.length; } }
];

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function ensureObject(value, fallback = null) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback;
}

function isNonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0;
}

function isFilled(value) {
  return typeof value === 'string' ? Boolean(value.trim()) : Boolean(value);
}

function getSubstepProgress(state, definitions) {
  const items = definitions.map((item) => ({ ...item, completed: Boolean(item.done(state)) }));
  return {
    items,
    completed: items.filter((item) => item.completed).length,
    total: items.length
  };
}

function getStageStatus(state) {
  const projectMeta = ensureObject(state.projectMeta, {}) || {};
  const assessment = ensureObject(state.ownerProfile?.assessment ?? state.ownerAssessment, null);
  const riskProfile = ensureObject(state.riskTranslation?.profile ?? state.riskProfile, null);
  const plan = ensureObject(state.integratorDesign?.plan ?? state.integratorPlan, null);
  const capabilities = ensureArray(state.vendorCatalog?.capabilities ?? state.vendorCapabilities);
  const matchResults = ensureObject(state.selectionAnalysis?.results ?? state.matchResults, null);

  return {
    project: isFilled(projectMeta.projectName) && isFilled(projectMeta.industry),
    owner: Boolean(assessment && riskProfile),
    integrator: Boolean(plan && isNonEmptyArray(plan.zones)),
    vendor: isNonEmptyArray(capabilities),
    selection: Boolean(matchResults && isNonEmptyArray(matchResults.results)),
    report: Boolean(riskProfile && plan)
  };
}

function getMissingInputs(state) {
  const projectMeta = ensureObject(state.projectMeta, {}) || {};
  const assessment = ensureObject(state.ownerProfile?.assessment ?? state.ownerAssessment, null);
  const riskProfile = ensureObject(state.riskTranslation?.profile ?? state.riskProfile, null);
  const plan = ensureObject(state.integratorDesign?.plan ?? state.integratorPlan, null);
  const capabilities = ensureArray(state.vendorCatalog?.capabilities ?? state.vendorCapabilities);
  const matchResults = ensureObject(state.selectionAnalysis?.results ?? state.matchResults, null);
  const gapClosureItems = ensureArray(state.gapClosure?.items);
  const gapRows = ensureArray(matchResults?.results).filter((item) => item.status === 'missing' || item.status === 'external' || item.status === 'partial');
  const items = [];

  if (!isFilled(projectMeta.projectName)) items.push({ id: 'project-name', label: '在业主步骤补充项目名称', route: '/owner' });
  if (!isFilled(projectMeta.industry)) items.push({ id: 'project-industry', label: '在业主步骤补充行业/场景', route: '/owner' });
  if (!isFilled(projectMeta.organizationName)) items.push({ id: 'project-organization', label: '在业主步骤补充业主单位', route: '/owner' });
  if (!isFilled(projectMeta.siteName)) items.push({ id: 'project-site', label: '在业主步骤补充工厂/装置/站点', route: '/owner' });
  if (!isFilled(projectMeta.scenarioType)) items.push({ id: 'project-scenario', label: '在业主步骤补充项目类型', route: '/owner' });
  if (!assessment) items.push({ id: 'owner-assessment', label: '完成业主访谈输入', route: '/owner' });
  if (assessment && !isFilled(assessment.keySystems)) items.push({ id: 'owner-key-systems', label: '在业主步骤补充关键系统/角色', route: '/owner' });
  if (assessment && !isFilled(assessment.externalConnections)) items.push({ id: 'owner-external-connections', label: '在业主步骤补充外部连接方式', route: '/owner' });
  if (assessment && !isFilled(assessment.maintenanceAccessPath)) items.push({ id: 'owner-maintenance-path', label: '在业主步骤补充维护接入方式', route: '/owner' });
  if (assessment && !isFilled(assessment.initialBoundaryNotes)) items.push({ id: 'owner-boundary-notes', label: '在业主步骤补充初始网络边界', route: '/owner' });
  if (assessment && !isFilled(assessment.continuityRequirements)) items.push({ id: 'owner-continuity', label: '在业主步骤补充工艺连续性要求', route: '/owner' });
  if (assessment && !isFilled(assessment.complianceNotes)) items.push({ id: 'owner-compliance-notes', label: '在业主步骤补充合规补充说明', route: '/owner' });
  if (assessment && !riskProfile) items.push({ id: 'owner-summary', label: '生成业主交接摘要', route: '/owner/result' });
  if (!plan) items.push({ id: 'integrator-plan', label: '完成集成商设计草案', route: '/integrator' });
  if (!isNonEmptyArray(capabilities)) items.push({ id: 'vendor-capability', label: '录入设备能力声明', route: '/vendor' });
  if (!matchResults) items.push({ id: 'selection-analysis', label: '完成闭环阶段的匹配结果', route: '/selection' });
  if (gapRows.length && gapClosureItems.length < gapRows.length) items.push({ id: 'gap-closure', label: '补全闭环措施并保存', route: '/selection' });

  return items;
}

function getNextRecommendedRoute(state) {
  const stageStatus = getStageStatus(state);
  const nextStage = STAGES.find((stage) => !stageStatus[stage.id]);
  return nextStage || STAGES[STAGES.length - 1];
}

function getProjectProgress(state) {
  const stageStatus = getStageStatus(state);
  const completed = STAGES.filter((stage) => stageStatus[stage.id]).length;
  return {
    completed,
    total: STAGES.length,
    percentage: Math.round((completed / STAGES.length) * 100),
    stageStatus,
    stages: STAGES,
    substeps: {
      owner: getSubstepProgress(state, OWNER_SUBSTEPS),
      integrator: getSubstepProgress(state, INTEGRATOR_SUBSTEPS),
      vendor: getSubstepProgress(state, VENDOR_SUBSTEPS),
      selection: getSubstepProgress(state, SELECTION_SUBSTEPS)
    }
  };
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
}

export function useProjectStatus() {
  const { state } = useProject();
  return {
    progress: getProjectProgress(state),
    missingInputs: getMissingInputs(state),
    nextAction: getNextRecommendedRoute(state)
  };
}

export function useOwnerPath() {
  const { state } = useProject();
  return {
    projectMeta: ensureObject(state.projectMeta, {}) || {},
    assessment: ensureObject(state.ownerProfile?.assessment ?? state.ownerAssessment, null),
    riskProfile: ensureObject(state.riskTranslation?.profile ?? state.riskProfile, null)
  };
}

export function useIntegratorPath() {
  const { state } = useProject();
  return {
    projectMeta: ensureObject(state.projectMeta, {}) || {},
    assessment: ensureObject(state.ownerProfile?.assessment ?? state.ownerAssessment, null),
    riskProfile: ensureObject(state.riskTranslation?.profile ?? state.riskProfile, null),
    plan: ensureObject(state.integratorDesign?.plan ?? state.integratorPlan, null)
  };
}

export function useVendorPath() {
  const { state } = useProject();
  return {
    projectMeta: ensureObject(state.projectMeta, {}) || {},
    plan: ensureObject(state.integratorDesign?.plan ?? state.integratorPlan, null),
    capabilities: ensureArray(state.vendorCatalog?.capabilities ?? state.vendorCapabilities),
    matchResults: ensureObject(state.selectionAnalysis?.results ?? state.matchResults, null),
    gapClosureItems: ensureArray(state.gapClosure?.items ?? state.gapClosureItems)
  };
}
