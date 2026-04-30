import { Link } from 'react-router-dom';
import { Button } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
import { useIntegratorPath } from '../../hooks/useProject';
import { buildCommunicationMatrix } from '../../utils/planningEngine';
import styles from './IntegratorResult.module.css';

export function IntegratorResult() {
  const { projectMeta, plan } = useIntegratorPath();
  if (!plan) return <ProjectStageShell stageNumber="02" title="设计结果" projectName={projectMeta?.projectName} outputLabel="设计结果"><div className={styles.empty}><Link to="/integrator"><Button variant="primary">去设计</Button></Link></div></ProjectStageShell>;
  const communicationMatrix = plan.communicationMatrix || buildCommunicationMatrix(plan);
  return (
    <ProjectStageShell stageNumber="02" title="设计结果" projectName={projectMeta?.projectName} outputLabel="结论 / 依据 / 风险">
      <div className={styles.resultBar}><strong>结论</strong><span>SL-{plan.targetSL}</span><span>Zone {plan.zones.length} · 流 {plan.communicationFlows.length} · 能力 {plan.capabilityRequirements.length}</span><Link to="/vendor"><Button variant="primary" size="small">进入能力</Button></Link></div>
      <table className={styles.table}><thead><tr><th>规则建议</th></tr></thead><tbody>{(plan.systemRules || []).map((rule) => <tr key={rule}><td>{rule}</td></tr>)}</tbody></table>
      <div className={styles.note}>{communicationMatrix.complete ? '通信矩阵已形成。' : '通信矩阵未完整形成。'}</div>
    </ProjectStageShell>
  );
}
