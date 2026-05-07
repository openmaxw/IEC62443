export const DEMO_PROJECT_STATE = {
  currentRole: 'owner',
  currentStep: 0,
  projectMeta: {
    projectName: '某化工装置 OT 安全分区协同演示',
    organizationName: '华东某石化企业',
    siteName: '乙烯装置 A 区',
    industry: 'chemical',
    scenarioType: 'retrofit',
    projectObjective: '完成控制区分段、远程运维边界梳理与设备能力差距评估',
    status: 'demo-loaded',
    experienceLevel: 'beginner'
  },
  ownerProfile: {
    assessment: {
      projectName: '某化工装置 OT 安全分区协同演示',
      industry: 'chemical',
      safetyImpact: 'high',
      environmentalImpact: 'high',
      productionImpact: 'high',
      financialImpact: 'medium',
      complianceImpact: 'high',
      remoteAccessNeed: 'limited',
      thirdPartyAccess: 'regular',
      itOtIntegration: 'moderate',
      networkSegmentationMaturity: 'medium',
      identityMaturity: 'low',
      loggingMaturity: 'medium',
      patchMaturity: 'low',
      maintenanceWindow: '每周三 18:00-22:00',
      upgradeWindow: '季度停车窗口',
      remoteOperationsOwnership: 'shared',
      acceptancePreference: 'security-first',
      criticalAssets: ['plc', 'scada', 'engineering', 'historian', 'remote-gateway'],
      keySystems: 'DCS 控制器、操作员站、工程师站、历史数据库、远程运维跳板',
      externalConnections: '与 MES 交换生产数据；设备商通过受控远程维护通道接入',
      maintenanceAccessPath: '厂外 VPN -> DMZ 跳板机 -> 工程师站',
      initialBoundaryNotes: '现有控制网与信息网之间已有防火墙，但工程师站与控制器仍在同一扁平网段',
      continuityRequirements: '裂解炉控制不可中断，停车切换必须在计划窗口内执行',
      complianceNotes: '涉及安环与关键工艺连续性要求，远程访问必须留痕'
    },
    draft: null
  },
  riskTranslation: {
    profile: {
      drivers: [],
      riskConcerns: [{ id: 'remoteAccess', title: '远程与第三方接入', level: 'high' }, { id: 'criticalOps', title: '关键工艺连续性与安全后果', level: 'high' }],
      riskConcernSummary: [
        { id: 'remoteAccess', title: '远程与第三方接入', summary: '需要控制外部维护入口、审批与审计。' },
        { id: 'criticalOps', title: '关键工艺连续性与安全后果', summary: '需优先保护控制区和关键工艺资产。' }
      ],
      frFocus: [{ code: 'FR1' }, { code: 'FR2' }, { code: 'FR6' }, { code: 'FR7' }],
      targetLevelCandidates: [{ level: 2 }, { level: 3 }],
      ownerRequirements: [
        '远程接入必须通过受控入口、身份鉴别和审批流程。',
        '关键控制区应与外部访问区分离，减少直接暴露。',
        '关键账号、关键边界和关键操作应具备日志与审计能力。'
      ],
      acceptanceFocus: ['验证远程维护入口的受控性和留痕能力', '验证关键区边界控制和跨区通信合理性'],
      explanations: [
        {
          controlObjective: '远程接入控制',
          capabilityNeeds: ['auth-password', 'access-rbac', 'logging-event'],
          fr: ['FR1', 'FR2', 'FR6'],
          inputConditions: ['存在远程维护通道', '第三方接入频繁'],
          riskConcerns: ['远程与第三方接入']
        },
        {
          controlObjective: '边界与审计控制',
          capabilityNeeds: ['access-whitelist', 'logging-syslog', 'audit-report'],
          fr: ['FR2', 'FR6'],
          inputConditions: ['关键工艺连续性要求高'],
          riskConcerns: ['关键工艺连续性与安全后果']
        }
      ]
    }
  },
  integratorDesign: {
    plan: {
      zones: ['control-cell', 'dmz', 'operations'],
      conduits: ['site-operations', 'remote-support'],
      assets: [
        { id: 'asset-1', name: '裂解炉 PLC', zone: 'control-cell', role: 'control', groupingReason: '同一工艺单元、相同控制信任边界' },
        { id: 'asset-2', name: '工程师站', zone: 'operations', role: 'engineering', groupingReason: '属于维护角色，不应直接与 PLC 同区' },
        { id: 'asset-3', name: '远程跳板', zone: 'dmz', role: 'server', groupingReason: '作为受控入口，承接外部访问' }
      ],
      communicationFlows: [
        { id: 'flow-1', source: 'operations', target: 'control-cell', protocol: 'OPC UA', direction: '双向', necessity: '操作监控和工艺数据访问', businessReason: '操作员站需要读取与下发受控指令', boundaryControl: '通过工业防火墙和白名单控制' },
        { id: 'flow-2', source: 'dmz', target: 'operations', protocol: 'HTTPS', direction: '双向', necessity: '远程维护受控接入', businessReason: '设备商经审批后通过跳板接入工程师站', boundaryControl: 'VPN + 跳板 + MFA + 审计' }
      ],
      targetSL: 3,
      requiredFR: ['FR1', 'FR2', 'FR6', 'FR7'],
      designBasis: '按照关键控制区与外部访问区隔离的原则设计，优先控制远程维护边界与跨区通信。',
      communicationMatrix: {
        complete: true,
        missingFields: [],
        rows: []
      },
      capabilityRequirements: [
        { id: 'req-1', capabilityId: 'auth-password', controlObjective: '远程接入控制', implementationHint: '用于远程接入账号鉴别。', traceability: { inputConditions: ['存在远程维护通道'], riskConcerns: ['远程与第三方接入'] } },
        { id: 'req-2', capabilityId: 'access-rbac', controlObjective: '远程接入控制', implementationHint: '用于受控授权和角色隔离。', traceability: { inputConditions: ['第三方接入频繁'], riskConcerns: ['远程与第三方接入'] } },
        { id: 'req-3', capabilityId: 'logging-event', controlObjective: '边界与审计控制', implementationHint: '记录关键安全事件与访问行为。', traceability: { inputConditions: ['关键工艺连续性要求高'], riskConcerns: ['关键工艺连续性与安全后果'] } },
        { id: 'req-4', capabilityId: 'access-whitelist', controlObjective: '边界与审计控制', implementationHint: '约束跨区访问范围。', traceability: { inputConditions: ['关键工艺连续性要求高'], riskConcerns: ['关键工艺连续性与安全后果'] } }
      ],
      systemRules: ['所有跨区通信应具备业务理由并最小开放。', '远程访问必须通过受控入口并留痕。'],
      residualRisks: ['设备能力仍需结合实际部署条件确认。'],
      designBasisSummary: {
        keySystems: 'DCS 控制器、工程师站、远程跳板',
        externalConnections: 'MES、远程维护入口',
        maintenanceAccessPath: 'VPN -> DMZ 跳板 -> 工程师站',
        initialBoundaryNotes: '现有边界控制基础一般，需要进一步细化',
        continuityRequirements: '关键工艺不可中断',
        complianceNotes: '需满足审计留痕要求',
        designBasis: '关键控制区与远程接入区分离，跨区通信受控。'
      }
    },
    draft: {
      zones: ['control-cell', 'dmz', 'operations'],
      conduits: ['site-operations', 'remote-support'],
      assets: [
        { id: 'asset-1', name: '裂解炉 PLC', zone: 'control-cell', role: 'control', groupingReason: '同一工艺单元、相同控制信任边界' },
        { id: 'asset-2', name: '工程师站', zone: 'operations', role: 'engineering', groupingReason: '属于维护角色，不应直接与 PLC 同区' },
        { id: 'asset-3', name: '远程跳板', zone: 'dmz', role: 'server', groupingReason: '作为受控入口，承接外部访问' }
      ],
      communicationFlows: [
        { id: 'flow-1', source: 'operations', target: 'control-cell', protocol: 'OPC UA', direction: '双向', necessity: '操作监控和工艺数据访问', businessReason: '操作员站需要读取与下发受控指令', boundaryControl: '通过工业防火墙和白名单控制' },
        { id: 'flow-2', source: 'dmz', target: 'operations', protocol: 'HTTPS', direction: '双向', necessity: '远程维护受控接入', businessReason: '设备商经审批后通过跳板接入工程师站', boundaryControl: 'VPN + 跳板 + MFA + 审计' }
      ],
      targetSL: 3,
      requiredFR: ['FR1', 'FR2', 'FR6', 'FR7'],
      designBasis: '按照关键控制区与外部访问区隔离的原则设计，优先控制远程维护边界与跨区通信。'
    }
  },
  vendorCatalog: {
    capabilities: [
      {
        id: 'vendor-demo-1',
        productMeta: { productName: 'Demo Secure Gateway', productType: 'gateway', securityLevel: 3, deploymentScope: 'DMZ 与远程维护边界' },
        capabilityClaims: [
          { capabilityId: 'auth-password', satisfaction: 'fulfilled', implementationType: 'product', evidenceType: '测试报告', claimScope: '本机管理与远程接入登录', dependencyNote: '需接入统一账号体系更佳', limitationNote: '' },
          { capabilityId: 'access-rbac', satisfaction: 'partial', implementationType: 'shared', evidenceType: '厂家声明', claimScope: '本机角色权限', dependencyNote: '细粒度授权依赖上层平台', limitationNote: '默认角色模型较粗' },
          { capabilityId: 'logging-event', satisfaction: 'external', implementationType: 'external', evidenceType: '项目案例', claimScope: '本机可产生事件日志', dependencyNote: '需对接集中日志平台', limitationNote: '' },
          { capabilityId: 'access-whitelist', satisfaction: 'fulfilled', implementationType: 'product', evidenceType: '测试报告', claimScope: '支持访问白名单', dependencyNote: '', limitationNote: '' }
        ],
        dependencies: '建议配合集中身份管理与日志平台',
        limitations: '部分高级授权能力需要额外模块',
        requirementCoverage: 4
      }
    ],
    draft: {
      productMeta: { productName: 'Demo Secure Gateway', productType: 'gateway', securityLevel: 3, deploymentScope: 'DMZ 与远程维护边界' },
      capabilityClaims: [
        { capabilityId: 'auth-password', satisfaction: 'fulfilled', implementationType: 'product', evidenceType: '测试报告', claimScope: '本机管理与远程接入登录', dependencyNote: '需接入统一账号体系更佳', limitationNote: '' },
        { capabilityId: 'access-rbac', satisfaction: 'partial', implementationType: 'shared', evidenceType: '厂家声明', claimScope: '本机角色权限', dependencyNote: '细粒度授权依赖上层平台', limitationNote: '默认角色模型较粗' },
        { capabilityId: 'logging-event', satisfaction: 'external', implementationType: 'external', evidenceType: '项目案例', claimScope: '本机可产生事件日志', dependencyNote: '需对接集中日志平台', limitationNote: '' },
        { capabilityId: 'access-whitelist', satisfaction: 'fulfilled', implementationType: 'product', evidenceType: '测试报告', claimScope: '支持访问白名单', dependencyNote: '', limitationNote: '' }
      ],
      dependencies: '建议配合集中身份管理与日志平台',
      limitations: '部分高级授权能力需要额外模块'
    }
  },
  selectionAnalysis: {
    results: {
      results: [
        { id: 'req-1', capabilityId: 'auth-password', controlObjective: '远程接入控制', status: 'fulfilled', evidenceType: '测试报告', gapNote: '当前可满足项目要求。', severity: 'low', owner: '设备商' },
        { id: 'req-2', capabilityId: 'access-rbac', controlObjective: '远程接入控制', status: 'partial', evidenceType: '厂家声明', gapNote: '需配置或补充条件后满足。', severity: 'medium', owner: '设备商' },
        { id: 'req-3', capabilityId: 'logging-event', controlObjective: '边界与审计控制', status: 'external', evidenceType: '项目案例', gapNote: '需通过外围系统或边界控制补足。', severity: 'medium', owner: '集成商/业主' },
        { id: 'req-4', capabilityId: 'access-whitelist', controlObjective: '边界与审计控制', status: 'fulfilled', evidenceType: '测试报告', gapNote: '当前可满足项目要求。', severity: 'low', owner: '设备商' }
      ],
      summary: { high: 0, medium: 2, low: 2 }
    }
  },
  deliverables: { reports: [] }
};
