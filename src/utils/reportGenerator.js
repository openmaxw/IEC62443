// 报告生成器
import { FR_CATEGORIES, SECURITY_LEVELS } from '../data/rules';

/**
 * 生成业主版报告
 * @param {Object} ownerData - 业主数据
 * @param {Object} riskProfile - 风险画像
 * @returns {Object} 报告数据
 */
export function generateOwnerReport(ownerData, riskProfile) {
  return {
    type: 'owner',
    title: '业主安全需求评估报告',
    generatedAt: new Date().toISOString(),
    summary: {
      projectName: ownerData.projectName || '未命名项目',
      industry: ownerData.industry,
      riskLevel: riskProfile.riskLevel.label,
      recommendedSL: riskProfile.recommendedSL[0]?.level || 1
    },
    sections: [
      {
        id: 'risk-profile',
        title: '风险画像',
        content: riskProfile.summary,
        recommendations: riskProfile.protectionFocus.map((focus, idx) => ({
          id: idx + 1,
          text: focus
        }))
      },
      {
        id: 'security-targets',
        title: '安全目标建议',
        content: riskProfile.frDimensions.map(fr => ({
          code: fr.code,
          name: fr.name,
          description: fr.description
        }))
      },
      {
        id: 'sl-recommendation',
        title: '建议安全等级',
        content: riskProfile.recommendedSL.map(sl => ({
          level: sl.level,
          name: sl.name,
          description: sl.description,
          target: sl.target
        }))
      },
      {
        id: 'requirements-for-integrator',
        title: '对集成商的要求',
        content: generateIntegratorRequirements(riskProfile)
      }
    ],
    exportFormats: ['pdf', 'json']
  };
}

/**
 * 生成集成商版报告
 * @param {Object} ownerReport - 业主报告
 * @param {Object} integratorPlan - 集成商规划
 * @returns {Object} 报告数据
 */
export function generateIntegratorReport(ownerReport, integratorPlan) {
  return {
    type: 'integrator',
    title: '集成商系统规划报告',
    generatedAt: new Date().toISOString(),
    summary: {
      projectName: ownerReport.summary.projectName,
      industry: ownerReport.summary.industry,
      targetSL: integratorPlan.targetSL,
      zoneCount: integratorPlan.zones.length,
      conduitCount: integratorPlan.conduits.length
    },
    sections: [
      {
        id: 'zone-plan',
        title: '分区规划',
        content: integratorPlan.zones.map(zone => ({
          name: zone.name,
          securityLevel: zone.securityLevel,
          description: zone.description,
          assets: zone.assets
        }))
      },
      {
        id: 'conduit-plan',
        title: '通信管道规划',
        content: integratorPlan.conduits.map(conduit => ({
          name: conduit.name,
          type: conduit.type,
          description: conduit.description
        }))
      },
      {
        id: 'communication-matrix',
        title: '通信矩阵',
        content: integratorPlan.communicationFlows
      },
      {
        id: 'capability-requirements',
        title: '设备能力需求',
        content: integratorPlan.capabilityRequirements
      },
      {
        id: 'security-rules',
        title: '系统规则建议',
        content: integratorPlan.securityRules
      }
    ],
    exportFormats: ['pdf', 'json']
  };
}

/**
 * 生成设备商版报告
 * @param {Object} vendorCapability - 设备商能力
 * @param {Object} matchResults - 匹配结果
 * @returns {Object} 报告数据
 */
export function generateVendorReport(vendorCapability, matchResults) {
  return {
    type: 'vendor',
    title: '设备商能力评估报告',
    generatedAt: new Date().toISOString(),
    summary: {
      productName: vendorCapability.productName,
      productType: vendorCapability.productType,
      securityLevel: vendorCapability.securityLevel,
      matchPercentage: matchResults.percentage
    },
    sections: [
      {
        id: 'capability-profile',
        title: '能力画像',
        content: vendorCapability.capabilities.map(cap => ({
          category: cap.category,
          features: cap.features,
          maturity: cap.maturity
        }))
      },
      {
        id: 'match-analysis',
        title: '匹配分析',
        content: matchResults.details
      },
      {
        id: 'gap-analysis',
        title: '差距分析',
        content: matchResults.missing
      },
      {
        id: 'value-proposition',
        title: '价值说明',
        content: generateValueProposition(vendorCapability)
      }
    ],
    exportFormats: ['pdf', 'json']
  };
}

/**
 * 生成验收清单
 * @param {Object} integratorPlan - 集成商规划
 * @param {Array} matchResults - 匹配结果
 * @returns {Object} 验收清单
 */
export function generateAcceptanceChecklist(integratorPlan, matchResults) {
  return {
    type: 'acceptance',
    title: '项目验收检查表',
    generatedAt: new Date().toISOString(),
    sections: [
      {
        id: 'zone-verification',
        title: '分区验证',
        checks: integratorPlan.zones.map(zone => ({
          item: `Zone "${zone.name}" 已正确配置`,
          status: 'pending',
          securityLevel: zone.securityLevel
        }))
      },
      {
        id: 'conduit-verification',
        title: '管道验证',
        checks: integratorPlan.conduits.map(conduit => ({
          item: `Conduit "${conduit.name}" 已正确配置`,
          status: 'pending'
        }))
      },
      {
        id: 'capability-verification',
        title: '能力验证',
        checks: matchResults.filter(r => r.status !== 'missing').map(r => ({
          item: `${r.label} 能力已验证`,
          status: 'pending',
          maturity: r.providedMaturity
        }))
      }
    ]
  };
}

/**
 * 生成集成商要求
 */
function generateIntegratorRequirements(riskProfile) {
  const requirements = [];

  riskProfile.frDimensions.forEach(fr => {
    requirements.push({
      category: fr.name,
      requirements: fr.sr.slice(0, 4).map(sr => ({
        code: sr,
        description: `${sr} - ${FR_CATEGORIES[fr.code].name}相关要求`
      }))
    });
  });

  return requirements;
}

/**
 * 生成价值说明
 */
function generateValueProposition(vendorCapability) {
  const propositions = [];

  if (vendorCapability.securityLevel >= 2) {
    propositions.push(`产品已达到 IEC 62443 SL${vendorCapability.securityLevel} 标准`);
  }

  vendorCapability.capabilities.forEach(cap => {
    propositions.push(`${cap.category}: ${cap.features.join('、')}`);
  });

  return propositions;
}

/**
 * 导出报告为 JSON
 */
export function exportReportAsJSON(report) {
  const dataStr = JSON.stringify(report, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${report.type}-report-${Date.now()}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * 生成完整项目报告
 */
export function generateCompleteProjectReport(projectData) {
  return {
    projectInfo: {
      name: projectData.projectName || '安全网络规划项目',
      createdAt: new Date().toISOString(),
      version: '1.0'
    },
    ownerReport: projectData.ownerReport,
    integratorReport: projectData.integratorReport,
    vendorReports: projectData.vendorReports,
    acceptanceChecklist: projectData.acceptanceChecklist,
    metadata: {
      generatedBy: 'IEC 62443 安全网络规划辅助系统',
      generationDate: new Date().toISOString()
    }
  };
}
