import { UNIFIED_DISCLAIMER } from '../data/disclaimer.js';

function safeText(value, fallback = '未填写') {
  if (value === null || value === undefined || value === '') return fallback;
  if (Array.isArray(value)) return value.length ? value.join('、') : fallback;
  return String(value);
}

function bulletList(items, fallback = '未形成') {
  return Array.isArray(items) && items.length ? items.map((item) => `- ${safeText(item)}`).join('\n') : `- ${fallback}`;
}

function table(rows, headers, mapper) {
  const head = `| ${headers.join(' | ')} |`;
  const split = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.length ? rows.map((row) => `| ${mapper(row).map((cell) => safeText(cell).replace(/\n/g, '<br>')).join(' | ')} |`).join('\n') : `| ${headers.map(() => '—').join(' | ')} |`;
  return [head, split, body].join('\n');
}

export function buildReportMarkdown(report = {}) {
  const projectMeta = report.projectMeta || {};
  const riskProfile = report.riskProfile || {};
  const plan = report.plan || {};
  const latestCapability = report.latestCapability || {};
  const gapClosureItems = Array.isArray(report.gapClosureItems) ? report.gapClosureItems : [];
  const mappingRows = Array.isArray(report.mappingRows) ? report.mappingRows : [];

  return `# IEC 62443 项目交付摘要

## 1. 项目摘要

- 项目名称：${safeText(projectMeta.projectName)}
- 组织名称：${safeText(projectMeta.organizationName)}
- 现场名称：${safeText(projectMeta.siteName)}
- 行业场景：${safeText(projectMeta.industry)}
- 项目目标：${safeText(projectMeta.projectObjective)}

## 2. 业主输入与风险关注

- 目标等级候选：${safeText((riskProfile.targetLevelCandidates || []).map((item) => `SL-${item.level}`))}
- FR 重点：${safeText((riskProfile.frFocus || []).map((item) => item.code))}

### 业主要求
${bulletList(riskProfile.ownerRequirements)}

### 验收关注
${bulletList(riskProfile.acceptanceFocus)}

## 3. 集成设计响应

- 目标 SL：${plan.targetSL ? `SL-${plan.targetSL}` : '未形成'}
- Zone：${safeText(plan.zones)}
- Conduit：${safeText(plan.conduits)}
- 设计依据：${safeText(plan.designBasis)}

### 能力需求
${table(plan.capabilityRequirements || [], ['能力项', '控制目标', '目标 SL', '实现提示'], (item) => [item.capabilityId, item.controlObjective, item.targetSL ? `SL-${item.targetSL}` : '未填写', item.implementationHint])}

## 4. 设备能力声明

- 产品名称：${safeText(latestCapability.productMeta?.productName)}
- 产品类型：${safeText(latestCapability.productMeta?.productType)}
- 部署范围：${safeText(latestCapability.productMeta?.deploymentScope)}

${table(latestCapability.capabilityClaims || [], ['能力项', '满足度', '证据类型', '实现方式'], (item) => [item.capabilityId, item.satisfaction, item.evidenceType, item.implementationType])}

## 5. 差距闭环

${table(gapClosureItems, ['能力项', '责任方', '补偿措施', '验收影响', '残余风险'], (item) => [item.capabilityId, item.owner, item.mitigation, item.acceptanceImpact, item.residualRisk])}

## 6. IEC 62443 映射依据

${table(mappingRows, ['能力项', 'Part', 'FR', 'SR', '条款摘要', '系统解释', '当前限制'], (item) => [item.display?.label || item.requirement?.capabilityId, item.mapping?.part, item.mapping?.fr, item.mapping?.sr, item.mapping?.requirementSummary, item.mapping?.systemInterpretation, item.mapping?.limitation])}

## 7. 免责声明

${UNIFIED_DISCLAIMER}
`;
}

function copyToClipboard(text) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    navigator.clipboard.writeText(text);
  }
}

function downloadText(filename, text, type) {
  const link = document.createElement('a');
  link.download = filename;
  link.rel = 'noopener';
  link.href = `data:${type},${encodeURIComponent(text)}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  copyToClipboard(text);
}

export function exportReportAsMarkdown(report) {
  const projectName = report?.projectMeta?.projectName || 'iec-62443-deliverable';
  const filename = `${projectName.replace(/[\\/:*?"<>|\s]+/g, '-')}-${Date.now()}.md`;
  downloadText(filename, buildReportMarkdown(report), 'text/markdown;charset=utf-8');
}

export function exportReportAsJSON(report) {
  downloadText(`${report.type || report.audience || 'deliverable'}-${Date.now()}.json`, JSON.stringify(report, null, 2), 'application/json');
}
