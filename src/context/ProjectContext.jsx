import { createContext, useContext, useReducer } from 'react';

// 初始状态
const initialState = {
  currentRole: null,
  projectName: '',
  ownerAssessment: null,
  riskProfile: null,
  integratorPlan: null,
  vendorCapabilities: [],
  matchResults: null,
  currentStep: 0
};

// 操作类型
const ActionTypes = {
  SET_ROLE: 'SET_ROLE',
  SET_PROJECT_NAME: 'SET_PROJECT_NAME',
  SET_OWNER_ASSESSMENT: 'SET_OWNER_ASSESSMENT',
  SET_RISK_PROFILE: 'SET_RISK_PROFILE',
  SET_INTEGRATOR_PLAN: 'SET_INTEGRATOR_PLAN',
  ADD_VENDOR_CAPABILITY: 'ADD_VENDOR_CAPABILITY',
  UPDATE_VENDOR_CAPABILITY: 'UPDATE_VENDOR_CAPABILITY',
  SET_MATCH_RESULTS: 'SET_MATCH_RESULTS',
  SET_CURRENT_STEP: 'SET_CURRENT_STEP',
  RESET_PROJECT: 'RESET_PROJECT'
};

// Reducer
function projectReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_ROLE:
      return { ...state, currentRole: action.payload };

    case ActionTypes.SET_PROJECT_NAME:
      return { ...state, projectName: action.payload };

    case ActionTypes.SET_OWNER_ASSESSMENT:
      return { ...state, ownerAssessment: action.payload };

    case ActionTypes.SET_RISK_PROFILE:
      return { ...state, riskProfile: action.payload };

    case ActionTypes.SET_INTEGRATOR_PLAN:
      return { ...state, integratorPlan: action.payload };

    case ActionTypes.ADD_VENDOR_CAPABILITY:
      return {
        ...state,
        vendorCapabilities: [...state.vendorCapabilities, action.payload]
      };

    case ActionTypes.UPDATE_VENDOR_CAPABILITY:
      return {
        ...state,
        vendorCapabilities: state.vendorCapabilities.map((v, idx) =>
          idx === action.payload.index ? action.payload.data : v
        )
      };

    case ActionTypes.SET_MATCH_RESULTS:
      return { ...state, matchResults: action.payload };

    case ActionTypes.SET_CURRENT_STEP:
      return { ...state, currentStep: action.payload };

    case ActionTypes.RESET_PROJECT:
      return initialState;

    default:
      return state;
  }
}

// Context
const ProjectContext = createContext(null);

// Provider
export function ProjectProvider({ children }) {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  const actions = {
    setRole: (role) => dispatch({ type: ActionTypes.SET_ROLE, payload: role }),
    setProjectName: (name) => dispatch({ type: ActionTypes.SET_PROJECT_NAME, payload: name }),
    setOwnerAssessment: (assessment) => dispatch({ type: ActionTypes.SET_OWNER_ASSESSMENT, payload: assessment }),
    setRiskProfile: (profile) => dispatch({ type: ActionTypes.SET_RISK_PROFILE, payload: profile }),
    setIntegratorPlan: (plan) => dispatch({ type: ActionTypes.SET_INTEGRATOR_PLAN, payload: plan }),
    addVendorCapability: (capability) => dispatch({ type: ActionTypes.ADD_VENDOR_CAPABILITY, payload: capability }),
    updateVendorCapability: (index, data) => dispatch({ type: ActionTypes.UPDATE_VENDOR_CAPABILITY, payload: { index, data } }),
    setMatchResults: (results) => dispatch({ type: ActionTypes.SET_MATCH_RESULTS, payload: results }),
    setCurrentStep: (step) => dispatch({ type: ActionTypes.SET_CURRENT_STEP, payload: step }),
    resetProject: () => dispatch({ type: ActionTypes.RESET_PROJECT })
  };

  return (
    <ProjectContext.Provider value={{ state, actions }}>
      {children}
    </ProjectContext.Provider>
  );
}

// Hook
export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
}
