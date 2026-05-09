import { getCapabilityDisplay } from '../../data/capabilities.js';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function getTranslationCenterViewModel({ projectMeta, assessment, riskProfile, plan, capabilities, matchResults }) {
  const latestCapability = asArray(capabilities)[asArray(capabilities).length - 1] || null;
  const gapItems = asArray(matchResults?.results).filter((item) => item.status === 'missing' || item.status === 'external' || item.status === 'partial').slice(0, 6);

  return {
    projectName: projectMeta?.projectName || '',
    projectDescription: [projectMeta?.organizationName, projectMeta?.siteName, projectMeta?.industry, projectMeta?.scenarioType].filter(Boolean).join(' / '),
    summary: {
      requirementCount: asArray(plan?.capabilityRequirements).length,
      gapCount: gapItems.length
    },
    owner: {
      criticalAssets: asArray(assessment?.criticalAssets).join('、') || '未填写',
      keySystems: assessment?.keySystems || '未填写',
      externalConnections: assessment?.externalConnections || '未填写',
      continuityRequirements: assessment?.continuityRequirements || '未填写'
    },
    risk: {
      concerns: asArray(riskProfile?.riskConcernSummary).map((item) => item.title).join('、') || '无',
      frFocus: asArray(riskProfile?.frFocus).map((item) => item.code).join('、') || '无',
      targetLevels: asArray(riskProfile?.targetLevelCandidates).map((item) => `SL-${item.level}`).join('、') || '无',
      ownerRequirements: asArray(riskProfile?.ownerRequirements).slice(0, 3).map((item) => item.text || item).join('；') || '无'
    },
    design: {
      zoneConduitSummary: plan ? `${asArray(plan?.zones).length} 个 Zone / ${asArray(plan?.conduits).length} 类 Conduit` : '未形成',
      communicationSummary: plan ? `${asArray(plan?.communicationFlows).length} 条通信流` : '未形成',
      designBasis: plan?.designBasisSummary?.designBasis || '未填写',
      capabilityLabels: asArray(plan?.capabilityRequirements).slice(0, 4).map((item) => getCapabilityDisplay(item.capabilityId).label).join('、') || '无'
    },
    capability: {
      productName: latestCapability?.productMeta?.productName || '未填写',
      claimCount: asArray(latestCapability?.capabilityClaims).length,
      gapCount: gapItems.length,
      gapLabels: gapItems.length ? gapItems.map((item) => getCapabilityDisplay(item.capabilityId).label).join('、') : '无'
    }
  };
}

export function getIntegratorWorkspaceViewModel({ projectMeta, assessment, riskProfile, draftPlan }) {
  return {
    projectName: projectMeta?.projectName || '',
    hasPrerequisites: Boolean(assessment && riskProfile),
    initialPlan: draftPlan || {
      zones: [],
      conduits: [],
      assets: [],
      communicationFlows: [],
      targetSL: asArray(riskProfile?.targetLevelCandidates)[0]?.level || 2,
      requiredFR: asArray(riskProfile?.frFocus).map((item) => item.code),
      designBasis: ''
    }
  };
}

export function getVendorCapabilityViewModel({ projectMeta, plan, draft, capabilities }) {
  return {
    projectName: projectMeta?.projectName || '',
    plan,
    draft,
    latestCapability: asArray(capabilities)[asArray(capabilities).length - 1] || null,
    capabilityCount: asArray(capabilities).length
  };
}
