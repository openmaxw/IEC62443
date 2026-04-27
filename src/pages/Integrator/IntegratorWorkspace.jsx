import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, ProgressBar } from '../../components/Common';
import { useOwnerPath, useProject } from '../../hooks/useProject';
import { ZONE_TEMPLATES, CONDUIT_TEMPLATES, PROTOCOL_TEMPLATES } from '../../data/zones';
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

  // Zone安全等级覆盖（集成商可调整）
  const [zoneSLOverrides, setZoneSLOverrides] = useState({});

  // 资产配置表单状态
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetZone, setNewAssetZone] = useState('');

  // 通信流表单状态
  const [newFlowSource, setNewFlowSource] = useState('');
  const [newFlowTarget, setNewFlowTarget] = useState('');
  const [newFlowProtocol, setNewFlowProtocol] = useState('');

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

  const updateZoneSL = (zoneId, newSL) => {
    setZoneSLOverrides(prev => ({ ...prev, [zoneId]: newSL }));
  };

  const getZoneEffectiveSL = (zoneId) => {
    const zoneTemplate = ZONE_TEMPLATES.find(z => z.id === zoneId);
    return zoneSLOverrides[zoneId] ?? zoneTemplate?.securityLevel ?? 1;
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
              点击区域卡片可调整其目标安全等级。
            </p>
            <div className={styles.zoneGrid}>
              {ZONE_TEMPLATES.map(zone => {
                const isSelected = plan.zones.includes(zone.id);
                const effectiveSL = getZoneEffectiveSL(zone.id);
                return (
                  <div
                    key={zone.id}
                    className={`${styles.zoneCard} ${isSelected ? styles.selected : ''}`}
                    onClick={() => toggleZone(zone.id)}
                  >
                    <Card variant={isSelected ? 'accent' : 'default'} className={styles.zoneCardInner}>
                      <div className={styles.zoneHeader}>
                        <Badge variant={getSLBadgeVariant(effectiveSL)}>
                          SL{effectiveSL}
                        </Badge>
                        <h4>{zone.name}</h4>
                      </div>
                      <p className={styles.zoneDesc}>{zone.description}</p>
                      <div className={styles.zoneAssets}>
                        <span>典型资产：</span>
                        {zone.assets.join(', ')}
                      </div>
                      <div className={styles.zoneBoundary}>
                        <span className={styles.detailLabel}>边界控制:</span>
                        <div className={styles.boundaryTags}>
                          {zone.boundaryControls.map((ctrl, idx) => (
                            <Badge key={idx} variant="default" size="small">{ctrl}</Badge>
                          ))}
                        </div>
                      </div>
                      {isSelected && (
                        <div className={styles.zoneSLEditor} onClick={(e) => e.stopPropagation()}>
                          <span className={styles.detailLabel}>调整目标SL:</span>
                          <div className={styles.slButtons}>
                            {[1, 2, 3, 4].map(sl => (
                              <button
                                key={sl}
                                className={`${styles.slButton} ${effectiveSL === sl ? styles.active : ''}`}
                                onClick={() => updateZoneSL(zone.id, sl)}
                              >
                                SL{sl}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>
                );
              })}
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
                  <div className={styles.conduitDetails}>
                    <div className={styles.conduitBandwidth}>
                      <span className={styles.detailLabel}>典型带宽:</span>
                      <span>{conduit.typicalBandwidth}</span>
                    </div>
                    <div className={styles.conduitMaxSL}>
                      <span className={styles.detailLabel}>支持SL:</span>
                      <Badge variant={conduit.maxSL >= 3 ? 'warning' : 'success'}>SL{conduit.maxSL}</Badge>
                    </div>
                  </div>
                  <div className={styles.conduitSecurity}>
                    <span className={styles.detailLabel}>安全措施:</span>
                    <div className={styles.securityTags}>
                      {conduit.securityMeasures.map((measure, idx) => (
                        <Badge key={idx} variant="default" size="small">{measure}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className={styles.conduitProtocols}>
                    <span className={styles.detailLabel}>典型协议:</span>
                    <span className={styles.protocolList}>{conduit.typicalProtocols.join(', ')}</span>
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
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                />
                <select
                  className={styles.assetSelect}
                  value={newAssetZone}
                  onChange={(e) => setNewAssetZone(e.target.value)}
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
                    if (newAssetName && newAssetZone) {
                      updatePlan('assets', [
                        ...plan.assets,
                        { name: newAssetName, zone: newAssetZone }
                      ]);
                      setNewAssetName('');
                      setNewAssetZone('');
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
              <div className={styles.flowRowHeader}>
                <span>源区域</span>
                <span>目标区域</span>
                <span>协议</span>
                <span>安全等级</span>
                <span>操作</span>
              </div>
              {plan.communicationFlows.length === 0 ? (
                <div className={styles.emptyFlows}>
                  暂无通信配置，点击下方按钮添加
                </div>
              ) : (
                plan.communicationFlows.map((flow, idx) => (
                  <div key={idx} className={styles.flowRow}>
                    <Badge variant="primary">{flow.sourceZoneName || flow.source}</Badge>
                    <Badge variant="info">{flow.targetZoneName || flow.target}</Badge>
                    <div className={styles.flowProtocol}>
                      <span>{flow.protocol}</span>
                      <Badge variant={flow.protocolSecurity === 'high' ? 'success' : flow.protocolSecurity === 'medium' ? 'warning' : 'default'} size="small">
                        {flow.protocolSecurity === 'high' ? '高安全' : flow.protocolSecurity === 'medium' ? '中安全' : '基础'}
                      </Badge>
                    </div>
                    <Badge variant="default" size="small">SL{flow.requiredSL || plan.targetSL}</Badge>
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
                <select value={newFlowSource} onChange={(e) => setNewFlowSource(e.target.value)}>
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
                <select value={newFlowTarget} onChange={(e) => setNewFlowTarget(e.target.value)}>
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
                <select value={newFlowProtocol} onChange={(e) => setNewFlowProtocol(e.target.value)}>
                  <option value="" disabled>协议</option>
                  {PROTOCOL_TEMPLATES.map(p => (
                    <option key={p.id} value={p.name}>
                      {p.name} {p.security === 'high' ? '🔒' : ''}
                    </option>
                  ))}
                </select>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    if (newFlowSource && newFlowTarget && newFlowProtocol) {
                      const sourceZone = ZONE_TEMPLATES.find(z => z.id === newFlowSource);
                      const targetZone = ZONE_TEMPLATES.find(z => z.id === newFlowTarget);
                      const protocol = PROTOCOL_TEMPLATES.find(p => p.name === newFlowProtocol);
                      updatePlan('communicationFlows', [
                        ...plan.communicationFlows,
                        {
                          source: newFlowSource,
                          sourceZoneName: sourceZone?.name || newFlowSource,
                          target: newFlowTarget,
                          targetZoneName: targetZone?.name || newFlowTarget,
                          protocol: newFlowProtocol,
                          protocolSecurity: protocol?.security || 'basic',
                          requiredSL: plan.targetSL
                        }
                      ]);
                      setNewFlowSource('');
                      setNewFlowTarget('');
                      setNewFlowProtocol('');
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
                  <div className={styles.ruleSrLevel}>
                    <Badge variant="info" size="small">SR级别: {rule.srLevel}</Badge>
                  </div>
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
  const targetSL = plan.targetSL;

  // FR1 rules - 基于目标安全等级
  rules.push({
    fr: 'FR1',
    title: '标识与认证控制',
    description: getFRDescription('FR1', targetSL),
    srLevel: targetSL >= 2 ? 'SR1.1-SR1.5 必需，SR1.6-SR1.9 推荐' : 'SR1.1-SR1.4 必需'
  });

  // FR2 rules
  rules.push({
    fr: 'FR2',
    title: '使用控制',
    description: getFRDescription('FR2', targetSL),
    srLevel: targetSL >= 3 ? 'SR2.1-SR2.8 全部要求' : 'SR2.1-SR2.4 核心要求'
  });

  // FR3 rules
  rules.push({
    fr: 'FR3',
    title: '完整性保护',
    description: getFRDescription('FR3', targetSL),
    srLevel: targetSL >= 3 ? 'SR3.1-SR3.9 全部要求，含固件验证和配置变更审计' : 'SR3.1-SR3.4 核心要求'
  });

  // FR4 rules
  rules.push({
    fr: 'FR4',
    title: '数据机密性',
    description: targetSL >= 3 ? '所有跨Zone通信必须加密，使用TLS 1.2+或等效机制' : '敏感数据跨Zone传输时需加密',
    srLevel: targetSL >= 3 ? 'SR4.1-SR4.5 全部要求' : 'SR4.1-SR4.2 核心要求'
  });

  // FR5 rules
  rules.push({
    fr: 'FR5',
    title: '限制数据流',
    description: `在 ${plan.zones.length} 个Zone之间实施深度防御数据流控制策略，只有授权的通信路径允许通过`,
    srLevel: 'SR5.1-SR5.3 全部要求，Zone边界必须实施访问控制'
  });

  // FR6 rules
  rules.push({
    fr: 'FR6',
    title: '对事件的及时响应',
    description: getFRDescription('FR6', targetSL),
    srLevel: targetSL >= 2 ? 'SR6.1-SR6.3 全部要求，需集中日志收集' : 'SR6.1-SR6.2 核心要求'
  });

  // FR7 rules
  rules.push({
    fr: 'FR7',
    title: '可用性',
    description: targetSL >= 3 ? '关键系统需具备容错能力，配置冗余设备和链路' : '确保基本可用性，支持系统恢复',
    srLevel: targetSL >= 3 ? 'SR7.1-SR7.5 全部要求，含DoS防护' : 'SR7.1-SR7.2 核心要求'
  });

  // FR8 rules
  rules.push({
    fr: 'FR8',
    title: '资源可用性',
    description: '监控网络和计算资源使用率，实施容量规划和报警机制',
    srLevel: targetSL >= 2 ? 'SR8.1-SR8.5 全部要求' : 'SR8.1-SR8.2 核心要求'
  });

  return rules;
}

function getFRDescription(fr, targetSL) {
  const descriptions = {
    'FR1': targetSL >= 3
      ? '所有远程访问和跨Zone访问必须使用多因素认证(MFA)，建立会话管理策略包括超时控制和会话终止机制'
      : '访问工业系统需进行身份验证，优先使用强密码策略和多因素认证',
    'FR2': targetSL >= 3
      ? '基于角色的访问控制(RBAC)应用于所有系统和数据访问，每个用户角色应遵循最小权限原则，配置权限审计'
      : '实施基于角色的访问控制，遵循最小权限原则',
    'FR3': targetSL >= 3
      ? '配置完整的篡改检测机制，包括配置变更日志、固件完整性验证和安全事件审计，支持操作不可否认性'
      : '保护软件和配置的完整性，建立配置变更审计机制',
    'FR6': targetSL >= 3
      ? '建立安全事件检测、报告和响应流程，配置Syslog或等价机制用于集中日志收集，确保事件响应及时性'
      : '对安全事件进行检测和响应，建立基本的事件报告机制'
  };
  return descriptions[fr] || '';
}
