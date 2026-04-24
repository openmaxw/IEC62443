// 行业模板数据

export const INDUSTRIES = [
  {
    id: 'manufacturing',
    name: '离散制造业',
    nameEn: 'Discrete Manufacturing',
    description: '汽车、电子、机械等离散制造',
    icon: 'factory',
    painPoints: [
      '生产节拍中断',
      '产品质量追溯困难',
      '设备通信协议多样',
      '第三方维护人员访问'
    ],
    typicalAssets: [
      '数控机床',
      '机器人控制器',
      'PLC',
      '物料输送系统'
    ]
  },
  {
    id: 'process',
    name: '流程制造业',
    nameEn: 'Process Industry',
    description: '化工、石油、食品等流程工业',
    icon: 'flask',
    painPoints: [
      '连续生产不可中断',
      '安全环保要求高',
      '配方和工艺保密',
      ' Regulatory compliance'
    ],
    typicalAssets: [
      'DCS分布式控制系统',
      'SIS安全仪表系统',
      ' Batch控制器',
      '过程分析仪'
    ]
  },
  {
    id: 'energy',
    name: '能源行业',
    nameEn: 'Energy',
    description: '电力、石油天然气、可再生能源',
    icon: 'bolt',
    painPoints: [
      '电网稳定运行要求',
      '分布式能源接入',
      '网络安全监管严格',
      '实时控制需求'
    ],
    typicalAssets: [
      'RTU远动终端',
      '保护继电器',
      'SCADA主站',
      'PMU相量测量单元'
    ]
  },
  {
    id: 'water',
    name: '水处理',
    nameEn: 'Water Treatment',
    description: '供水、排水、水处理',
    icon: 'droplet',
    painPoints: [
      '饮用水安全',
      '设施远程分布',
      '泵站节能优化',
      '水质监测'
    ],
    typicalAssets: [
      '取水泵站PLC',
      '加药间控制系统',
      '消毒系统',
      '在线水质分析仪'
    ]
  },
  {
    id: 'building',
    name: '建筑楼宇',
    nameEn: 'Building Automation',
    description: '智能建筑、智慧园区',
    icon: 'building',
    painPoints: [
      '多系统集成',
      '能耗管理',
      '舒适度控制',
      '运维人员管理'
    ],
    typicalAssets: [
      'BA服务器',
      '空调控制系统',
      '电梯控制系统',
      '门禁系统'
    ]
  },
  {
    id: 'transportation',
    name: '交通运输',
    nameEn: 'Transportation',
    description: '轨道交通、道路交通、港口',
    icon: 'train',
    painPoints: [
      '关键基础设施保护',
      '乘客安全',
      '实时调度',
      '防恐要求'
    ],
    typicalAssets: [
      '信号控制系统',
      'AFC售检票系统',
      '综合监控系统',
      '通信系统'
    ]
  }
];

// 资产类别
export const ASSET_CATEGORIES = [
  {
    id: 'control',
    name: '控制设备',
    assets: ['PLC', 'DCS', 'RTU', 'IED', '控制器']
  },
  {
    id: 'monitoring',
    name: '监控设备',
    assets: ['SCADA', 'HMI', '操作员站', '工程师站']
  },
  {
    id: 'network',
    name: '网络设备',
    assets: ['工业交换机', '路由器', '防火墙', 'VPN设备']
  },
  {
    id: 'safety',
    name: '安全设备',
    assets: ['SIS', 'ESD', 'GWS', '安全继电器']
  },
  {
    id: 'field',
    name: '现场设备',
    assets: ['传感器', '执行器', '变送器', '阀门']
  },
  {
    id: 'computing',
    name: '计算设备',
    assets: ['服务器', '工作站', '存储设备']
  }
];
