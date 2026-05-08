import { Link } from 'react-router-dom';
import { ProjectStageShell } from '../../components/ProjectFlow';
import { useOwnerPath, useIntegratorPath, useVendorPath, useProject } from '../../hooks/useProject';
import { getCapabilityDisplay } from '../../data/capabilities';
import styles from './ReportCenter.module.css';

export function ReportCenter() {
  const { state } = useProject();
  const { riskProfile } = useOwnerPath();
  const { plan } = useIntegratorPath();
  const { capabilities, matchResults, gapClosureItems } = useVendorPath();
  const latestCapability = capabilities?.[capabilities.length - 1];
  const meta = state.projectMeta || {};
  const gapRows = matchResults?.results?.filter((item) => item.status === 'missing' || item.status === 'external' || item.status === 'partial') || [];
  const gapClosureReady = gapRows.length === 0 || gapClosureItems.length >= gapRows.length;
  const highRiskCount = gapClosureItems.filter((item) => item.severity === 'high').length;
  const externalCount = gapClosureItems.filter((item) => item.status === 'external').length;

  const items = [
    { title: '业主交接物', ready: Boolean(riskProfile), desc: '查看业主输入摘要与设计输入。', route: '/owner/result' },
    { title: '集成设计结果', ready: Boolean(plan), desc: '查看 Zone / Conduit、通信设计与能力需求。', route: '/integrator/result' },
    { title: '设备声明结果', ready: Boolean(latestCapability), desc: '查看设备能力声明摘要。', route: '/vendor/result' },
    { title: '闭环', ready: Boolean(matchResults?.results?.length) && gapClosureReady, desc: gapRows.length ? '查看差距项、补偿措施、责任方、验收影响与残余风险。' : '当前没有待闭环差距项。', route: '/selection' },
    { title: '需求追溯链', ready: Boolean(riskProfile && plan), desc: '查看从业务输入到能力/差距的追溯。', route: '/translation-center' }
  ];

  return (
    <ProjectStageShell
      stageNumber="05"
      title="交付中心"
      projectName={meta.projectName}
      outputLabel={`闭环项 ${gapClosureItems.length} / 高严重度 ${highRiskCount}`}
      prevAction={{ to: '/selection', label: '上一步' }}
      guidance={{ summary: '交付中心用于汇总阶段输出与闭环状态。' }}
    >
      <section className={styles.page}>
        <section className={styles.section}>
          <h3>交付项</h3>
          <table className={styles.table}><thead><tr><th>交付项</th><th>状态</th><th>说明</th><th>入口</th></tr></thead><tbody>{items.map((item) => <tr key={item.title}><td>{item.title}</td><td>{item.ready ? '已具备' : '待补齐'}</td><td>{item.desc}</td><td>{item.ready ? <Link to={item.route} className={styles.link}>查看</Link> : '—'}</td></tr>)}</tbody></table>
        </section>

        <section className={styles.section}>
          <h3>闭环项</h3>
          <div className={styles.grid}>
            <div><span>待闭环差距</span><strong>{gapRows.length}</strong></div>
            <div><span>已保存闭环项</span><strong>{gapClosureItems.length}</strong></div>
            <div><span>高严重度</span><strong>{highRiskCount}</strong></div>
            <div><span>依赖外部补偿</span><strong>{externalCount}</strong></div>
          </div>
          {gapClosureItems.length ? <div className={styles.list}>{gapClosureItems.map((item) => <article key={item.id} className={styles.item}><strong>{getCapabilityDisplay(item.capabilityId).label}</strong><div className={styles.capabilityMeta}><span className={styles.standardTag}>{getCapabilityDisplay(item.capabilityId).frText}</span><span className={styles.standardTag}>{getCapabilityDisplay(item.capabilityId).srText}</span></div><span>{item.owner || '责任方未填写'}</span><p><strong>补偿措施：</strong>{item.mitigation || '未填写'}</p><p><strong>验收影响：</strong>{item.acceptanceImpact || '未填写'}</p><p><strong>残余风险：</strong>{item.residualRisk || '未填写'}</p></article>)}</div> : <div className={styles.empty}>当前还没有已保存的闭环决策，请先前往闭环页完成保存。</div>}
        </section>
      </section>
    </ProjectStageShell>
  );
}
