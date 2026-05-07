import { Link } from 'react-router-dom';
import { Button } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
import { useVendorPath } from '../../hooks/useProject';
import styles from './VendorResult.module.css';

const LABELS = { fulfilled: '满足', partial: '部分满足', missing: '不满足', external: '需外部补偿', na: '不适用' };

export function VendorResult() {
  const { projectMeta, capabilities } = useVendorPath();
  const latest = capabilities?.[capabilities.length - 1];

  if (!latest) {
    return <ProjectStageShell stageNumber="03" title="能力结果" projectName={projectMeta?.projectName} outputLabel="设备声明摘要"><div className={styles.empty}><Link to="/vendor"><Button variant="primary">去声明能力</Button></Link></div></ProjectStageShell>;
  }

  const claims = latest.capabilityClaims || [];
  const groups = {
    fulfilled: claims.filter((item) => item.satisfaction === 'fulfilled'),
    partial: claims.filter((item) => item.satisfaction === 'partial'),
    missing: claims.filter((item) => item.satisfaction === 'missing'),
    external: claims.filter((item) => item.satisfaction === 'external')
  };

  return (
    <ProjectStageShell stageNumber="03" title="能力结果" projectName={projectMeta?.projectName} outputLabel="设备声明摘要" guidance={{ summary: '本页只保留设备商声明本身，不重复承担差距分析和补偿措施闭环。', role: '设备商 / 集成商', usage: '确认声明后进入差距分析。' }}>
      <div className={styles.hero}><div><span className={styles.eyebrow}>设备声明摘要</span><h2>{latest.productMeta?.productName || '未命名产品'}</h2><p>{latest.productMeta?.deploymentScope || '未填写部署范围'} / SL-{latest.productMeta?.securityLevel || 2}</p></div><Link to="/selection"><Button variant="primary" size="small">进入差距分析</Button></Link></div>
      <section className={styles.section}><h3>项目要求满足度概览</h3><div className={styles.summaryGrid}><div><span>满足</span><strong>{groups.fulfilled.length}</strong></div><div><span>部分满足</span><strong>{groups.partial.length}</strong></div><div><span>不满足</span><strong>{groups.missing.length}</strong></div><div><span>需外部补偿</span><strong>{groups.external.length}</strong></div></div></section>
      <section className={styles.section}><h3>声明限制与依赖</h3><div className={styles.summaryGrid}><div><span>统一依赖</span><strong>{latest.dependencies || '未填写'}</strong></div><div><span>统一限制</span><strong>{latest.limitations || '未填写'}</strong></div></div></section>
    </ProjectStageShell>
  );
}
