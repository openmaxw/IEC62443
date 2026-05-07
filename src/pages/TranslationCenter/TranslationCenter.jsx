import { useOwnerPath, useIntegratorPath, useVendorPath, useProject } from '../../hooks/useProject';
import { getCapabilityDisplay } from '../../data/capabilities';
import styles from './TranslationCenter.module.css';

export function TranslationCenter() {
  const { state } = useProject();
  const { assessment, riskProfile } = useOwnerPath();
  const { plan } = useIntegratorPath();
  const { capabilities, matchResults } = useVendorPath();
  const latestCapability = capabilities?.[capabilities.length - 1];
  const meta = state.projectMeta || {};
  const gapItems = (matchResults?.results || []).filter((item) => item.status === 'missing' || item.status === 'external' || item.status === 'partial').slice(0, 6);

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}><strong>{meta.projectName || '翻译中心'}</strong><span>{[meta.organizationName, meta.siteName, meta.industry, meta.scenarioType].filter(Boolean).join(' / ')}</span></div>
      <section className={styles.traceSection}><h3>一、业主业务输入</h3><div className={styles.cardGrid}><div className={styles.card}><strong>关键资产</strong><p>{assessment?.criticalAssets?.join('、') || '未填写'}</p></div><div className={styles.card}><strong>关键系统/角色</strong><p>{assessment?.keySystems || '未填写'}</p></div><div className={styles.card}><strong>外部连接</strong><p>{assessment?.externalConnections || '未填写'}</p></div><div className={styles.card}><strong>连续性要求</strong><p>{assessment?.continuityRequirements || '未填写'}</p></div></div></section>
      <section className={styles.traceSection}><h3>二、风险与要求翻译</h3><div className={styles.cardGrid}><div className={styles.card}><strong>风险关注</strong><p>{(riskProfile?.riskConcernSummary || []).map((item) => item.title).join('、') || '无'}</p></div><div className={styles.card}><strong>FR 重点</strong><p>{(riskProfile?.frFocus || []).map((item) => item.code).join('、') || '无'}</p></div><div className={styles.card}><strong>目标等级候选</strong><p>{(riskProfile?.targetLevelCandidates || []).map((item) => `SL-${item.level}`).join('、') || '无'}</p></div><div className={styles.card}><strong>业主要求</strong><p>{(riskProfile?.ownerRequirements || []).slice(0, 3).map((item) => item.text || item).join('；') || '无'}</p></div></div></section>
      <section className={styles.traceSection}><h3>三、集成设计响应</h3><div className={styles.cardGrid}><div className={styles.card}><strong>Zone / Conduit</strong><p>{plan ? `${plan.zones?.length || 0} 个 Zone / ${plan.conduits?.length || 0} 类 Conduit` : '未形成'}</p></div><div className={styles.card}><strong>通信设计</strong><p>{plan ? `${plan.communicationFlows?.length || 0} 条通信流` : '未形成'}</p></div><div className={styles.card}><strong>设计依据</strong><p>{plan?.designBasisSummary?.designBasis || '未填写'}</p></div><div className={styles.card}><strong>组件能力需求</strong><p>{plan?.capabilityRequirements?.slice(0, 4).map((item) => getCapabilityDisplay(item.capabilityId).label).join('、') || '无'}</p></div></div></section>
      <section className={styles.traceSection}><h3>四、能力与差距状态</h3><div className={styles.cardGrid}><div className={styles.card}><strong>设备产品</strong><p>{latestCapability?.productMeta?.productName || '未填写'}</p></div><div className={styles.card}><strong>声明项数</strong><p>{latestCapability?.capabilityClaims?.length || 0}</p></div><div className={styles.card}><strong>差距项数</strong><p>{gapItems.length}</p></div><div className={styles.card}><strong>待闭环能力项</strong><p>{gapItems.length ? gapItems.map((item) => getCapabilityDisplay(item.capabilityId).label).join('、') : '无'}</p></div></div></section>
    </div>
  );
}
