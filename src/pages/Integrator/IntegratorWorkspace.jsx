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
const PROTOCOL_GROUPS = [
  { label: 'IT/通用协议', items: ['HTTP', 'HTTPS', 'SSH', 'MQTT', '普通TCP/IP'] },
  { label: '工业以太网协议', items: ['Modbus TCP', 'OPC UA', 'EtherNet/IP', 'EtherNet/IP (CIP)', 'PROFINET', 'EtherCAT', 'DNP3'] },
  { label: '现场总线/传统协议', items: ['Foundation Fieldbus', 'PROFIBUS', 'HART', 'Modbus RTU', 'BACnet'] }
];
function getZoneName(zoneId) { return ZONE_TEMPLATES.find((item) => item.id === zoneId)?.name || zoneId; }


function summarizeTraceability(item) {
  const conditions = item.traceability?.inputConditions || [];
  const concerns = item.traceability?.riskConcerns || [];
  const parts = [];

  if (conditions.length) parts.push(conditions.slice(0, 2).join('、'));
  if (concerns.length) parts.push(concerns.slice(0, 2).join('、'));

  return parts.length ? parts.join('；') : '来源于风险翻译结果与当前设计输入';
}

function groupRequirementRows(rows) {
  const grouped = new Map();

  rows.forEach((item) => {
    const key = item.controlObjective || '其他控制目标';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  });

  return Array.from(grouped.entries()).map(([title, items]) => ({ title, items }));
}

export function IntegratorWorkspace() {
  const navigate = useNavigate();
  const { assessment, riskProfile } = useOwnerPath();
  const { state, actions } = useProject();
  const integratorDraft = state.integratorDesign?.draft;
  const [newAsset, setNewAsset] = useState(DEFAULT_ASSET);
  const [newFlow, setNewFlow] = useState(DEFAULT_FLOW);
  const [plan, setPlan] = useState(integratorDraft || { zones: [], conduits: [], assets: [], communicationFlows: [], targetSL: riskProfile?.targetLevelCandidates?.[0]?.level || 2, requiredFR: riskProfile?.frFocus?.map((item) => item.code) || [] });
  const communicationMatrix = useMemo(() => buildCommunicationMatrix(plan), [plan]);
  const requirementMatrix = useMemo(() => buildCapabilityRequirementMatrix(riskProfile, plan.targetSL, communicationMatrix), [plan.targetSL, riskProfile, communicationMatrix]);
  const systemRules = useMemo(() => buildSystemRules(plan, riskProfile, communicationMatrix), [plan, riskProfile, communicationMatrix]);
  const requirementGroups = useMemo(() => groupRequirementRows(requirementMatrix.rows), [requirementMatrix.rows]);

  if (!assessment || !riskProfile) {
    return <ProjectStageShell stageNumber="02" title="设计" projectName={state.projectMeta?.projectName} outputLabel="系统规划结果" prevAction={{ to: '/owner', label: '上一步' }} guidance={{ summary: '本页用于将需求输入转化为系统设计、区域划分、通信关系与能力需求。', role: '集成商 / 设计负责人', usage: '完成设计内容后生成设计结果' }}><div className={styles.empty}>请先完成需求阶段。</div></ProjectStageShell>;
  }

  const toggleItem = (field, value) => setPlan((prev) => { const next = { ...prev, [field]: prev[field].includes(value) ? prev[field].filter((item) => item !== value) : [...prev[field], value] }; actions.setIntegratorDraft(next); return next; });
  const addAsset = () => { if (!newAsset.name || !newAsset.zone) return; setPlan((prev) => { const next = { ...prev, assets: [...prev.assets, { ...newAsset, id: `${newAsset.zone}-${Date.now()}` }] }; actions.setIntegratorDraft(next); return next; }); setNewAsset(DEFAULT_ASSET); };
  const addFlow = () => { if (!newFlow.source || !newFlow.target || !newFlow.protocol || !newFlow.businessReason) return; setPlan((prev) => { const next = { ...prev, communicationFlows: [...prev.communicationFlows, { ...newFlow, id: `flow-${Date.now()}` }] }; actions.setIntegratorDraft(next); return next; }); setNewFlow(DEFAULT_FLOW); };
  const finalizePlan = () => { actions.setProjectMeta({ status: 'integrator-completed' }); actions.setIntegratorPlan({ ...plan, communicationMatrix, capabilityRequirements: requirementMatrix.rows, systemRules, residualRisks: communicationMatrix.complete ? ['仍需结合现场专家审查。'] : ['通信流未完整。'] }); navigate('/integrator/result'); };

  return (
    <ProjectStageShell stageNumber="02" title="设计" projectName={state.projectMeta?.projectName} outputLabel={`Zone ${plan.zones.length} / 流 ${plan.communicationFlows.length} / 能力 ${requirementMatrix.rows.length}`} prevAction={{ to: '/owner', label: '上一步' }} guidance={{ summary: '本页用于将需求输入转化为系统设计、区域划分、通信关系与能力需求。', role: '集成商 / 设计负责人', usage: '完成设计内容后生成设计结果' }}>
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
            <div className={styles.inlineForm}><select value={newFlow.source} onChange={(event) => setNewFlow((prev) => ({ ...prev, source: event.target.value }))}><option value="">源</option>{plan.zones.map((zoneId) => <option key={zoneId} value={zoneId}>{getZoneName(zoneId)}</option>)}</select><select value={newFlow.target} onChange={(event) => setNewFlow((prev) => ({ ...prev, target: event.target.value }))}><option value="">目标</option>{plan.zones.map((zoneId) => <option key={zoneId} value={zoneId}>{getZoneName(zoneId)}</option>)}</select><select value={newFlow.protocol} onChange={(event) => setNewFlow((prev) => ({ ...prev, protocol: event.target.value }))}><option value="">协议</option>{PROTOCOL_GROUPS.map((group) => <optgroup key={group.label} label={group.label}>{group.items.map((protocolName) => <option key={protocolName} value={protocolName}>{protocolName}</option>)}</optgroup>)}</select><input value={newFlow.businessReason} onChange={(event) => setNewFlow((prev) => ({ ...prev, businessReason: event.target.value }))} placeholder="业务理由" /><Button variant="secondary" size="small" onClick={addFlow}>新增</Button></div>
            <table className={styles.table}><thead><tr><th>源</th><th>目标</th><th>协议</th><th>业务理由</th></tr></thead><tbody>{plan.communicationFlows.length === 0 ? <tr><td colSpan="4" className={styles.emptyCell}>暂无数据</td></tr> : plan.communicationFlows.map((flow) => <tr key={flow.id}><td>{getZoneName(flow.source)}</td><td>{getZoneName(flow.target)}</td><td>{flow.protocol}</td><td>{flow.businessReason}</td></tr>)}</tbody></table>
          </div>
        </div>

        <div className={styles.dualGrid}>
          <div className={styles.block}>
            <div className={styles.blockTitle}>规则建议</div>
            <div className={styles.noteList}>{systemRules.slice(0, 6).map((rule) => <div key={rule} className={styles.note}>{rule}</div>)}</div>
          </div>
          <div className={styles.block}>
            <div className={styles.blockTitle}>本项目重点能力要求</div>
            <div className={styles.blockHint}>用于把需求输入转成后续可核对的设计能力项，供集成商设计和设备能力匹配时参考。</div>
            <table className={styles.table}><thead><tr><th>控制目标 / 分组</th><th>能力项</th><th>来源依据</th></tr></thead><tbody>{requirementGroups.length === 0 ? <tr><td colSpan="3" className={styles.emptyCell}>暂无数据</td></tr> : requirementGroups.map((group) => group.items.map((item, index) => <tr key={item.id}><td>{index === 0 ? <div className={styles.groupTitle}>{group.title}</div> : ''}</td><td><div className={styles.capabilityCode}>{item.capabilityId}</div></td><td>{summarizeTraceability(item)}</td></tr>))}</tbody></table>
          </div>
        </div>

        <div className={styles.footerBar}><Button variant="primary" size="medium" onClick={finalizePlan}>生成设计结果</Button></div>
      </section>
    </ProjectStageShell>
  );
}
