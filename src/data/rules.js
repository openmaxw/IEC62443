// IEC 62443 FR (Fundamental Requirements) 规则映射表

export const FR_CATEGORIES = {
  FR1: {
    name: '标识与认证控制',
    nameEn: 'Identification and Authentication Control',
    description: '对人员和设备进行唯一标识和身份验证',
    sr: ['SR1.1', 'SR1.2', 'SR1.3', 'SR1.4', 'SR1.5', 'SR1.6', 'SR1.7', 'SR1.8', 'SR1.9', 'SR1.10', 'SR1.11', 'SR1.12', 'SR1.13']
  },
  FR2: {
    name: '使用控制',
    nameEn: 'Use Control',
    description: '控制对系统和数据的访问权限',
    sr: ['SR2.1', 'SR2.2', 'SR2.3', 'SR2.4', 'SR2.5', 'SR2.6', 'SR2.7', 'SR2.8', 'SR2.9', 'SR2.10', 'SR2.11', 'SR2.12']
  },
  FR3: {
    name: '完整性',
    nameEn: 'Integrity',
    description: '保护系统和数据免受未经授权的修改',
    sr: ['SR3.1', 'SR3.2', 'SR3.3', 'SR3.4', 'SR3.5', 'SR3.6', 'SR3.7', 'SR3.8', 'SR3.9']
  },
  FR4: {
    name: '数据机密性',
    nameEn: 'Data Confidentiality',
    description: '保护敏感数据不被未经授权的访问',
    sr: ['SR4.1', 'SR4.2', 'SR4.3', 'SR4.4', 'SR4.5']
  },
  FR5: {
    name: '限制数据流',
    nameEn: 'Restricted Data Flow',
    description: '限制不同区域之间的数据流动',
    sr: ['SR5.1', 'SR5.2', 'SR5.3']
  },
  FR6: {
    name: '事件响应',
    nameEn: 'Response to Events',
    description: '对安全事件进行检测、报告和响应',
    sr: ['SR6.1', 'SR6.2', 'SR6.3']
  },
  FR7: {
    name: '可用性',
    nameEn: 'Availability',
    description: '确保系统在需要时可用',
    sr: ['SR7.1', 'SR7.2', 'SR7.3', 'SR7.4', 'SR7.5']
  },
  FR8: {
    name: '资源可用性',
    nameEn: 'Resource Availability',
    description: '确保计算和网络资源充足',
    sr: ['SR8.1', 'SR8.2', 'SR8.3', 'SR8.4', 'SR8.5']
  }
};

// SL (Security Level) 定义
export const SECURITY_LEVELS = {
  SL1: {
    level: 1,
    name: '安全级别 1',
    description: '防止意外违规行为',
    target: '普通工业环境'
  },
  SL2: {
    level: 2,
    name: '安全级别 2',
    description: '防止通过简单手段的故意违规',
    target: '有防护意识的攻击者'
  },
  SL3: {
    level: 3,
    name: '安全级别 3',
    description: '防止复杂手段的故意违规',
    target: '有资源的攻击者'
  },
  SL4: {
    level: 4,
    name: '安全级别 4',
    description: '防止最高级别的威胁',
    target: '高资源攻击者'
  }
};

// 风险等级映射规则
export const RISK_MAPPING = {
  downtimeTolerance: {
    critical: { level: 'high', weight: 3 },
    high: { level: 'high', weight: 2 },
    medium: { level: 'medium', weight: 1 },
    low: { level: 'low', weight: 0 }
  },
  dataSensitivity: {
    'top-secret': { level: 'high', weight: 3 },
    confidential: { level: 'high', weight: 2 },
    internal: { level: 'medium', weight: 1 },
    public: { level: 'low', weight: 0 }
  },
  remoteAccessNeed: {
    extensive: { level: 'high', weight: 2 },
    limited: { level: 'medium', weight: 1 },
    none: { level: 'low', weight: 0 }
  },
  thirdPartyAccess: {
    regular: { level: 'high', weight: 2 },
    occasional: { level: 'medium', weight: 1 },
    none: { level: 'low', weight: 0 }
  }
};

// SL 建议规则
export const SL_RECOMMENDATION = {
  highRisk: { min: 3, recommended: [2, 3, 4] },
  mediumRisk: { min: 2, recommended: [1, 2, 3] },
  lowRisk: { min: 1, recommended: [0, 1, 2] }
};

// 业主输入到 FR 的映射
export const OWNER_TO_FR = {
  availabilityPriority: {
    critical: ['FR7', 'FR8'],
    high: ['FR7'],
    medium: [],
    low: []
  },
  dataSensitivity: {
    'top-secret': ['FR4', 'FR3'],
    confidential: ['FR4'],
    internal: ['FR3'],
    public: []
  },
  remoteAccessNeed: {
    extensive: ['FR1', 'FR2'],
    limited: ['FR1'],
    none: []
  },
  thirdPartyAccess: {
    regular: ['FR1', 'FR2', 'FR5'],
    occasional: ['FR1', 'FR5'],
    none: []
  }
};
