import { Link } from 'react-router-dom';
import { Button } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
import { useOwnerPath } from '../../hooks/useProject';
import { createOwnerDeliverables } from '../../data/deliverables';
import styles from './OwnerResult.module.css';

export function OwnerResult() {
  const { projectMeta, assessment, riskProfile } = useOwnerPath();
  if (!assessment || !riskProfile) return <ProjectStageShell stageNumber="01" title="需求结果" projectName={projectMeta?.projectName} outputLabel="需求结果"><div className={styles.empty}><Link to="/owner"><Button variant="primary">去需求</Button></Link></div></ProjectStageShell>;
  const deliverable = createOwnerDeliverables({ assessment, riskProfile });
  return (
    <ProjectStageShell stageNumber="01" title="需求结果" projectName={projectMeta?.projectName} outputLabel="结论 / 依据 / 风险">
      <div className={styles.resultBar}><strong>结论</strong><span>{deliverable.summary.headline}</span><span>{deliverable.summary.recommendedTarget}</span><Link to="/integrator"><Button variant="primary" size="small">进入设计</Button></Link></div>
      <table className={styles.table}><thead><tr><th>风险关注</th><th>等级</th></tr></thead><tbody>{(riskProfile.riskConcernSummary || []).map((item) => <tr key={item.id}><td>{item.title}</td><td>{item.level}</td></tr>)}</tbody></table>
      <div className={styles.note}>{deliverable.disclaimer.text}</div>
    </ProjectStageShell>
  );
}
