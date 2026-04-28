import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, ProgressBar } from '../../components/Common';
import { useOwnerPath, useProject } from '../../hooks/useProject';
import { ZONE_TEMPLATES, CONDUIT_TEMPLATES, PROTOCOL_TEMPLATES } from '../../data/zones';
import { buildCapabilityRequirementMatrix, buildCommunicationMatrix, buildSystemRules } from '../../utils/planningEngine';
import styles from './IntegratorWorkspace.module.css';

const STEPS = [
  { id: 'zones', title: 'Zone 规划', description: '选择需要纳入安全设计的区域' },
  { id: 'assets', title: '资产绑定', description: '将关键资产绑定到区域和角色' },
  { id: 'flows', title: '通信矩阵', description: '定义源、目的、方向和业务理由' },
  { id: 'controls', title: '控制要求', description: '生成边界控制和设备能力需求' }
];

const ASSET_ROLES = [
  { value: 'control', label: '控制' },
  { value: 'monitoring', label: '监控' },
  { value: 'engineering', label: '工程' },
  { value: 'server', label: '服务' },
  { value: 'boundary', label: '边界' },
  { value: 'safety', label: '安全' }
];

const FLOW_DIRECTIONS = [
  { value: 'uni', label: '单向' },
  { value: 'bi', label: '双向' }
];

export function IntegratorWorkspace() {
  const navigate = useNavigate();
  const { projectMeta, assessment, riskProfile } = useOwnerPath();
  const { actions } = useProject();

  const [currentStep, setCurrentStep] = useState(0);
  const [newAsset, setNewAsset] = useState({ name: '', zone: '', role: 'control', criticality: 'medium' });
  const [newFlow, setNewFlow] = useState({ source: '', target: '', protocol: '', direction: 'uni', businessReason: '' });
  const [plan, setPlan] = useState({
    zones: [],
    conduits: [],
    assets: [],
    communicationFlows: [],
    boundaryControls: [],
    systemRules: [],
    capabilityRequirements: [],
    residualRisks: [],
    targetSL: riskProfile?.targetLevelCandidates?.[0]?.level || 2,
    requiredFR: riskProfile?.frFocus?.map((item) => item.code) || []
  });

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const updatePlan = (field, value) => {
    setPlan((prev) => ({ ...prev, [field]: value }));
  };

  const toggleZone = (zoneId) => {
    setPlan((prev) => ({
      ...prev,
      zones: prev.zones.includes(zoneId)
        ? prev.zones.filter((item) => item !== zoneId)
        : [...prev.zones, zoneId]
    }));
  };

  const toggleConduit = (conduitId) => {
    setPlan((prev) => ({
      ...prev,
      conduits: prev.conduits.includes(conduitId)
        ? prev.conduits.filter((item) => item !== conduitId)
        : [...prev.conduits, conduitId]
    }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const finalizePlan = () => {
    const communicationMatrix = buildCommunicationMatrix(plan);
    const capabilityRequirementMatrix = buildCapabilityRequirementMatrix(riskProfile, plan.targetSL, communicationMatrix);
    const systemRules = buildSystemRules(plan, riskProfile, communicationMatrix);
    const boundaryControls = plan.conduits.flatMap((conduitId) => {
      const conduit = CONDUIT_TEMPLATES.find((item) => item.id === conduitId);
      return conduit ? conduit.securityMeasures.map((measure) => ({ conduitId, measure })) : [];
    });

    const completedPlan = {
      ...plan,
      communicationMatrix,
      capabilityRequirementMatrix,
      capabilityRequirements: capabilityRequirementMatrix.rows,
      systemRules,
      boundaryControls,
      residualRisks: !communicationMatrix.complete
        ? ['通信流信息不完整，当前仅能生成缺失提示，无法输出完整通信矩阵。']
        : []
    };

    actions.setProjectMeta({ status: 'integrator-completed' });
    actions.setIntegratorPlan(completedPlan);
    navigate('/integrator/result');
  };

  if (!assessment || !riskProfile) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p>请先完成业主风险翻译，再进入系统规划。</p>
          <Button variant="primary" onClick={() => navigate('/owner')}>去业主路径</Button>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'zones':
        return (
          <div className={styles.stepContent}>
            <p className={styles.stepHint}>优先选择关键资产、远程接入和边界相关区域。</p>
            <div className={styles.zoneGrid}>
              {ZONE_TEMPLATES.map((zone) => {
                const selected = plan.zones.includes(zone.id);
                return (
                  <div key={zone.id} className={`${styles.zoneCard} ${selected ? styles.selected : ''}`} onClick={() => toggleZone(zone.id)}>
                    <Card variant={selected ? 'accent' : 'default'} className={styles.zoneCardInner}>
                      <div className={styles.zoneHeader}>
                        <Badge variant="info">SL{zone.securityLevel}</Badge>
                        <h4>{zone.name}</h4>
                      </div>
                      <p className={styles.zoneDesc}>{zone.description}</p>
                      <div className={styles.zoneBoundary}>
                        {zone.boundaryControls.slice(0, 3).map((item) => (
                          <Badge key={item} variant="default" size="small">{item}</Badge>
                        ))}
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
            <div className={styles.conduitGrid}>
              {CONDUIT_TEMPLATES.map((conduit) => {
                const selected = plan.conduits.includes(conduit.id);
                return (
                  <div key={conduit.id} className={`${styles.conduitCard} ${selected ? styles.selected : ''}`} onClick={() => toggleConduit(conduit.id)}>
                    <div className={styles.conduitHeader}>
                      <h4>{conduit.name}</h4>
                      <Badge variant="warning">SL{conduit.maxSL}</Badge>
                    </div>
                    <p className={styles.conduitDesc}>{conduit.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'assets':
        return (
          <div className={styles.stepContent}>
            <div className={styles.assetConfig}>
              {plan.assets.map((asset, index) => (
                <div key={`${asset.name}-${index}`} className={styles.assetRow}>
                  <span>{asset.name}</span>
                  <Badge variant="default">{asset.role}</Badge>
                  <Badge variant="info">{asset.zone}</Badge>
                  <Button variant="ghost" size="small" onClick={() => updatePlan('assets', plan.assets.filter((_, idx) => idx !== index))}>删除</Button>
                </div>
              ))}
              <div className={styles.addAsset}>
                <input className={styles.assetInput} placeholder="资产名称" value={newAsset.name} onChange={(event) => setNewAsset((prev) => ({ ...prev, name: event.target.value }))} />
                <select className={styles.assetSelect} value={newAsset.zone} onChange={(event) => setNewAsset((prev) => ({ ...prev, zone: event.target.value }))}>
                  <option value="">选择区域</option>
                  {plan.zones.map((zoneId) => {
                    const zone = ZONE_TEMPLATES.find((item) => item.id === zoneId);
                    return <option key={zoneId} value={zoneId}>{zone?.name || zoneId}</option>;
                  })}
                </select>
                <select className={styles.assetSelect} value={newAsset.role} onChange={(event) => setNewAsset((prev) => ({ ...prev, role: event.target.value }))}>
                  {ASSET_ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                </select>
                <Button variant="secondary" size="small" onClick={() => {
                  if (!newAsset.name || !newAsset.zone) return;
                  updatePlan('assets', [...plan.assets, newAsset]);
                  setNewAsset({ name: '', zone: '', role: 'control', criticality: 'medium' });
                }}>添加</Button>
              </div>
            </div>
          </div>
        );

      case 'flows':
        return (
          <div className={styles.stepContent}>
            <div className={styles.flowMatrix}>
              {plan.communicationFlows.length === 0 ? (
                <div className={styles.emptyFlows}>尚未配置通信流，后续将无法生成完整通信矩阵。</div>
              ) : plan.communicationFlows.map((flow, index) => (
                <div key={`${flow.source}-${flow.target}-${index}`} className={styles.flowRow}>
                  <Badge variant="primary">{flow.source}</Badge>
                  <Badge variant="info">{flow.target}</Badge>
                  <span>{flow.protocol}</span>
                  <span>{flow.direction === 'uni' ? '单向' : '双向'}</span>
                  <Button variant="ghost" size="small" onClick={() => updatePlan('communicationFlows', plan.communicationFlows.filter((_, idx) => idx !== index))}>删除</Button>
                </div>
              ))}
              <div className={styles.addAsset}>
                <select className={styles.assetSelect} value={newFlow.source} onChange={(event) => setNewFlow((prev) => ({ ...prev, source: event.target.value }))}>
                  <option value="">源区域</option>
                  {plan.zones.map((zoneId) => <option key={zoneId} value={zoneId}>{ZONE_TEMPLATES.find((item) => item.id === zoneId)?.name || zoneId}</option>)}
                </select>
                <select className={styles.assetSelect} value={newFlow.target} onChange={(event) => setNewFlow((prev) => ({ ...prev, target: event.target.value }))}>
                  <option value="">目标区域</option>
                  {plan.zones.map((zoneId) => <option key={zoneId} value={zoneId}>{ZONE_TEMPLATES.find((item) => item.id === zoneId)?.name || zoneId}</option>)}
                </select>
                <select className={styles.assetSelect} value={newFlow.protocol} onChange={(event) => setNewFlow((prev) => ({ ...prev, protocol: event.target.value }))}>
                  <option value="">协议</option>
                  {PROTOCOL_TEMPLATES.map((protocol) => <option key={protocol.id} value={protocol.name}>{protocol.name}</option>)}
                </select>
                <select className={styles.assetSelect} value={newFlow.direction} onChange={(event) => setNewFlow((prev) => ({ ...prev, direction: event.target.value }))}>
                  {FLOW_DIRECTIONS.map((direction) => <option key={direction.value} value={direction.value}>{direction.label}</option>)}
                </select>
                <input className={styles.assetInput} placeholder="业务理由" value={newFlow.businessReason} onChange={(event) => setNewFlow((prev) => ({ ...prev, businessReason: event.target.value }))} />
                <Button variant="secondary" size="small" onClick={() => {
                  if (!newFlow.source || !newFlow.target || !newFlow.protocol) return;
                  updatePlan('communicationFlows', [...plan.communicationFlows, newFlow]);
                  setNewFlow({ source: '', target: '', protocol: '', direction: 'uni', businessReason: '' });
                }}>添加</Button>
              </div>
            </div>
          </div>
        );

      case 'controls': {
        const previewMatrix = buildCommunicationMatrix(plan);
        const previewRequirements = buildCapabilityRequirementMatrix(riskProfile, plan.targetSL, previewMatrix);
        return (
          <div className={styles.stepContent}>
            {!previewMatrix.complete && (
              <div className={styles.emptyFlows}>当前通信流信息未补齐，系统仅能生成缺失提示，暂不输出完整通信矩阵。</div>
            )}
            <Card>
              <h3>输入摘要</h3>
              <p>项目：{projectMeta.projectName || '未命名项目'}</p>
              <p>FR 重点：{plan.requiredFR.join('、') || '无'}</p>
              <p>目标等级：SL{plan.targetSL}</p>
            </Card>
            <Card>
              <h3>预生成控制建议</h3>
              <div className={styles.boundaryTags}>
                {(riskProfile.controlObjectives || []).map((item) => (
                  <Badge key={item.id} variant="primary">{item.title}</Badge>
                ))}
              </div>
            </Card>
            <Card>
              <h3>设备能力需求矩阵预览</h3>
              <div className={styles.boundaryTags}>
                {previewRequirements.rows.map((item) => (
                  <Badge key={item.id} variant="info">{item.capabilityId}</Badge>
                ))}
              </div>
            </Card>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Badge variant="info">集成商路径</Badge>
        <h1>{STEPS[currentStep].title}</h1>
        <p>{STEPS[currentStep].description}</p>
        <ProgressBar value={progress} variant="accent" size="large" />
      </div>

      <Card className={styles.contentCard}>{renderStep()}</Card>

      <div className={styles.actions}>
        <Button variant="ghost" onClick={prevStep} disabled={currentStep === 0}>上一步</Button>
        {currentStep === STEPS.length - 1 ? (
          <Button variant="primary" onClick={finalizePlan}>生成系统规划结果</Button>
        ) : (
          <Button variant="primary" onClick={nextStep}>下一步</Button>
        )}
      </div>
    </div>
  );
}
