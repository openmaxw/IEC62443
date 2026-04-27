// 设备能力标签定义

export const CAPABILITY_CATEGORIES = {
  auth: {
    name: '身份认证',
    nameEn: 'Authentication',
    description: '用户和设备身份验证能力'
  },
  access: {
    name: '访问控制',
    nameEn: 'Access Control',
    description: '基于角色的访问控制能力'
  },
  integrity: {
    name: '完整性保护',
    nameEn: 'Integrity Protection',
    description: '数据和系统完整性保护能力'
  },
  encryption: {
    name: '加密能力',
    nameEn: 'Encryption',
    description: '数据加密和解密能力'
  },
  logging: {
    name: '日志记录',
    nameEn: 'Logging',
    description: '安全事件日志记录能力'
  },
  audit: {
    name: '审计能力',
    nameEn: 'Audit',
    description: '安全审计和合规检查能力'
  }
};

// 能力选项列表
export const CAPABILITY_OPTIONS = {
  auth: [
    { id: 'auth-password', label: '密码认证', fr: 'FR1', sr: ['SR1.1'] },
    { id: 'auth-multi-factor', label: '多因素认证', fr: 'FR1', sr: ['SR1.3'] },
    { id: 'auth-certificate', label: '证书认证', fr: 'FR1', sr: ['SR1.2'] },
    { id: 'auth-biometric', label: '生物识别', fr: 'FR1', sr: ['SR1.4'] },
    { id: 'auth-single-sign', label: '单点登录', fr: 'FR1', sr: ['SR1.5'] },
    { id: 'auth-session', label: '会话管理', fr: 'FR1', sr: ['SR1.6'] }
  ],
  access: [
    { id: 'access-rbac', label: '基于角色的访问控制', fr: 'FR2', sr: ['SR2.1'] },
    { id: 'access-whitelist', label: '白名单控制', fr: 'FR2', sr: ['SR2.2'] },
    { id: 'access-privilege', label: '最小权限原则', fr: 'FR2', sr: ['SR2.3'] },
    { id: 'access-policy', label: '安全策略执行', fr: 'FR2', sr: ['SR2.4'] },
    { id: 'access-revoke', label: '权限撤销机制', fr: 'FR2', sr: ['SR2.5'] }
  ],
  integrity: [
    { id: 'integrity-crc', label: 'CRC校验', fr: 'FR3', sr: ['SR3.1'] },
    { id: 'integrity-crypto', label: '数字签名', fr: 'FR3', sr: ['SR3.2'] },
    { id: 'integrity-hash', label: '哈希校验', fr: 'FR3', sr: ['SR3.3'] },
    { id: 'integrity-firmware', label: '固件完整性验证', fr: 'FR3', sr: ['SR3.4'] },
    { id: 'integrity-malware', label: '恶意软件检测', fr: 'FR3', sr: ['SR3.5'] }
  ],
  encryption: [
    { id: 'encryption-tls', label: 'TLS/SSL加密', fr: 'FR4', sr: ['SR4.1'] },
    { id: 'encryption-ipsec', label: 'IPsec VPN', fr: 'FR4', sr: ['SR4.2'] },
    { id: 'encryption-aes', label: 'AES加密', fr: 'FR4', sr: ['SR4.3'] },
    { id: 'encryption-key', label: '密钥管理', fr: 'FR4', sr: ['SR4.4'] }
  ],
  logging: [
    { id: 'logging-event', label: '安全事件日志', fr: 'FR6', sr: ['SR6.1'] },
    { id: 'logging-audit', label: '审计日志', fr: 'FR6', sr: ['SR6.2'] },
    { id: 'logging-syslog', label: 'Syslog上报', fr: 'FR6', sr: ['SR6.3'] },
    { id: 'logging-alarm', label: '报警记录', fr: 'FR6', sr: ['SR6.1'] }
  ],
  audit: [
    { id: 'audit-compliance', label: '合规检查', fr: 'FR6', sr: ['SR6.2'] },
    { id: 'audit-report', label: '报表生成', fr: 'FR6', sr: ['SR6.2'] },
    { id: 'audit-forage', label: '取证能力', fr: 'FR6', sr: ['SR6.3'] }
  ]
};

// 能力成熟度等级（与 IEC 62443 SL 等级不同，这是评估能力实现深度）
export const CAPABILITY_MATURITY = [
  { level: 1, name: '基础', description: '具备基本安全能力，满足最低要求' },
  { level: 2, name: '标准', description: '符合行业安全标准和最佳实践' },
  { level: 3, name: '高级', description: '增强型安全防护，主动威胁检测' },
  { level: 4, name: '卓越', description: '全面级安全防护，高级持续性威胁防护' }
];

// 产品类型
export const PRODUCT_TYPES = [
  { id: 'plc', name: 'PLC控制器', icon: 'cpu' },
  { id: 'scada', name: 'SCADA系统', icon: 'monitor' },
  { id: 'hmi', name: 'HMI人机界面', icon: 'display' },
  { id: 'firewall', name: '工业防火墙', icon: 'shield' },
  { id: 'switch', name: '工业交换机', icon: 'network' },
  { id: 'ids', name: '工业IDS/IPS', icon: 'radar' },
  { id: 'endpoint', name: '工控主机/终端', icon: 'computer' },
  { id: 'gateway', name: '通信网关', icon: 'router' },
  { id: 'sensor', name: '传感器/执行器', icon: 'thermometer' },
  { id: 'sis', name: '安全仪表系统', icon: 'alert-triangle' }
];
