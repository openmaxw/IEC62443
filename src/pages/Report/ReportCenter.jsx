import { useOwnerPath, useIntegratorPath, useVendorPath, useProject } from '../../hooks/useProject';
import styles from './ReportCenter.module.css';

export function ReportCenter() {
  const { state } = useProject();
  const { riskProfile } = useOwnerPath();
  const { plan } = useIntegratorPath();
  const { capabilities, matchResults } = useVendorPath();
  const meta = state.projectMeta || {};

  const items = [
    { title: '业主需求摘要', ready: Boolean(riskProfile), desc: '风险关注、FR 重点、验收关注。' },
    { title: '系统规划草案', ready: Boolean(plan), desc: 'Zone / Conduit / 通信矩阵 / 能力需求。' },
    { title: '设备能力说明', ready: Boolean(capabilities?.length), desc: '能力、证据、依赖与适用边界。' },
    { title: '选型匹配结论', ready: Boolean(matchResults?.results?.length), desc: '匹配度、缺口项、补偿措施。' }
  ];

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <strong>{meta.projectName || '交付中心'}</strong>
        <span>{[meta.organizationName, meta.siteName, meta.industry, meta.scenarioType].filter(Boolean).join(' / ')}</span>
      </div>
      <table className={styles.table}>
        <thead><tr><th>交付项</th><th>状态</th><th>说明</th></tr></thead>
        <tbody>
          {items.map((item) => <tr key={item.title}><td>{item.title}</td><td>{item.ready ? '已具备' : '待补齐'}</td><td>{item.desc}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}
