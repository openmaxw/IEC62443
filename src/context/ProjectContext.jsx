import { useReducer, useEffect } from 'react';
import { ProjectContext } from './projectContextInstance';

const STORAGE_KEY = 'iec-62443-project-data';

const initialState = {
  currentRole: null,
  currentStep: 0,
  projectMeta: {
    projectName: '',
    organizationName: '',
    siteName: '',
    industry: '',
    scenarioType: '',
    projectObjective: '',
    status: 'draft',
    experienceLevel: 'beginner'
  },
  ownerProfile: { assessment: null, draft: null },
  riskTranslation: { profile: null },
  integratorDesign: { plan: null, draft: null },
  vendorCatalog: { capabilities: [], draft: null },
  selectionAnalysis: { results: null },
  deliverables: { reports: [] }
};

function migrateLegacyState(parsed) {
  const nextState = { ...initialState, ...parsed };
  nextState.projectMeta = { ...initialState.projectMeta, ...(parsed.projectMeta || {}) };
  if (!nextState.ownerProfile) nextState.ownerProfile = { assessment: parsed.ownerAssessment || null, draft: null };
  nextState.ownerProfile = { assessment: nextState.ownerProfile.assessment || parsed.ownerAssessment || null, draft: nextState.ownerProfile.draft || null };
  if (!nextState.riskTranslation) nextState.riskTranslation = { profile: parsed.riskProfile || null };
  if (!nextState.integratorDesign) nextState.integratorDesign = { plan: parsed.integratorPlan || null, draft: null };
  nextState.integratorDesign = { plan: nextState.integratorDesign.plan || parsed.integratorPlan || null, draft: nextState.integratorDesign.draft || null };
  if (!nextState.vendorCatalog) nextState.vendorCatalog = { capabilities: parsed.vendorCapabilities || [], draft: null };
  nextState.vendorCatalog = { capabilities: nextState.vendorCatalog.capabilities || parsed.vendorCapabilities || [], draft: nextState.vendorCatalog.draft || null };
  if (!nextState.selectionAnalysis) nextState.selectionAnalysis = { results: parsed.matchResults || null };
  if (!nextState.deliverables) nextState.deliverables = { reports: [] };
  if (parsed.projectName && !nextState.projectMeta.projectName) nextState.projectMeta.projectName = parsed.projectName;
  return nextState;
}

function loadStateFromStorage() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (stored) return migrateLegacyState(JSON.parse(stored));
  } catch (error) {
    console.warn('Failed to load state from storage:', error);
  }
  return initialState;
}

function saveStateToStorage(state) {
  try {
    const payload = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, payload);
    sessionStorage.setItem(STORAGE_KEY, payload);
  } catch (error) {
    console.warn('Failed to save state to storage:', error);
  }
}

const ActionTypes = {
  SET_ROLE: 'SET_ROLE',
  SET_CURRENT_STEP: 'SET_CURRENT_STEP',
  SET_PROJECT_META: 'SET_PROJECT_META',
  SET_PROJECT_NAME: 'SET_PROJECT_NAME',
  SET_OWNER_ASSESSMENT: 'SET_OWNER_ASSESSMENT',
  SET_OWNER_DRAFT: 'SET_OWNER_DRAFT',
  SET_RISK_PROFILE: 'SET_RISK_PROFILE',
  SET_INTEGRATOR_PLAN: 'SET_INTEGRATOR_PLAN',
  SET_INTEGRATOR_DRAFT: 'SET_INTEGRATOR_DRAFT',
  ADD_VENDOR_CAPABILITY: 'ADD_VENDOR_CAPABILITY',
  UPDATE_VENDOR_CAPABILITY: 'UPDATE_VENDOR_CAPABILITY',
  SET_VENDOR_DRAFT: 'SET_VENDOR_DRAFT',
  SET_MATCH_RESULTS: 'SET_MATCH_RESULTS',
  SET_REPORTS: 'SET_REPORTS',
  RESET_PROJECT: 'RESET_PROJECT'
};

function projectReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_ROLE:
      return { ...state, currentRole: action.payload };
    case ActionTypes.SET_CURRENT_STEP:
      return { ...state, currentStep: action.payload };
    case ActionTypes.SET_PROJECT_META:
      return { ...state, projectMeta: { ...state.projectMeta, ...action.payload } };
    case ActionTypes.SET_PROJECT_NAME:
      return { ...state, projectMeta: { ...state.projectMeta, projectName: action.payload } };
    case ActionTypes.SET_OWNER_ASSESSMENT:
      return { ...state, ownerProfile: { ...state.ownerProfile, assessment: action.payload, draft: action.payload } };
    case ActionTypes.SET_OWNER_DRAFT:
      return { ...state, ownerProfile: { ...state.ownerProfile, draft: action.payload } };
    case ActionTypes.SET_RISK_PROFILE:
      return { ...state, riskTranslation: { ...state.riskTranslation, profile: action.payload } };
    case ActionTypes.SET_INTEGRATOR_PLAN:
      return { ...state, integratorDesign: { ...state.integratorDesign, plan: action.payload, draft: action.payload } };
    case ActionTypes.SET_INTEGRATOR_DRAFT:
      return { ...state, integratorDesign: { ...state.integratorDesign, draft: action.payload } };
    case ActionTypes.ADD_VENDOR_CAPABILITY:
      return { ...state, vendorCatalog: { ...state.vendorCatalog, capabilities: [...state.vendorCatalog.capabilities, action.payload], draft: action.payload } };
    case ActionTypes.UPDATE_VENDOR_CAPABILITY:
      return { ...state, vendorCatalog: { ...state.vendorCatalog, capabilities: state.vendorCatalog.capabilities.map((item, index) => (index === action.payload.index ? action.payload.data : item)) } };
    case ActionTypes.SET_VENDOR_DRAFT:
      return { ...state, vendorCatalog: { ...state.vendorCatalog, draft: action.payload } };
    case ActionTypes.SET_MATCH_RESULTS:
      return { ...state, selectionAnalysis: { ...state.selectionAnalysis, results: action.payload } };
    case ActionTypes.SET_REPORTS:
      return { ...state, deliverables: { ...state.deliverables, reports: action.payload } };
    case ActionTypes.RESET_PROJECT:
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
      return initialState;
    default:
      return state;
  }
}

function createLegacyCompatState(state) {
  return {
    ...state,
    projectName: state.projectMeta.projectName,
    ownerAssessment: state.ownerProfile.assessment,
    riskProfile: state.riskTranslation.profile,
    integratorPlan: state.integratorDesign.plan,
    vendorCapabilities: state.vendorCatalog.capabilities,
    matchResults: state.selectionAnalysis.results
  };
}

export function ProjectProvider({ children }) {
  const [state, dispatch] = useReducer(projectReducer, initialState, loadStateFromStorage);

  useEffect(() => {
    saveStateToStorage(createLegacyCompatState(state));
  }, [state]);

  const actions = {
    setRole: (payload) => dispatch({ type: ActionTypes.SET_ROLE, payload }),
    setCurrentStep: (payload) => dispatch({ type: ActionTypes.SET_CURRENT_STEP, payload }),
    setProjectMeta: (payload) => dispatch({ type: ActionTypes.SET_PROJECT_META, payload }),
    setProjectName: (payload) => dispatch({ type: ActionTypes.SET_PROJECT_NAME, payload }),
    setOwnerAssessment: (payload) => dispatch({ type: ActionTypes.SET_OWNER_ASSESSMENT, payload }),
    setOwnerDraft: (payload) => dispatch({ type: ActionTypes.SET_OWNER_DRAFT, payload }),
    setRiskProfile: (payload) => dispatch({ type: ActionTypes.SET_RISK_PROFILE, payload }),
    setIntegratorPlan: (payload) => dispatch({ type: ActionTypes.SET_INTEGRATOR_PLAN, payload }),
    setIntegratorDraft: (payload) => dispatch({ type: ActionTypes.SET_INTEGRATOR_DRAFT, payload }),
    addVendorCapability: (payload) => dispatch({ type: ActionTypes.ADD_VENDOR_CAPABILITY, payload }),
    updateVendorCapability: (index, data) => dispatch({ type: ActionTypes.UPDATE_VENDOR_CAPABILITY, payload: { index, data } }),
    setVendorDraft: (payload) => dispatch({ type: ActionTypes.SET_VENDOR_DRAFT, payload }),
    setMatchResults: (payload) => dispatch({ type: ActionTypes.SET_MATCH_RESULTS, payload }),
    setReports: (payload) => dispatch({ type: ActionTypes.SET_REPORTS, payload }),
    resetProject: () => dispatch({ type: ActionTypes.RESET_PROJECT })
  };

  return <ProjectContext.Provider value={{ state, actions }}>{children}</ProjectContext.Provider>;
}
