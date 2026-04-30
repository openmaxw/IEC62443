import { useOwnerPath, useIntegratorPath, useVendorPath, useProject } from '../../hooks/useProject';
import styles from './TranslationCenter.module.css';

export function TranslationCenter() {
  const { state } = useProject();
  const { assessment, riskProfile } = useOwnerPath();
  const { plan } = useIntegratorPath();
  const { capabilities, matchResults } = useVendorPath();
  const latestCapability = capabilities?.[capabilities.length - 1];
  const topMatch = matchResults?.results?.[0];
  const meta = state.projectMeta || {};

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <strong>{meta.projectName || '翻译中心'}</strong>
        <span>{[meta.organizationName, meta.siteName, meta.industry, meta.scenarioType].filter(Boolean).join(' / ')}</span>
      </div>
      <table className={styles.table}>
        <thead><tr><th>阶段</th><th>关键信息</th></tr></thead>
        <tbody>
          <tr><td>业主输入</td><td>行业：{meta.industry || assessment?.industry || '未填写'}；关键资产：{assessment?.criticalAssets?.join('、') || '未填写'}；风险关注：{(riskProfile?.riskConcernSummary || []).map((item) => item.title).join('、') || '无'}</td></tr>
          <tr><td>集成翻译</td><td>目标等级：SL-{plan?.targetSL || '-'}；Zone：{plan?.zones?.length || 0}；通信流：{plan?.communicationFlows?.length || 0}；FR：{(plan?.requiredFR || []).join('、') || '无'}</td></tr>
          <tr><td>设备与匹配</td><td>产品：{latestCapability?.productMeta?.productName || '未填写'}；声明项：{latestCapability?.capabilityClaims?.length || 0}；匹配度：{topMatch?.overallScore ?? 0}%；结论：{topMatch?.recommendations?.label || '待匹配'}</td></tr>
        </tbody>
      </table>
    </div>
  );
}
