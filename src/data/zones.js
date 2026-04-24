// Zone 和 Conduit 模板库

export const ZONE_TEMPLATES = [
  {
    id: 'zone-enterprise',
    name: '企业网络',
    description: '企业IT网络区域，用于办公和管理',
    securityLevel: 1,
    assets: ['办公终端', '服务器', '打印机'],
    typicalConduits: ['zone-dmz', 'zone-ot']
  },
  {
    id: 'zone-dmz',
    name: 'DMZ',
    description: '隔离区，用于对外服务',
    securityLevel: 2,
    assets: ['Web服务器', '邮件网关', 'VPN网关'],
    typicalConduits: ['zone-enterprise', 'zone-ot']
  },
  {
    id: 'zone-ot',
    name: 'OT网络',
    description: '运营技术网络区域，包含工业控制系统',
    securityLevel: 2,
    assets: ['PLC', 'DCS', 'SCADA服务器', '工业交换机'],
    typicalConduits: ['zone-dmz', 'zone-cell']
  },
  {
    id: 'zone-cell',
    name: '单元区域',
    description: '生产单元内部网络',
    securityLevel: 3,
    assets: ['PLC', 'HMI', '传感器', '执行器'],
    typicalConduits: ['zone-ot']
  },
  {
    id: 'zone-safety',
    name: '安全系统',
    description: '安全仪表系统区域',
    securityLevel: 4,
    assets: ['SIS控制器', '安全阀', '紧急停车按钮'],
    typicalConduits: ['zone-cell', 'zone-ot']
  },
  {
    id: 'zone-supervisory',
    name: '监控区域',
    description: '监控和数据采集区域',
    securityLevel: 2,
    assets: ['SCADA服务器', '历史数据库', '报警服务器'],
    typicalConduits: ['zone-cell', 'zone-ot']
  }
];

export const CONDUIT_TEMPLATES = [
  {
    id: 'conduit-ethernet',
    name: '以太网',
    type: 'ethernet',
    description: '标准以太网连接',
    typicalBandwidth: '100Mbps - 1Gbps'
  },
  {
    id: 'conduit-industrial-ethernet',
    name: '工业以太网',
    type: 'industrial-ethernet',
    description: '工业级以太网，支持冗余',
    typicalBandwidth: '1Gbps'
  },
  {
    id: 'conduit-fieldbus',
    name: '现场总线',
    type: 'fieldbus',
    description: '工业现场总线通信',
    typicalBandwidth: '1Mbps - 10Mbps'
  },
  {
    id: 'conduit-serial',
    name: '串行通信',
    type: 'serial',
    description: 'RS-232/RS-485串行通信',
    typicalBandwidth: '115Kbps'
  },
  {
    id: 'conduit-wireless',
    name: '无线通信',
    type: 'wireless',
    description: '工业无线通信',
    typicalBandwidth: '54Mbps - 300Mbps'
  }
];

// 通信协议模板
export const PROTOCOL_TEMPLATES = [
  { id: 'modbus-tcp', name: 'Modbus TCP', port: 502, layer: 4 },
  { id: 'opc-ua', name: 'OPC UA', port: 4840, layer: 4 },
  { id: 'ethernet-ip', name: 'EtherNet/IP', port: 44818, layer: 4 },
  { id: 'dnp3', name: 'DNP3', port: 20000, layer: 4 },
  { id: 'foundation-fieldbus', name: 'Foundation Fieldbus', port: null, layer: 1 },
  { id: 'profibus', name: 'PROFIBUS', port: null, layer: 1 },
  { id: 'profinet', name: 'PROFINET', port: null, layer: 2 },
  { id: 'hart', name: 'HART', port: null, layer: 1 }
];

// 默认分区方案
export const DEFAULT_ZONE_PLAN = [
  { zone: 'zone-enterprise', label: '企业网络' },
  { zone: 'zone-dmz', label: 'DMZ' },
  { zone: 'zone-supervisory', label: '监控区域' },
  { zone: 'zone-ot', label: 'OT网络' },
  { zone: 'zone-cell', label: '单元区域' },
  { zone: 'zone-safety', label: '安全系统' }
];
