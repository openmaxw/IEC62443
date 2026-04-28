import { createDisclaimerPayload } from './disclaimer';
import { MATCH_STATUSES } from './matchStatuses';

export function createOwnerDeliverables({ assessment, riskProfile }) {
  return {
    audience: 'owner',
    type: 'owner-summary',
    generatedAt: new Date().toISOString(),
    summary: {
      projectName: assessment.projectName || '未命名项目',
      headline: riskProfile.summary?.description || '',
      recommendedTarget: riskProfile.summary?.recommendedTarget || ''
    },
    sections: [
      {
        id: 'risk-concern-summary',
        title: '风险关注摘要',
        items: riskProfile.riskConcernSummary || []
      },
      {
        id: 'integrator-requirements',
        title: '对集成商需求摘要',
        items: riskProfile.ownerRequirements || []
      },
      {
        id: 'procurement-focus',
        title: '对采购关注点',
        items: (riskProfile.controlObjectives || []).map((item) => ({
          id: item.id,
          title: item.title,
          summary: `重点核对 ${item.capabilities.join('、')} 等能力声明、满足方式与证据边界。`,
          level: item.priority >= 6 ? 'high' : 'medium'
        }))
      },
      {
        id: 'acceptance-focus',
        title: '验收关注点清单',
        items: (riskProfile.acceptanceFocus || []).map((text, index) => ({
          id: `acceptance-${index + 1}`,
          title: `验收关注点 ${index + 1}`,
          summary: text,
          level: 'medium'
        }))
      }
    ],
    disclaimer: createDisclaimerPayload(),
    traceability: riskProfile.explanations || []
  };
}

export function createIntegratorDeliverables({ projectMeta, riskProfile, plan }) {
  return {
    audience: 'integrator',
    type: 'integrator-draft',
    generatedAt: new Date().toISOString(),
    summary: {
      projectName: projectMeta?.projectName || '未命名项目',
      headline: `建议目标等级 SL${plan?.targetSL || '-'}，当前已规划 ${plan?.zones?.length || 0} 个 Zone。`
    },
    sections: [
      { id: 'zones', title: 'Zone 划分建议', items: (plan?.zones || []).map((item) => ({ id: item, title: item, summary: '纳入项目安全设计范围。' })) },
      { id: 'conduits', title: 'Conduit 与边界控制建议', items: (plan?.boundaryControls || []).map((item, index) => ({ id: `${item.conduitId}-${index}`, title: item.conduitId, summary: item.measure })) },
      { id: 'flows', title: '通信矩阵', items: plan?.communicationMatrix?.complete ? (plan.communicationMatrix.rows || []).map((item) => ({ id: item.id, title: `${item.sourceName} → ${item.targetName}`, summary: `${item.protocol} / ${item.direction === 'uni' ? '单向' : '双向'} / ${item.businessReason}` })) : [{ id: 'missing-flow', title: '通信矩阵未完整生成', summary: '需先补齐源/目的/协议/方向/业务理由。' }] },
      { id: 'rules', title: '系统规则建议', items: (plan?.systemRules || []).map((item, index) => ({ id: `rule-${index}`, title: `规则 ${index + 1}`, summary: item })) },
      { id: 'requirements', title: '设备能力需求矩阵', items: (plan?.capabilityRequirements || []).map((item) => ({ id: `${item.capabilityId}-${item.controlObjective}`, title: item.capabilityId, summary: `${item.controlObjective} / ${item.sourceFR.join('、')} / SL${item.targetSL}` })) }
    ],
    disclaimer: createDisclaimerPayload(),
    traceability: riskProfile?.explanations || []
  };
}

export function createVendorDeliverables({ capabilities = [], matchResults }) {
  const latest = capabilities[capabilities.length - 1];
  const primary = matchResults?.results?.[0];

  return {
    audience: 'vendor',
    type: 'vendor-capability',
    generatedAt: new Date().toISOString(),
    summary: {
      projectName: latest?.productMeta?.productName || '未命名产品',
      headline: primary ? `${primary.recommendations.label}，匹配度 ${primary.overallScore}%` : '当前仅完成能力声明，尚未形成项目匹配结论。'
    },
    sections: [
      { id: 'product', title: '产品基本信息', items: latest ? [{ id: 'meta', title: latest.productMeta.productName, summary: `${latest.productMeta.productType || '未分类'} / SL${latest.productMeta.securityLevel} / ${latest.productMeta.useCases || '未填写适用场景'}` }] : [] },
      { id: 'claims', title: '能力声明', items: (latest?.capabilityClaims || []).map((item) => ({ id: item.capabilityId, title: item.capabilityId, summary: `${MATCH_STATUSES[item.satisfaction]?.label || item.satisfaction} / 证据：${item.evidenceType || '无'} / 依赖：${item.dependency || '无'}` })) },
      { id: 'dependencies', title: '前置依赖与限制', items: [{ id: 'deps', title: '统一依赖', summary: latest?.dependencies || '无统一依赖说明' }, { id: 'limits', title: '已知边界', summary: latest?.limitations || '无已知不适配边界说明' }] },
      { id: 'match', title: '项目匹配摘要', items: primary ? [
        { id: 'native', title: '原生满足', summary: String(primary.statusBreakdown.native || 0) },
        { id: 'configured', title: '配置后满足', summary: String(primary.statusBreakdown.configured || 0) },
        { id: 'external', title: '依赖外围控制满足', summary: String(primary.statusBreakdown.external || 0) },
        { id: 'compensating', title: '补偿措施后可接受', summary: String(primary.statusBreakdown.compensating || 0) },
        { id: 'missing', title: '不满足', summary: String(primary.statusBreakdown.missing || 0) }
      ] : [] }
    ],
    disclaimer: createDisclaimerPayload(),
    traceability: primary?.details || []
  };
}

export function createAcceptanceDeliverable({ plan, riskProfile }) {
  return {
    audience: 'acceptance',
    type: 'acceptance-checklist',
    generatedAt: new Date().toISOString(),
    summary: {
      projectName: '验收检查表',
      headline: '面向验收阶段的检查项与风险保留说明。'
    },
    sections: [
      { id: 'acceptance-focus', title: '验收关注点', items: (riskProfile?.acceptanceFocus || []).map((item, index) => ({ id: `accept-${index}`, title: `关注点 ${index + 1}`, summary: item })) },
      { id: 'residual-risks', title: '风险保留与补偿措施清单', items: (plan?.residualRisks || []).map((item, index) => ({ id: `risk-${index}`, title: `保留项 ${index + 1}`, summary: item })) }
    ],
    disclaimer: createDisclaimerPayload(),
    traceability: riskProfile?.explanations || []
  };
}
