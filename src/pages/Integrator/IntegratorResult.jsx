import { Link } from 'react-router-dom';
import { Button } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
import { useIntegratorPath, useOwnerPath } from '../../hooks/useProject';
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
  remote: '远程接入通道'
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
        ? '设计中应单独识别远程/外部接入边界，要求受控入口、身份鉴别、审批和审计留痕，并避免直接进入关键控制区。'
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
      designResponse: `当前设计形成 ${plan.zones.length} 个 Zone，并梳理 ${plan.communicationFlows.length} 条关键通信流，用于控制关键资产暴露面并约束跨区通信。`,
      matchLevel: strongConcern ? (plan.zones.length > 0 && plan.communicationFlows.length > 0 ? 'high' : 'partial') : 'partial'
    });
  }

  if (assessment.criticalAssets?.length) {
    rows.push({
      id: 'critical-assets',
      ownerNeed: `关键对象：${assessment.criticalAssets.slice(0, 4).map((item) => ASSET_LABELS[item] || item).join('、')}`,
      designResponse: plan.assets.length
        ? `设计中已录入 ${plan.assets.length} 个关键资产/对象，并为其分配对应 Zone 和角色，用于后续能力核对。`
        : '当前尚未形成明确资产清单，建议先将关键对象映射到设计资产表。',
      matchLevel: plan.assets.length ? 'high' : 'todo'
    });
  }

  if (assessment.identityMaturity || assessment.loggingMaturity) {
    const weakFoundation = assessment.identityMaturity === 'low' || assessment.loggingMaturity === 'low';
    rows.push({
      id: 'foundation-gap',
      ownerNeed: `现状基础：身份管理（${IMPACT_LABEL[assessment.identityMaturity] || '未填写'}）／日志审计（${IMPACT_LABEL[assessment.loggingMaturity] || '未填写'}）`,
      designResponse: `本轮设计整理了 ${plan.capabilityRequirements.length} 项能力需求，作为后续设备能力声明与补偿措施分析的核对基础。`,
      matchLevel: weakFoundation ? (plan.capabilityRequirements.length > 0 ? 'high' : 'todo') : (plan.capabilityRequirements.length > 0 ? 'partial' : 'todo')
    });
  }

  rows.push({
    id: 'communication-completeness',
    ownerNeed: '需要把需求转化为可实施、可核对的具体设计输入。',
    designResponse: communicationMatrix.complete
      ? '通信矩阵已完整形成，源区、目标区、协议和业务理由已可追溯。'
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

  const communicationMatrix = plan.communicationMatrix || buildCommunicationMatrix(plan);
  const matchRows = buildMatchRows(assessment, plan, communicationMatrix);

  return (
    <ProjectStageShell stageNumber="02" title="设计结果" projectName={projectMeta?.projectName} outputLabel="设计结论与依据">
      <div className={styles.resultHero}>
        <div>
          <span className={styles.eyebrow}>设计结论</span>
          <h2>推荐目标 SL-{plan.targetSL}</h2>
          <p>本页重点展示业主需求与集成设计之间的对应关系，帮助确认设计是否真正响应了输入重点。</p>
        </div>
        <div className={styles.summaryChips}>
          <span className={styles.chip}>Zone {plan.zones.length}</span>
          <span className={styles.chip}>流 {plan.communicationFlows.length}</span>
          <span className={styles.chip}>能力 {plan.capabilityRequirements.length}</span>
        </div>
        <Link to="/vendor"><Button variant="primary" size="small">进入能力</Button></Link>
      </div>

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
