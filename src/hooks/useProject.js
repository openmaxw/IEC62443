import { useContext } from 'react';
import { ProjectContext } from '../context/projectContextInstance';

const STAGES = [
  { id: 'project', label: '项目建立', route: '/owner' },
  { id: 'owner', label: '业主输入', route: '/owner' },
  { id: 'integrator', label: '集成设计', route: '/integrator' },
  { id: 'vendor', label: '设备声明', route: '/vendor' },
  { id: 'selection', label: '差距分析', route: '/selection' },
  { id: 'report', label: '交付汇总', route: '/report' }
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
  if (!assessment) items.push({ id: 'owner-assessment', label: '完成业主访谈输入', route: '/owner' });
  if (assessment && !riskProfile) items.push({ id: 'owner-summary', label: '生成业主交接摘要', route: '/owner/result' });
  if (!plan) items.push({ id: 'integrator-plan', label: '完成集成商设计草案', route: '/integrator' });
  if (!isNonEmptyArray(capabilities)) items.push({ id: 'vendor-capability', label: '录入设备能力声明', route: '/vendor' });
  if (!matchResults) items.push({ id: 'selection-analysis', label: '完成差距分析', route: '/selection' });
  if (gapRows.length && gapClosureItems.length < gapRows.length) items.push({ id: 'gap-closure', label: '补全差距闭环措施并保存', route: '/gap' });

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
    stages: STAGES
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
    riskProfile: ensureObject(state.riskTranslation?.profile ?? state.riskProfile, null),
    plan: ensureObject(state.integratorDesign?.plan ?? state.integratorPlan, null)
  };
}

export function useVendorPath() {
  const { state } = useProject();
  return {
    projectMeta: ensureObject(state.projectMeta, {}) || {},
    capabilities: ensureArray(state.vendorCatalog?.capabilities ?? state.vendorCapabilities),
    matchResults: ensureObject(state.selectionAnalysis?.results ?? state.matchResults, null),
    gapClosureItems: ensureArray(state.gapClosure?.items)
  };
}
