import { useProject as useProjectContext } from '../context/ProjectContext';

// Re-export for convenience
export { useProjectContext as useProject };

/**
 * 项目状态管理 Hook
 */
export function useProjectState() {
  const { state, actions } = useProjectContext();

  return {
    // 状态
    currentRole: state.currentRole,
    projectName: state.projectName,
    ownerAssessment: state.ownerAssessment,
    riskProfile: state.riskProfile,
    integratorPlan: state.integratorPlan,
    vendorCapabilities: state.vendorCapabilities,
    matchResults: state.matchResults,
    currentStep: state.currentStep,

    // 操作
    setRole: actions.setRole,
    setProjectName: actions.setProjectName,
    setOwnerAssessment: actions.setOwnerAssessment,
    setRiskProfile: actions.setRiskProfile,
    setIntegratorPlan: actions.setIntegratorPlan,
    addVendorCapability: actions.addVendorCapability,
    updateVendorCapability: actions.updateVendorCapability,
    setMatchResults: actions.setMatchResults,
    setCurrentStep: actions.setCurrentStep,
    resetProject: actions.resetProject
  };
}

/**
 * 业主路径 Hook
 */
export function useOwnerPath() {
  const { state, actions } = useProjectContext();

  return {
    assessment: state.ownerAssessment,
    riskProfile: state.riskProfile,
    setAssessment: actions.setOwnerAssessment,
    setRiskProfile: actions.setRiskProfile,
    isComplete: state.ownerAssessment !== null && state.riskProfile !== null
  };
}

/**
 * 集成商路径 Hook
 */
export function useIntegratorPath() {
  const { state, actions } = useProjectContext();

  return {
    plan: state.integratorPlan,
    ownerAssessment: state.ownerAssessment,
    riskProfile: state.riskProfile,
    setPlan: actions.setIntegratorPlan,
    isComplete: state.integratorPlan !== null
  };
}

/**
 * 设备商路径 Hook
 */
export function useVendorPath() {
  const { state, actions } = useProjectContext();

  return {
    capabilities: state.vendorCapabilities,
    matchResults: state.matchResults,
    addCapability: actions.addVendorCapability,
    updateCapability: actions.updateVendorCapability,
    setMatchResults: actions.setMatchResults,
    isComplete: state.vendorCapabilities.length > 0
  };
}
