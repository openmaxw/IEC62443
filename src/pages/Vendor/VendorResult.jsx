import { Link } from 'react-router-dom';
import { Button } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
import { useVendorPath, useIntegratorPath, useProject } from '../../hooks/useProject';
import { performMatching } from '../../utils/matchEngine';
import styles from './VendorResult.module.css';

export function VendorResult() {
  const { actions } = useProject();
  const { capabilities } = useVendorPath();
  const { plan } = useIntegratorPath();
  if (!capabilities?.length) return <ProjectStageShell stageNumber="03" title="能力结果" outputLabel="能力结果"><div className={styles.empty}><Link to="/vendor"><Button variant="primary">去能力</Button></Link></div></ProjectStageShell>;
  const latest = capabilities[capabilities.length - 1];
  const match = plan ? performMatching(plan, [latest]) : null;
  const top = match?.results?.[0] || null;
  if (match) actions.setMatchResults(match);
  return (
    <ProjectStageShell stageNumber="03" title="能力结果" projectName={latest.productMeta?.productName} outputLabel="结论 / 依据 / 边界">
      <div className={styles.resultBar}><strong>结论</strong><span>SL-{latest.productMeta?.securityLevel}</span><span>匹配度 {top?.overallScore ?? 0}% · {top?.recommendations.label || '待匹配'}</span><Link to="/selection"><Button variant="primary" size="small">查看差距</Button></Link></div>
      <table className={styles.table}><thead><tr><th>能力项</th><th>满足</th><th>证据</th></tr></thead><tbody>{latest.capabilityClaims.slice(0, 12).map((claim) => <tr key={claim.capabilityId}><td>{claim.capabilityId}</td><td>{claim.satisfaction}</td><td>{claim.evidenceType}</td></tr>)}</tbody></table>
      <div className={styles.note}>{latest.dependencies || '无统一依赖说明。'} / {latest.limitations || '无已知限制说明。'}</div>
    </ProjectStageShell>
  );
}
