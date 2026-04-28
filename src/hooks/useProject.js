import { useContext } from 'react';
import { ProjectContext } from '../context/projectContextInstance';

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
}

export function useOwnerPath() {
  const { state } = useProject();
  return {
    projectMeta: state.projectMeta,
    assessment: state.ownerProfile?.assessment ?? state.ownerAssessment,
    riskProfile: state.riskTranslation?.profile ?? state.riskProfile
  };
}

export function useIntegratorPath() {
  const { state } = useProject();
  return {
    projectMeta: state.projectMeta,
    riskProfile: state.riskTranslation?.profile ?? state.riskProfile,
    plan: state.integratorDesign?.plan ?? state.integratorPlan
  };
}

export function useVendorPath() {
  const { state } = useProject();
  return {
    projectMeta: state.projectMeta,
    capabilities: state.vendorCatalog?.capabilities ?? state.vendorCapabilities ?? [],
    matchResults: state.selectionAnalysis?.results ?? state.matchResults
  };
}
