import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
import { getCapabilityDisplay } from '../../data/capabilities';
import { useIntegratorPath, useProject, useVendorPath } from '../../hooks/useProject';
import styles from './SelectionMatrix.module.css';

function buildSelectionResults(plan, latestCapability) {
  const requirements = plan?.capabilityRequirements || [];
  const claimMap = new Map((latestCapability?.capabilityClaims || []).map((item) => [item.capabilityId, item]));
  const rows = requirements.map((requirement) => {
    const claim = claimMap.get(requirement.capabilityId);
    const status = claim?.satisfaction || 'missing';
    const severity = status === 'missing' ? 'high' : status === 'external' ? 'medium' : status === 'partial' ? 'medium' : 'low';
    return { id: requirement.id, capabilityId: requirement.capabilityId, controlObjective: requirement.controlObjective, status, evidenceType: claim?.evidenceType || '未填写', gapNote: status === 'missing' ? '当前未形成可接受实现路径。' : status === 'external' ? '需通过外围系统或边界控制补足。' : status === 'partial' ? '需配置或补充条件后满足。' : '当前可满足项目要求。', severity, owner: status === 'external' ? '集成商/业主' : status === 'missing' ? '设备商/集成商' : '设备商' };
  });
  return { rows, summary: { high: rows.filter((item) => item.severity === 'high').length, medium: rows.filter((item) => item.severity === 'medium').length, low: rows.filter((item) => item.severity === 'low').length } };
}

const STATUS_LABELS = { fulfilled: '满足', partial: '部分满足', missing: '不满足', external: '需外部补偿', na: '不适用' };

export function SelectionMatrix() {
  const { state, actions } = useProject();
  const { plan } = useIntegratorPath();
  const { capabilities } = useVendorPath();
  const latestCapability = capabilities?.[capabilities.length - 1];
  const selection = useMemo(() => buildSelectionResults(plan, latestCapability), [plan, latestCapability]);
  const handleSave = () => { actions.setMatchResults({ results: selection.rows, summary: selection.summary }); };

  if (!plan || !latestCapability) {
    return <ProjectStageShell stageNumber="04" title="差距分析" projectName={state.projectMeta?.projectName} outputLabel="要求与能力差距分析"><div className={styles.empty}><Link to="/vendor"><Button variant="primary">先完成设备能力声明</Button></Link></div></ProjectStageShell>;
  }

  return (
    <ProjectStageShell stageNumber="04" title="差距分析" projectName={state.projectMeta?.projectName} outputLabel="差距识别结果" prevAction={{ to: '/vendor/result', label: '上一步' }} guidance={{ summary: '本页只识别差距，不展开补偿措施。补偿措施请进入差距闭环页面。', role: '集成商 / 设备商 / 业主', usage: '先识别高、中严重度差距，再进入闭环页处理。' }}>
      <section className={styles.page}>
        <div className={styles.hero}><div><strong>差距概览</strong><p>本页只回答“差距在哪里、严重度多高、责任在谁”。</p></div><div className={styles.summaryChips}><span className={styles.high}>高 {selection.summary.high}</span><span className={styles.medium}>中 {selection.summary.medium}</span><span className={styles.low}>低 {selection.summary.low}</span></div></div>
        <table className={styles.table}><thead><tr><th>要求项</th><th>控制目标</th><th>状态</th><th>差距说明</th><th>责任归属</th></tr></thead><tbody>{selection.rows.map((row) => <tr key={row.id}><td><strong>{getCapabilityDisplay(row.capabilityId).label}</strong><div className={styles.capabilityMeta}><span className={styles.standardTag}>{getCapabilityDisplay(row.capabilityId).frText}</span><span className={styles.standardTag}>{getCapabilityDisplay(row.capabilityId).srText}</span></div></td><td>{row.controlObjective}</td><td><span className={`${styles.badge} ${styles[row.severity]}`}>{STATUS_LABELS[row.status] || row.status}</span></td><td>{row.gapNote} / 证据：{row.evidenceType}</td><td>{row.owner}</td></tr>)}</tbody></table>
        <div className={styles.actions}><Button variant="secondary" size="medium" onClick={handleSave}>保存差距识别</Button><Link to="/gap"><Button variant="primary" size="medium">进入差距闭环</Button></Link></div>
      </section>
    </ProjectStageShell>
  );
}
