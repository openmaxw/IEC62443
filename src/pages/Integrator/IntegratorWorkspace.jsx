import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, ProgressBar } from '../../components/Common';
import { useOwnerPath, useProject } from '../../hooks/useProject';
import { ZONE_TEMPLATES, CONDUIT_TEMPLATES } from '../../data/zones';
import styles from './IntegratorWorkspace.module.css';

const STEPS = [
  { id: 'zones', title: '分区规划', description: '定义安全区域和边界' },
  { id: 'conduits', title: '管道设计', description: '规划区域间通信通道' },
  { id: 'assets', title: '资产配置', description: '将资产分配到对应区域' },
  { id: 'flows', title: '通信矩阵', description: '定义允许的数据流' },
  { id: 'rules', title: '规则生成', description: '生成系统级安全规则' }
];

export function IntegratorWorkspace() {
  const navigate = useNavigate();
  const { assessment, riskProfile } = useOwnerPath();
  const { actions } = useProject();

  const [currentStep, setCurrentStep] = useState(0);
  const [plan, setPlan] = useState({
    zones: [],
    conduits: [],
    assets: [],
    communicationFlows: [],
    securityRules: [],
    targetSL: riskProfile?.recommendedSL?.[0]?.level || 2,
    requiredFR: riskProfile?.frDimensions?.map(f => f.code) || []
  });

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    actions.setIntegratorPlan(plan);
    navigate('/integrator/result');
  };

  const updatePlan = (field, value) => {
    setPlan(prev => ({ ...prev, [field]: value }));
  };

  const toggleZone = (zoneId) => {
    setPlan(prev => {
      const zones = prev.zones.includes(zoneId)
        ? prev.zones.filter(z => z !== zoneId)
        : [...prev.zones, zoneId];
      return { ...prev, zones };
    });
  };

  const toggleConduit = (conduitId) => {
    setPlan(prev => {
      const conduits = prev.conduits.includes(conduitId)
        ? prev.conduits.filter(c => c !== conduitId)
        : [...prev.conduits, conduitId];
      return { ...prev, conduits };
    });
  };

  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
      case 'zones':
        return (
          <div className={styles.stepContent}>
            <p className={styles.stepHint}>
              选择需要创建的安全区域。系统会根据您的风险评估自动推荐合适的分区方案。
            </p>
            <div className={styles.zoneGrid}>
              {ZONE_TEMPLATES.map(zone => (
                <Card
                  key={zone.id}
                  className={styles.zoneCard}
                  variant={plan.zones.includes(zone.id) ? 'accent' : 'default'}
                  onClick={() => toggleZone(zone.id)}
                >
                  <div className={styles.zoneHeader}>
                    <Badge variant={getSLBadgeVariant(zone.securityLevel)}>
                      SL{zone.securityLevel}
                    </Badge>
                    <h4>{zone.name}</h4>
                  </div>
                  <p className={styles.zoneDesc}>{zone.description}</p>
                  <div className={styles.zoneAssets}>
                    <span>典型资产：</span>
                    {zone.assets.join(', ')}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'conduits':
        return (
          <div className={styles.stepContent}>
            <p className={styles.stepHint}>
              选择区域之间通信使用的管道类型。
            </p>
            <div className={styles.conduitGrid}>
              {CONDUIT_TEMPLATES.map(conduit => (
                <Card
                  key={conduit.id}
                  className={styles.conduitCard}
                  variant={plan.conduits.includes(conduit.id) ? 'accent' : 'default'}
                  onClick={() => toggleConduit(conduit.id)}
                >
                  <div className={styles.conduitHeader}>
                    <h4>{conduit.name}</h4>
                    <Badge variant="info">{conduit.type}</Badge>
                  </div>
                  <p className={styles.conduitDesc}>{conduit.description}</p>
                  <div className={styles.conduitBandwidth}>
                    典型带宽: {conduit.typicalBandwidth}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'assets':
        return (
          <div className={styles.stepContent}>
            <p className={styles.stepHint}>
              定义需要保护的资产及其对应的安全区域。
            </p>
            <div className={styles.assetConfig}>
              <div className={styles.assetRow}>
                <span className={styles.assetLabel}>资产名称</span>
                <span className={styles.assetLabel}>所属区域</span>
                <span className={styles.assetLabel}>操作</span>
              </div>
              {plan.assets.length === 0 ? (
                <div className={styles.emptyAssets}>
                  暂无资产配置，点击下方按钮添加
                </div>
              ) : (
                plan.assets.map((asset, idx) => (
                  <div key={idx} className={styles.assetRow}>
                    <span>{asset.name}</span>
                    <Badge variant="default">{asset.zone}</Badge>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => {
                        const newAssets = [...plan.assets];
                        newAssets.splice(idx, 1);
                        updatePlan('assets', newAssets);
                      }}
                    >
                      删除
                    </Button>
                  </div>
                ))
              )}
              <div className={styles.addAsset}>
                <input
                  type="text"
                  className={styles.assetInput}
                  placeholder="输入资产名称"
                  id="assetInput"
                />
                <select
                  className={styles.assetSelect}
                  id="zoneSelect"
                  defaultValue=""
                >
                  <option value="" disabled>选择区域</option>
                  {plan.zones.map(z => {
                    const zone = ZONE_TEMPLATES.find(zt => zt.id === z);
                    return (
                      <option key={z} value={z}>
                        {zone?.name || z}
                      </option>
                    );
                  })}
                </select>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    const input = document.getElementById('assetInput');
                    const select = document.getElementById('zoneSelect');
                    if (input.value && select.value) {
                      updatePlan('assets', [
                        ...plan.assets,
                        { name: input.value, zone: select.value }
                      ]);
                      input.value = '';
                    }
                  }}
                >
                  添加
                </Button>
              </div>
            </div>
          </div>
        );

      case 'flows':
        return (
          <div className={styles.stepContent}>
            <p className={styles.stepHint}>
              定义允许的通信数据流。设置源区域、目标区域和通信协议。
            </p>
            <div className={styles.flowMatrix}>
              <div className={styles.flowRow}>
                <span>源区域</span>
                <span>目标区域</span>
                <span>协议</span>
                <span>操作</span>
              </div>
              {plan.communicationFlows.length === 0 ? (
                <div className={styles.emptyFlows}>
                  暂无通信配置，点击下方按钮添加
                </div>
              ) : (
                plan.communicationFlows.map((flow, idx) => (
                  <div key={idx} className={styles.flowRow}>
                    <Badge variant="primary">{flow.source}</Badge>
                    <Badge variant="info">{flow.target}</Badge>
                    <span>{flow.protocol}</span>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => {
                        const newFlows = [...plan.communicationFlows];
                        newFlows.splice(idx, 1);
                        updatePlan('communicationFlows', newFlows);
                      }}
                    >
                      删除
                    </Button>
                  </div>
                ))
              )}
              <div className={styles.addFlow}>
                <select id="sourceSelect" defaultValue="">
                  <option value="" disabled>源区域</option>
                  {plan.zones.map(z => {
                    const zone = ZONE_TEMPLATES.find(zt => zt.id === z);
                    return (
                      <option key={z} value={z}>
                        {zone?.name || z}
                      </option>
                    );
                  })}
                </select>
                <select id="targetSelect" defaultValue="">
                  <option value="" disabled>目标区域</option>
                  {plan.zones.map(z => {
                    const zone = ZONE_TEMPLATES.find(zt => zt.id === z);
                    return (
                      <option key={z} value={z}>
                        {zone?.name || z}
                      </option>
                    );
                  })}
                </select>
                <select id="protocolSelect" defaultValue="">
                  <option value="" disabled>协议</option>
                  <option value="Modbus TCP">Modbus TCP</option>
                  <option value="OPC UA">OPC UA</option>
                  <option value="EtherNet/IP">EtherNet/IP</option>
                  <option value="DNP3">DNP3</option>
                </select>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    const source = document.getElementById('sourceSelect').value;
                    const target = document.getElementById('targetSelect').value;
                    const protocol = document.getElementById('protocolSelect').value;
                    if (source && target && protocol) {
                      updatePlan('communicationFlows', [
                        ...plan.communicationFlows,
                        { source, target, protocol }
                      ]);
                    }
                  }}
                >
                  添加
                </Button>
              </div>
            </div>
          </div>
        );

      case 'rules':
        return (
          <div className={styles.stepContent}>
            <p className={styles.stepHint}>
              基于您的配置，系统生成了以下安全规则建议。
            </p>
            <div className={styles.rulesList}>
              {generateRules(plan).map((rule, idx) => (
                <Card key={idx} className={styles.ruleCard} variant="default">
                  <div className={styles.ruleHeader}>
                    <Badge variant="primary">{rule.fr}</Badge>
                    <span className={styles.ruleTitle}>{rule.title}</span>
                  </div>
                  <p className={styles.ruleDesc}>{rule.description}</p>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (STEPS[currentStep].id) {
      case 'zones':
        return plan.zones.length > 0;
      case 'conduits':
        return plan.conduits.length > 0;
      case 'assets':
        return true;
      case 'flows':
        return true;
      case 'rules':
        return true;
      default:
        return false;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>集成商系统规划</h1>
        <p className={styles.subtitle}>
          基于业主需求，制定分区分域与安全规则方案
        </p>
      </div>

      <div className={styles.progressSection}>
        <div className={styles.progressInfo}>
          <span>步骤 {currentStep + 1} / {STEPS.length}</span>
          <span className={styles.stepTitle}>{STEPS[currentStep].title}</span>
        </div>
        <ProgressBar value={progress} variant="primary" showLabel size="large" />
      </div>

      {/* Summary Info */}
      <Card className={styles.summaryCard}>
        <div className={styles.summaryRow}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>目标安全等级</span>
            <span className={styles.summaryValue}>SL {plan.targetSL}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>已选区域</span>
            <span className={styles.summaryValue}>{plan.zones.length}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>已配置资产</span>
            <span className={styles.summaryValue}>{plan.assets.length}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>通信数据流</span>
            <span className={styles.summaryValue}>{plan.communicationFlows.length}</span>
          </div>
        </div>
      </Card>

      <Card className={styles.stepCard}>
        <div className={styles.stepHeader}>
          <h3>{STEPS[currentStep].title}</h3>
          <p>{STEPS[currentStep].description}</p>
        </div>
        <div className={styles.stepContentWrapper}>
          {renderStepContent()}
        </div>
      </Card>

      <div className={styles.navigation}>
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          上一步
        </Button>
        {currentStep < STEPS.length - 1 ? (
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            下一步
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleComplete}
            disabled={!canProceed()}
          >
            生成方案
          </Button>
        )}
      </div>
    </div>
  );
}

function getSLBadgeVariant(level) {
  switch (level) {
    case 4: return 'danger';
    case 3: return 'warning';
    case 2: return 'info';
    default: return 'success';
  }
}

function generateRules(plan) {
  const rules = [];

  // FR1 rules
  rules.push({
    fr: 'FR1',
    title: '标识与认证',
    description: '所有远程访问会话必须使用多因素认证。建立会话管理策略，包括超时控制和会话终止机制。'
  });

  // FR2 rules
  rules.push({
    fr: 'FR2',
    title: '使用控制',
    description: '基于角色的访问控制(RBAC)应用于所有系统和数据访问。每个用户角色应遵循最小权限原则。'
  });

  // FR3 rules
  rules.push({
    fr: 'FR3',
    title: '完整性保护',
    description: '配置篡改检测机制，包括配置变更日志、固件验证和安全事件审计。'
  });

  // FR5 rules
  rules.push({
    fr: 'FR5',
    title: '限制数据流',
    description: `配置Zone ${plan.zones.length}个区域之间的数据流控制策略。使用深度防御架构确保只有授权的数据流通过。`
  });

  // FR6 rules
  rules.push({
    fr: 'FR6',
    title: '事件响应',
    description: '建立安全事件检测、报告和响应流程。配置Syslog或等价机制用于集中日志收集。'
  });

  return rules;
}
