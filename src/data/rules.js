// IEC 62443 FR (Fundamental Requirements) 规则映射表
// 参考标准: IEC 62443-3-3 (系统要求) 和 IEC 62443-4-2 (组件要求)

// SR (System/Component Requirements) 详细定义
export const SR_REQUIREMENTS = {
  // FR1: 标识与认证控制
  'SR1.1': { name: '人员标识', description: '系统应基于唯一标识识别所有人员', category: 'identification' },
  'SR1.2': { name: '设备标识', description: '系统应基于唯一标识识别所有设备', category: 'identification' },
  'SR1.3': { name: '多因素认证', description: '系统应支持多因素认证机制', category: 'authentication' },
  'SR1.4': { name: '账户管理', description: '系统应提供账户管理功能，包括创建、修改、删除账户', category: 'account' },
  'SR1.5': { name: '访问策略管理', description: '系统应支持基于角色的访问控制策略', category: 'policy' },
  'SR1.6': { name: '认证强度', description: '认证机制应具有足够的强度抵抗攻击', category: 'authentication' },
  'SR1.7': { name: '认证器管理', description: '系统应管理认证器（密码、证书、生物特征等）的生命周期', category: 'authentication' },
  'SR1.8': { name: '标识符管理', description: '系统应管理用户和设备的唯一标识符', category: 'identification' },
  'SR1.9': { name: '会话管理', description: '系统应管理安全会话，包括会话建立、维护和终止', category: 'session' },
  'SR1.10': { name: '凭证保护', description: '系统应保护用户凭证不被未授权访问', category: 'credential' },
  'SR1.11': { name: '证书管理', description: '系统应支持公钥基础设施证书管理', category: 'certificate' },
  'SR1.12': { name: '信任模型', description: '系统应建立和维护信任关系模型', category: 'trust' },
  'SR1.13': { name: '标识符变更', description: '系统应支持标识符的变更和重新关联', category: 'identification' },

  // FR2: 使用控制
  'SR2.1': { name: '特权访问授权', description: '系统应强制执行特权账户的授权策略', category: 'authorization' },
  'SR2.2': { name: '非特权访问授权', description: '系统应强制执行非特权账户的最小权限原则', category: 'authorization' },
  'SR2.3': { name: '权限管理', description: '系统应管理权限的分配、变更和撤销', category: 'privilege' },
  'SR2.4': { name: '主动验证支持', description: '系统应支持对权限使用的主动验证', category: 'verification' },
  'SR2.5': { name: '会话完整性', description: '系统应维护会话的安全性和完整性', category: 'session' },
  'SR2.6': { name: '审计日志可用性', description: '系统应确保审计日志的可用性', category: 'audit' },
  'SR2.7': { name: '信息上传控制', description: '系统应控制非授权信息的上传', category: 'control' },
  'SR2.8': { name: '信息下载控制', description: '系统应控制非授权信息的下载', category: 'control' },
  'SR2.9': { name: '信息删除控制', description: '系统应控制非授权信息的删除', category: 'control' },
  'SR2.10': { name: '访问拒绝恢复', description: '系统应防止因访问控制导致的拒绝服务', category: 'availability' },
  'SR2.11': { name: '安全功能隔离', description: '系统应隔离安全相关功能', category: 'isolation' },
  'SR2.12': { name: '访问历史', description: '系统应维护访问历史记录', category: 'audit' },

  // FR3: 完整性
  'SR3.1': { name: '软件完整性', description: '系统应保护软件和配置的完整性', category: 'integrity' },
  'SR3.2': { name: '数据和配置真实性', description: '系统应验证数据和配置的真实性', category: 'authenticity' },
  'SR3.3': { name: '固件完整性', description: '系统应验证固件的完整性', category: 'integrity' },
  'SR3.4': { name: '配置变更审计', description: '系统应审计配置变更', category: 'audit' },
  'SR3.5': { name: '恶意软件防护', description: '系统应提供恶意软件检测和防护能力', category: 'malware' },
  'SR3.6': { name: '完整性恢复', description: '系统应支持完整性的恢复', category: 'recovery' },
  'SR3.7': { name: '操作真实性', description: '系统应验证操作来源的真实性', category: 'authenticity' },
  'SR3.8': { name: '操作不可否认性', description: '系统应提供操作不可否认性', category: 'non-repudiation' },
  'SR3.9': { name: '变更影响评估', description: '系统应评估变更对安全性的影响', category: 'assessment' },

  // FR4: 数据机密性
  'SR4.1': { name: '数据传输保密性', description: '系统应保护传输中数据的机密性', category: 'confidentiality' },
  'SR4.2': { name: '数据存储保密性', description: '系统应保护存储数据的机密性', category: 'confidentiality' },
  'SR4.3': { name: '网络隔离', description: '系统应支持网络隔离和数据流控制', category: 'isolation' },
  'SR4.4': { name: '密钥管理', description: '系统应提供安全的密钥管理', category: 'key' },
  'SR4.5': { name: '会话机密性', description: '系统应保护会话信息的机密性', category: 'confidentiality' },

  // FR5: 限制数据流
  'SR5.1': { name: '边界保护', description: '系统应在区域边界实施访问控制', category: 'boundary' },
  'SR5.2': { name: '区域隔离', description: '系统应实施区域间隔离', category: 'isolation' },
  'SR5.3': { name: '深度防御', description: '系统应实施多层次数据流控制', category: 'defense' },

  // FR6: 对事件的及时响应 (Timely Response to Events)
  'SR6.1': { name: '安全事件通知', description: '系统应及时通知安全事件', category: 'notification' },
  'SR6.2': { name: '安全审计', description: '系统应提供安全审计能力', category: 'audit' },
  'SR6.3': { name: '事件报告', description: '系统应支持安全事件的报告', category: 'reporting' },

  // FR7: 可用性
  'SR7.1': { name: '容错', description: '系统应具备容错能力', category: 'fault' },
  'SR7.2': { name: '资源冗余', description: '系统应提供资源冗余', category: 'redundancy' },
  'SR7.3': { name: '数据恢复', description: '系统应支持数据恢复', category: 'recovery' },
  'SR7.4': { name: '系统恢复', description: '系统应支持系统恢复', category: 'recovery' },
  'SR7.5': { name: '拒绝服务防护', description: '系统应防护拒绝服务攻击', category: 'dos' },

  // FR8: 资源可用性
  'SR8.1': { name: '资源管理', description: '系统应管理计算和网络资源', category: 'resource' },
  'SR8.2': { name: '性能监控', description: '系统应监控性能指标', category: 'monitoring' },
  'SR8.3': { name: '容量规划', description: '系统应支持容量规划', category: 'capacity' },
  'SR8.4': { name: '报警管理', description: '系统应管理资源可用性报警', category: 'alarm' },
  'SR8.5': { name: '资源可用性保护', description: '系统应保护关键资源的可用性', category: 'protection' }
};

// SL (Security Level) 概念定义 (IEC 62443-3-3)
// SL-T: Target Security Level - 目标安全等级
// SL-A: Achieved Security Level - 实际达到的安全等级
// SL-C: Capability Security Level - 能力安全等级（系统设计时声称的）
export const SL_CONCEPTS = {
  SL_T: {
    name: '目标安全等级',
    nameEn: 'Target Security Level',
    description: '资产所有者期望系统达到的安全等级'
  },
  SL_A: {
    name: '实际安全等级',
    nameEn: 'Achieved Security Level',
    description: '系统通过补偿控制后实际达到的安全等级'
  },
  SL_C: {
    name: '能力安全等级',
    nameEn: 'Capability Security Level',
    description: '产品或系统设计时声称能达到的安全等级'
  }
};

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
    name: '对事件的及时响应',
    nameEn: 'Timely Response to Events',
    description: '对安全事件进行及时的检测、报告和响应',
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
    target: '普通工业环境，无特殊威胁'
  },
  SL2: {
    level: 2,
    name: '安全级别 2',
    description: '防止通过简单手段的故意违规',
    target: '有防护意识的攻击者，使用基本攻击手段'
  },
  SL3: {
    level: 3,
    name: '安全级别 3',
    description: '防止复杂手段的故意违规',
    target: '有资源的攻击者，使用高级攻击技术'
  },
  SL4: {
    level: 4,
    name: '安全级别 4',
    description: '防止扩展入侵攻击',
    target: '高资源攻击者，使用高级持续性威胁（APT）手段'
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

// 业务影响说明（业主视角）
export const BUSINESS_IMPACT = {
  SL1: {
    recommendations: ['部署基础网络隔离', '实施基本访问控制', '建立安全运维流程'],
    auditFrequency: '年度安全审计',
    typicalInvestment: '基础'
  },
  SL2: {
    recommendations: ['部署工业防火墙', '实施网络分段（Zone/Conduit）', '启用安全事件日志', '每半年进行渗透测试'],
    auditFrequency: '半年度安全审计',
    typicalInvestment: '中等'
  },
  SL3: {
    recommendations: ['部署纵深防御体系', '启用 IDS/IPS 入侵检测', '实施数据加密传输', '配置工控主机安全加固', '季度安全审计'],
    auditFrequency: '季度安全审计',
    typicalInvestment: '较高'
  },
  SL4: {
    recommendations: ['建立完整的安全运营中心（SOC）', '部署高级持续性威胁（APT）防护', '实施零信任架构', '月度安全审计'],
    auditFrequency: '月度安全审计',
    typicalInvestment: '高'
  }
};