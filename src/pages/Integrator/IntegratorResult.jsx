import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
import { useIntegratorPath, useOwnerPath } from '../../hooks/useProject';
import { getCapabilityDisplay } from '../../data/capabilities';
import { buildCommunicationMatrix } from '../../utils/planningEngine';
import styles from './IntegratorResult.module.css';

const IMPACT_LABEL = { low: '低', medium: '中', high: '高' };
const ASSET_LABELS = {
  plc: 'PLC',
  scada: 'SCADA',
  engineering: '工程师站',
  historian: '历史数据库',
  mes: 'MES / MOM',
  safety: '安全仪表系统',
  network: '工业网络设备',
  remote: '远程接入通道', 'remote-gateway': '远程接入通道'
};

function buildMatchRows(assessment, plan, communicationMatrix) {
  if (!assessment || !plan) return [];

  const rows = [];

  if (assessment.remoteAccessNeed || assessment.thirdPartyAccess) {
    const remoteLabel = assessment.remoteAccessNeed === 'extensive' ? '广泛远程运维' : assessment.remoteAccessNeed === 'limited' ? '有限远程运维' : '无远程运维';
    const thirdPartyLabel = assessment.thirdPartyAccess === 'regular' ? '频繁第三方接入' : assessment.thirdPartyAccess === 'occasional' ? '偶尔第三方接入' : '无第三方接入';
    const hasStrongResponse = assessment.remoteAccessNeed === 'extensive' || assessment.thirdPartyAccess === 'regular';

    rows.push({
      id: 'remote-access',
      ownerNeed: `${remoteLabel}；${thirdPartyLabel}`,
      designResponse: hasStrongResponse
        ? '设计中单独识别了远程/外部接入边界，并为跨区通信填写了必要性与边界控制建议。'
        : '当前设计按一般外部接入场景考虑，建议继续根据实际远程维护模式细化边界控制。',
      matchLevel: hasStrongResponse ? 'high' : 'partial'
    });
  }

  if (assessment.safetyImpact || assessment.productionImpact) {
    const ownerNeed = `人身安全（${IMPACT_LABEL[assessment.safetyImpact] || '未填写'}）／产能连续性（${IMPACT_LABEL[assessment.productionImpact] || '未填写'}）`;
    const strongConcern = assessment.safetyImpact === 'high' || assessment.productionImpact === 'high';

    rows.push({
      id: 'critical-boundary',
      ownerNeed,
      designResponse: `当前设计形成 ${plan.zones.length} 个 Zone，并梳理 ${plan.communicationFlows.length} 条关键通信流。`,
      matchLevel: strongConcern ? (plan.zones.length > 0 && plan.communicationFlows.length > 0 ? 'high' : 'partial') : 'partial'
    });
  }

  if (assessment.criticalAssets?.length) {
    rows.push({
      id: 'critical-assets',
      ownerNeed: `关键对象：${assessment.criticalAssets.slice(0, 4).map((item) => ASSET_LABELS[item] || item).join('、')}`,
      designResponse: plan.assets.length
        ? `已录入 ${plan.assets.length} 个关键资产/对象，并补充归组原因。`
        : '当前尚未形成明确资产清单，建议先将关键对象映射到设计资产表。',
      matchLevel: plan.assets.length ? 'high' : 'todo'
    });
  }

  rows.push({
    id: 'communication-completeness',
    ownerNeed: '需要把需求转化为可实施、可核对的具体设计输入。',
    designResponse: communicationMatrix.complete
      ? '通信矩阵已完整形成，源区、目标区、协议、必要性和边界控制建议已可追溯。'
      : '通信矩阵尚未完整，仍需补齐源、目标、协议和业务理由。',
    matchLevel: communicationMatrix.complete ? 'high' : 'todo'
  });

  return rows;
}

function resolveMatchLabel(level) {
  if (level === 'high') return '高匹配';
  if (level === 'partial') return '部分匹配';
  return '待补充';
}

export function IntegratorResult() {
  const { projectMeta, plan } = useIntegratorPath();
  const { assessment } = useOwnerPath();

  if (!plan) {
    return (
      <ProjectStageShell stageNumber="02" title="设计结果" projectName={projectMeta?.projectName} outputLabel="设计结论与依据">
        <div className={styles.empty}><Link to="/integrator"><Button variant="primary">去设计</Button></Link></div>
      </ProjectStageShell>
    );
  }

  const communicationMatrix = useMemo(() => plan.communicationMatrix || buildCommunicationMatrix(plan), [plan]);
  const matchRows = useMemo(() => buildMatchRows(assessment, plan, communicationMatrix), [assessment, plan, communicationMatrix]);

  return (
    <ProjectStageShell stageNumber="02" title="设计结果" projectName={projectMeta?.projectName} outputLabel="设计结论与依据">
      <div className={styles.resultHero}>
        <div>
          <span className={styles.eyebrow}>设计结论</span>
          <h2>推荐目标 SL-{plan.targetSL}</h2>
          <p></p>
        </div>
        <div className={styles.summaryChips}>
          <span className={styles.chip}>Zone {plan.zones.length}</span>
          <span className={styles.chip}>流 {plan.communicationFlows.length}</span>
          <span className={styles.chip}>能力 {plan.capabilityRequirements.length}</span>
        </div>
        <Link to="/vendor"><Button variant="primary" size="small">进入能力</Button></Link>
      </div>

      <section className={styles.section}>
        <h3>设计依据摘要</h3>
        <div className={styles.summaryGrid}>
          <div><span>关键系统/角色</span><strong>{plan.designBasisSummary?.keySystems || '未填写'}</strong></div>
          <div><span>外部连接方式</span><strong>{plan.designBasisSummary?.externalConnections || '未填写'}</strong></div>
          <div><span>维护接入方式</span><strong>{plan.designBasisSummary?.maintenanceAccessPath || '未填写'}</strong></div>
          <div><span>初始网络边界</span><strong>{plan.designBasisSummary?.initialBoundaryNotes || '未填写'}</strong></div>
          <div><span>工艺连续性要求</span><strong>{plan.designBasisSummary?.continuityRequirements || '未填写'}</strong></div>
          <div><span>总体设计依据</span><strong>{plan.designBasisSummary?.designBasis || '未填写'}</strong></div>
        </div>
      </section>

      <section className={styles.section}>
        <h3>资产归组与 Zone 说明</h3>
        <div className={styles.noteList}>
          {plan.assets.length ? plan.assets.map((asset) => (
            <div key={asset.id} className={styles.noteCard}>
              <strong>{asset.name}</strong>
              <span>{asset.zone} / {asset.role}</span>
              <p>{asset.groupingReason || '未填写归组原因'}</p>
            </div>
          )) : <div className={styles.emptyCell}>暂无资产归组信息。</div>}
        </div>
      </section>

      <section className={styles.section}>
        <h3>通信矩阵与边界控制</h3>
        <div className={styles.compareTableWrap}>
          <table className={styles.compareTable}>
            <thead>
              <tr>
                <th>源区 → 目标区</th>
                <th>协议 / 方向</th>
                <th>业务理由</th>
                <th>必要性 / 边界控制</th>
              </tr>
            </thead>
            <tbody>
              {plan.communicationFlows.length ? plan.communicationFlows.map((flow) => (
                <tr key={flow.id}>
                  <td>{flow.source} → {flow.target}</td>
                  <td>{flow.protocol} / {flow.direction || '未填写'}</td>
                  <td>{flow.businessReason}</td>
                  <td>{[flow.necessity, flow.boundaryControl].filter(Boolean).join('；') || '未填写'}</td>
                </tr>
              )) : <tr><td colSpan="4" className={styles.emptyCell}>暂无通信流数据。</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h3>组件能力需求清单</h3>
        <div className={styles.requirementList}>
          {plan.capabilityRequirements.length ? plan.capabilityRequirements.map((item) => (
            <div key={item.id} className={styles.requirementItem}>
              <strong>{getCapabilityDisplay(item.capabilityId).label}</strong>
              <div className={styles.capabilityMeta}><span className={styles.standardTag}>{getCapabilityDisplay(item.capabilityId).frText}</span><span className={styles.standardTag}>{getCapabilityDisplay(item.capabilityId).srText}</span></div><span>{item.controlObjective}</span>
              <p>{item.implementationHint}</p>
            </div>
          )) : <div className={styles.emptyCell}>暂无组件能力需求。</div>}
        </div>
      </section>

      <section className={styles.section}>
        <h3>需求—设计匹配表</h3>
        <div className={styles.compareTableWrap}>
          <table className={styles.compareTable}>
            <thead>
              <tr>
                <th>业主需求</th>
                <th>集成商对应设计</th>
                <th>匹配程度</th>
              </tr>
            </thead>
            <tbody>
              {matchRows.length ? matchRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.ownerNeed}</td>
                  <td>{row.designResponse}</td>
                  <td>
                    <span className={`${styles.matchBadge} ${styles[`match-${row.matchLevel}`]}`}>
                      {resolveMatchLabel(row.matchLevel)}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className={styles.emptyCell}>暂无可用匹配数据，请先完成需求汇总与设计输入。</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </ProjectStageShell>
  );
}
