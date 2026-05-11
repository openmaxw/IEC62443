import { getCapabilityDisplay } from '../../data/capabilities.js';
import { getIecMappingByCapability } from '../../data/iec62443Mappings.js';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildSelectionResults(plan, latestCapability) {
  const requirements = asArray(plan?.capabilityRequirements);
  const claimMap = new Map(asArray(latestCapability?.capabilityClaims).map((item) => [item.capabilityId, item]));
  const rows = requirements.map((requirement) => {
    const claim = claimMap.get(requirement.capabilityId);
    const status = claim?.satisfaction || 'missing';
    const severity = status === 'missing' ? 'high' : status === 'external' ? 'medium' : status === 'partial' ? 'medium' : 'low';
    return {
      id: requirement.id,
      capabilityId: requirement.capabilityId,
      controlObjective: requirement.controlObjective,
      status,
      evidenceType: claim?.evidenceType || '未填写',
      gapNote: status === 'missing' ? '当前未形成可接受实现路径。' : status === 'external' ? '需通过外围系统或边界控制补足。' : status === 'partial' ? '需配置或补充条件后满足。' : '当前可满足项目要求。',
      severity,
      owner: status === 'external' ? '集成商/业主' : status === 'missing' ? '设备商/集成商' : '设备商'
    };
  });

  return {
    rows,
    summary: {
      high: rows.filter((item) => item.severity === 'high').length,
      medium: rows.filter((item) => item.severity === 'medium').length,
      low: rows.filter((item) => item.severity === 'low').length
    }
  };
}

function buildGapItems(selectionRows, savedItems = []) {
  const rows = asArray(selectionRows).filter((item) => item.status === 'missing' || item.status === 'external' || item.status === 'partial');
  const savedMap = new Map(asArray(savedItems).map((item) => [item.id, item]));
  return rows.map((item) => {
    const saved = savedMap.get(item.id);
    return {
      ...item,
      mitigation: saved?.mitigation || (item.status === 'missing'
        ? '建议更换设备、调整架构或补充外围控制后再评估。'
        : item.status === 'external'
          ? '建议由边界防护、跳板、日志平台或集中身份管理进行补偿。'
          : '建议通过配置加固、功能启用或实施条件补齐后关闭差距。'),
      acceptanceImpact: saved?.acceptanceImpact || (item.severity === 'high' ? '高，可能影响验收' : '中，需在验收前确认关闭路径'),
      residualRisk: saved?.residualRisk || (item.severity === 'high' ? '建议纳入残余风险登记' : '建议视补偿措施有效性决定是否登记'),
      owner: saved?.owner || item.owner,
      saved: Boolean(saved)
    };
  });
}

export function getSelectionViewModel({ projectMeta, plan, capabilities, gapClosureItems, matchResults }) {
  const latestCapability = asArray(capabilities)[asArray(capabilities).length - 1] || null;
  const selection = matchResults?.results?.length ? { rows: asArray(matchResults.results), summary: matchResults.summary || { high: 0, medium: 0, low: 0 } } : buildSelectionResults(plan, latestCapability);
  const gapItems = buildGapItems(selection.rows, gapClosureItems);
  const closedCount = gapItems.filter((item) => item.mitigation || item.owner || item.acceptanceImpact || item.residualRisk).length;

  return {
    projectName: projectMeta?.projectName || '',
    latestCapability,
    selection,
    gapItems,
    closedCount,
    statusSummary: {
      title: gapItems.length ? '当前闭环重点' : '当前闭环状态',
      headline: gapItems.length ? `仍有 ${gapItems.length} 项差距待闭环` : '当前没有待闭环差距项',
      detail: gapItems.length ? `${gapItems.filter((item) => item.severity === 'high').length} 项为高严重度，请优先补充措施、责任与验收影响。` : '可进入交付中心或继续复核匹配结果。',
      pills: [`高严重度 ${gapItems.filter((item) => item.severity === 'high').length}`, `已填写 ${closedCount}/${gapItems.length || 0}`]
    }
  };
}

export function getReportCenterViewModel({ projectMeta, riskProfile, plan, capabilities, matchResults, gapClosureItems }) {
  const latestCapability = asArray(capabilities)[asArray(capabilities).length - 1] || null;
  const gapRows = asArray(matchResults?.results).filter((item) => item.status === 'missing' || item.status === 'external' || item.status === 'partial');
  const gapClosureReady = gapRows.length === 0 || asArray(gapClosureItems).length >= gapRows.length;
  const highRiskCount = asArray(gapClosureItems).filter((item) => item.severity === 'high').length;
  const externalCount = asArray(gapClosureItems).filter((item) => item.status === 'external').length;
  const mappingRows = asArray(plan?.capabilityRequirements)
    .map((item) => ({ requirement: item, display: getCapabilityDisplay(item.capabilityId), mapping: getIecMappingByCapability(item.capabilityId) }))
    .filter((item) => item.mapping);

  const items = [
    { title: '业主交接物', ready: Boolean(riskProfile), desc: '查看业主输入摘要与设计输入。', route: '/owner/result' },
    { title: '集成设计结果', ready: Boolean(plan), desc: '查看 Zone / Conduit、通信设计与能力需求。', route: '/integrator/result' },
    { title: '设备声明结果', ready: Boolean(latestCapability), desc: '查看设备能力声明摘要。', route: '/vendor/result' },
    { title: '闭环', ready: Boolean(asArray(matchResults?.results).length) && gapClosureReady, desc: gapRows.length ? '查看差距项、补偿措施、责任方、验收影响与残余风险。' : '当前没有待闭环差距项。', route: '/selection' },
    { title: '需求追溯链', ready: Boolean(riskProfile && plan), desc: '查看从业务输入到能力/差距的追溯。', route: '/translation-center' }
  ];

  return {
    projectName: projectMeta?.projectName || '',
    items,
    gapRows,
    gapClosureReady,
    highRiskCount,
    externalCount,
    statusSummary: {
      title: gapClosureReady ? '交付判断' : '当前交付阻塞',
      headline: gapClosureReady ? '主要交付项已具备' : `仍有 ${gapRows.length} 项差距影响交付完整度`,
      detail: gapClosureReady ? '可集中查看和导出阶段成果。' : '请先完成闭环措施、责任方、验收影响与残余风险补充。',
      pills: [`高严重度 ${highRiskCount}`, `外部补偿 ${externalCount}`]
    },
    gapClosureItems: asArray(gapClosureItems).map((item) => ({
      ...item,
      display: getCapabilityDisplay(item.capabilityId)
    })),
    mappingRows,
    reportPayload: {
      projectMeta,
      riskProfile,
      plan,
      latestCapability,
      gapClosureItems: asArray(gapClosureItems),
      mappingRows
    }
  };
}
