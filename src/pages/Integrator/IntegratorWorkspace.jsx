import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
import { useOwnerPath, useProject } from '../../hooks/useProject';
import { ZONE_TEMPLATES, CONDUIT_TEMPLATES, PROTOCOL_TEMPLATES } from '../../data/zones';
import { buildCapabilityRequirementMatrix, buildCommunicationMatrix, buildSystemRules } from '../../utils/planningEngine';
import styles from './IntegratorWorkspace.module.css';

const DEFAULT_ASSET = { name: '', zone: '', role: 'control' };
const DEFAULT_FLOW = { source: '', target: '', protocol: '', businessReason: '' };
const ASSET_ROLES = [{ value: 'control', label: '控制' }, { value: 'monitoring', label: '监控' }, { value: 'engineering', label: '工程' }, { value: 'server', label: '服务' }];
function getZoneName(zoneId) { return ZONE_TEMPLATES.find((item) => item.id === zoneId)?.name || zoneId; }

export function IntegratorWorkspace() {
  const navigate = useNavigate();
  const { assessment, riskProfile } = useOwnerPath();
  const { state, actions } = useProject();
  const [newAsset, setNewAsset] = useState(DEFAULT_ASSET);
  const [newFlow, setNewFlow] = useState(DEFAULT_FLOW);
  const [plan, setPlan] = useState({ zones: [], conduits: [], assets: [], communicationFlows: [], targetSL: riskProfile?.targetLevelCandidates?.[0]?.level || 2, requiredFR: riskProfile?.frFocus?.map((item) => item.code) || [] });
  const communicationMatrix = useMemo(() => buildCommunicationMatrix(plan), [plan]);
  const requirementMatrix = useMemo(() => buildCapabilityRequirementMatrix(riskProfile, plan.targetSL, communicationMatrix), [plan.targetSL, riskProfile, communicationMatrix]);
  const systemRules = useMemo(() => buildSystemRules(plan, riskProfile, communicationMatrix), [plan, riskProfile, communicationMatrix]);

  if (!assessment || !riskProfile) {
    return <ProjectStageShell stageNumber="02" title="设计" projectName={state.projectMeta?.projectName} outputLabel="系统规划结果"><div className={styles.empty}>请先完成需求阶段。</div></ProjectStageShell>;
  }

  const toggleItem = (field, value) => setPlan((prev) => ({ ...prev, [field]: prev[field].includes(value) ? prev[field].filter((item) => item !== value) : [...prev[field], value] }));
  const addAsset = () => { if (!newAsset.name || !newAsset.zone) return; setPlan((prev) => ({ ...prev, assets: [...prev.assets, { ...newAsset, id: `${newAsset.zone}-${Date.now()}` }] })); setNewAsset(DEFAULT_ASSET); };
  const addFlow = () => { if (!newFlow.source || !newFlow.target || !newFlow.protocol || !newFlow.businessReason) return; setPlan((prev) => ({ ...prev, communicationFlows: [...prev.communicationFlows, { ...newFlow, id: `flow-${Date.now()}` }] })); setNewFlow(DEFAULT_FLOW); };
  const finalizePlan = () => { actions.setProjectMeta({ status: 'integrator-completed' }); actions.setIntegratorPlan({ ...plan, communicationMatrix, capabilityRequirements: requirementMatrix.rows, systemRules, residualRisks: communicationMatrix.complete ? ['仍需结合现场专家审查。'] : ['通信流未完整。'] }); navigate('/integrator/result'); };

  return (
    <ProjectStageShell stageNumber="02" title="设计" projectName={state.projectMeta?.projectName} outputLabel={`Zone ${plan.zones.length} / 流 ${plan.communicationFlows.length} / 能力 ${requirementMatrix.rows.length}`} nextAction={{ to: '/vendor', label: '下一步：能力' }}>
      <section className={styles.workspace}>
        <div className={styles.topGrid}>
          <div className={styles.block}>
            <div className={styles.blockTitle}>区域选择</div>
            <div className={styles.tagMatrix}>{ZONE_TEMPLATES.map((zone) => <button key={zone.id} type="button" className={`${styles.tag} ${plan.zones.includes(zone.id) ? styles.activeTag : ''}`} onClick={() => toggleItem('zones', zone.id)}>{zone.name}</button>)}</div>
          </div>
          <div className={styles.block}>
            <div className={styles.blockTitle}>通道选择</div>
            <div className={styles.tagMatrix}>{CONDUIT_TEMPLATES.map((conduit) => <button key={conduit.id} type="button" className={`${styles.tag} ${plan.conduits.includes(conduit.id) ? styles.activeTag : ''}`} onClick={() => toggleItem('conduits', conduit.id)}>{conduit.name}</button>)}</div>
          </div>
        </div>

        <div className={styles.dualGrid}>
          <div className={styles.block}>
            <div className={styles.blockTitle}>资产台账</div>
            <div className={styles.inlineForm}><input value={newAsset.name} onChange={(event) => setNewAsset((prev) => ({ ...prev, name: event.target.value }))} placeholder="资产名称" /><select value={newAsset.zone} onChange={(event) => setNewAsset((prev) => ({ ...prev, zone: event.target.value }))}><option value="">Zone</option>{plan.zones.map((zoneId) => <option key={zoneId} value={zoneId}>{getZoneName(zoneId)}</option>)}</select><select value={newAsset.role} onChange={(event) => setNewAsset((prev) => ({ ...prev, role: event.target.value }))}>{ASSET_ROLES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><Button variant="secondary" size="small" onClick={addAsset}>新增</Button></div>
            <table className={styles.table}><thead><tr><th>资产</th><th>Zone</th><th>角色</th></tr></thead><tbody>{plan.assets.length === 0 ? <tr><td colSpan="3" className={styles.emptyCell}>暂无数据</td></tr> : plan.assets.map((asset) => <tr key={asset.id}><td>{asset.name}</td><td>{getZoneName(asset.zone)}</td><td>{asset.role}</td></tr>)}</tbody></table>
          </div>

          <div className={styles.block}>
            <div className={styles.blockTitle}>通信矩阵</div>
            <div className={styles.inlineForm}><select value={newFlow.source} onChange={(event) => setNewFlow((prev) => ({ ...prev, source: event.target.value }))}><option value="">源</option>{plan.zones.map((zoneId) => <option key={zoneId} value={zoneId}>{getZoneName(zoneId)}</option>)}</select><select value={newFlow.target} onChange={(event) => setNewFlow((prev) => ({ ...prev, target: event.target.value }))}><option value="">目标</option>{plan.zones.map((zoneId) => <option key={zoneId} value={zoneId}>{getZoneName(zoneId)}</option>)}</select><select value={newFlow.protocol} onChange={(event) => setNewFlow((prev) => ({ ...prev, protocol: event.target.value }))}><option value="">协议</option>{PROTOCOL_TEMPLATES.map((protocol) => <option key={protocol.id} value={protocol.name}>{protocol.name}</option>)}</select><input value={newFlow.businessReason} onChange={(event) => setNewFlow((prev) => ({ ...prev, businessReason: event.target.value }))} placeholder="业务理由" /><Button variant="secondary" size="small" onClick={addFlow}>新增</Button></div>
            <table className={styles.table}><thead><tr><th>源</th><th>目标</th><th>协议</th><th>业务理由</th></tr></thead><tbody>{plan.communicationFlows.length === 0 ? <tr><td colSpan="4" className={styles.emptyCell}>暂无数据</td></tr> : plan.communicationFlows.map((flow) => <tr key={flow.id}><td>{getZoneName(flow.source)}</td><td>{getZoneName(flow.target)}</td><td>{flow.protocol}</td><td>{flow.businessReason}</td></tr>)}</tbody></table>
          </div>
        </div>

        <div className={styles.dualGrid}>
          <div className={styles.block}>
            <div className={styles.blockTitle}>规则建议</div>
            <div className={styles.noteList}>{systemRules.slice(0, 6).map((rule) => <div key={rule} className={styles.note}>{rule}</div>)}</div>
          </div>
          <div className={styles.block}>
            <div className={styles.blockTitle}>能力需求</div>
            <table className={styles.table}><thead><tr><th>能力项</th><th>控制目标</th></tr></thead><tbody>{requirementMatrix.rows.length === 0 ? <tr><td colSpan="2" className={styles.emptyCell}>暂无数据</td></tr> : requirementMatrix.rows.slice(0, 12).map((item) => <tr key={item.id}><td>{item.capabilityId}</td><td>{item.controlObjective}</td></tr>)}</tbody></table>
          </div>
        </div>

        <div className={styles.footerBar}><Button variant="primary" size="medium" onClick={finalizePlan}>生成设计结果</Button></div>
      </section>
    </ProjectStageShell>
  );
}
