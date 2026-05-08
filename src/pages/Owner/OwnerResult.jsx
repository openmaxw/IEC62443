import { Link } from 'react-router-dom';
import { Button } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
import { useOwnerPath } from '../../hooks/useProject';
import { INDUSTRIES } from '../../data/industries';
import { ACCEPTANCE_PREFERENCE_OPTIONS } from '../../data/enums';
import styles from './OwnerResult.module.css';

const IMPACT_LABEL = { low: '低', medium: '中', high: '高' };
const ASSET_LABELS = { plc: 'PLC', scada: 'SCADA', engineering: '工程师站', historian: '历史数据库', mes: 'MES / MOM', safety: '安全仪表系统', network: '工业网络设备', remote: '远程接入通道', 'remote-gateway': '远程接入通道' };
const IMPACT_FIELDS = [{ key: 'safetyImpact', label: '人身安全' }, { key: 'environmentalImpact', label: '环境影响' }, { key: 'productionImpact', label: '产能连续性' }, { key: 'financialImpact', label: '财务影响' }, { key: 'complianceImpact', label: '合规影响' }];

export function OwnerResult() {
  const { projectMeta, assessment, riskProfile } = useOwnerPath();
  const selectedIndustry = INDUSTRIES.find((item) => item.id === projectMeta?.industry);
  const acceptanceOption = ACCEPTANCE_PREFERENCE_OPTIONS.find((item) => item.value === assessment?.acceptancePreference);
  const ownerRequirements = riskProfile?.ownerRequirements || [];
  const acceptanceFocus = riskProfile?.acceptanceFocus || [];

  if (!assessment) {
    return <ProjectStageShell stageNumber="01" title="业主交接物" projectName={projectMeta?.projectName} outputLabel="待生成" ><div className={styles.emptyState}><strong>还没有业主输入</strong><Link to="/owner"><Button variant="primary" size="medium">前往填写</Button></Link></div></ProjectStageShell>;
  }

  return (
    <ProjectStageShell stageNumber="01" title="业主交接物" projectName={projectMeta?.projectName} outputLabel="设计输入" >
      <article className={styles.document}>
        <section className={styles.section}><h3>一、项目边界</h3><div className={styles.grid}><div><span>项目名称</span><strong>{projectMeta?.projectName || '未填写'}</strong></div><div><span>行业场景</span><strong>{selectedIndustry?.name || '未填写'}</strong></div><div><span>项目站点</span><strong>{projectMeta?.siteName || '未填写'}</strong></div><div><span>项目目标</span><strong>{projectMeta?.projectObjective || '未填写'}</strong></div></div></section>
        <section className={styles.section}><h3>二、业务后果判断</h3><div className={styles.list}>{IMPACT_FIELDS.map((field) => <div key={field.key} className={styles.item}><div className={styles.itemHead}><strong>{field.label}</strong><span>{IMPACT_LABEL[assessment[field.key]] || '未填写'}</span></div></div>)}</div></section>
        <section className={styles.section}><h3>三、关键对象与外部约束</h3><div className={styles.assetRow}>{(assessment.criticalAssets || []).length ? assessment.criticalAssets.map((item) => <span key={item} className={styles.tag}>{ASSET_LABELS[item] || item}</span>) : <span className={styles.emptyText}>未填写关键对象</span>}</div><div className={styles.grid}><div><span>关键系统/角色</span><strong>{assessment.keySystems || '未填写'}</strong></div><div><span>外部连接方式</span><strong>{assessment.externalConnections || '未填写'}</strong></div><div><span>维护接入方式</span><strong>{assessment.maintenanceAccessPath || '未填写'}</strong></div><div><span>初始网络边界</span><strong>{assessment.initialBoundaryNotes || '未填写'}</strong></div></div></section>
        <section className={styles.section}><h3>四、集成设计输入</h3><div className={styles.list}>{ownerRequirements.length ? ownerRequirements.map((item, index) => <div key={`${item.concernId || index}-${index}`} className={styles.item}><div className={styles.itemHead}><strong>输入 {index + 1}</strong><span>{item.priority || '未分级'}</span></div><p>{item.text || '未填写'}</p></div>) : <p className={styles.emptyText}>尚未整理出明确的设计输入。</p>}</div></section>
        <section className={styles.section}><h3>五、验收关注点</h3><div className={styles.list}>{acceptanceFocus.length ? acceptanceFocus.map((item, index) => <div key={`${(item.id || item.concernId || index)}-${index}`} className={styles.item}><p>{typeof item === 'object' ? (item.summary || item.text || '未填写') : item}</p></div>) : <p className={styles.emptyText}>尚未生成验收关注点。</p>}<div className={styles.item}><div className={styles.itemHead}><strong>验收偏好</strong><span>{acceptanceOption?.label || '未填写'}</span></div></div></div></section>
      </article>
      <div className={styles.actions}><Link to="/owner"><Button variant="ghost" size="medium">返回修改</Button></Link><Link to="/integrator"><Button variant="primary" size="medium">进入集成设计</Button></Link></div>
    </ProjectStageShell>
  );
}
