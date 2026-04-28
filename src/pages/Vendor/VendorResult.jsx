import { Link } from 'react-router-dom';
import { Card, Button, Badge } from '../../components/Common';
import { useVendorPath, useIntegratorPath, useProject } from '../../hooks/useProject';
import { performMatching } from '../../utils/matchEngine';
import { MATCH_STATUSES } from '../../data/matchStatuses';
import styles from './VendorResult.module.css';

export function VendorResult() {
  const { actions } = useProject();
  const { capabilities } = useVendorPath();
  const { plan } = useIntegratorPath();

  if (!capabilities || capabilities.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p>暂无设备能力数据，请先完成能力声明。</p>
          <Link to="/vendor">
            <Button variant="primary">去录入</Button>
          </Link>
        </div>
      </div>
    );
  }

  const latest = capabilities[capabilities.length - 1];
  const match = plan ? performMatching(plan, [latest]) : null;
  const top = match?.results?.[0] || null;

  if (match) {
    actions.setMatchResults(match);
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>设备能力声明结果</h1>
        <p className={styles.subtitle}>{latest.productMeta?.productName || '未命名产品'}</p>
      </div>

      <Card className={styles.summaryCard} variant="accent">
        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <div className={styles.summaryValue}>SL {latest.productMeta?.securityLevel}</div>
            <div className={styles.summaryLabel}>能力等级声明</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryValue}>{latest.capabilityClaims.length}</div>
            <div className={styles.summaryLabel}>能力声明项</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryValue}>{top?.overallScore ?? 0}%</div>
            <div className={styles.summaryLabel}>项目匹配度</div>
          </div>
        </div>
      </Card>

      <Card className={styles.detailCard}>
        <h3>能力声明</h3>
        <div className={styles.capabilityList}>
          {latest.capabilityClaims.map((claim) => (
            <div key={claim.capabilityId} className={styles.capabilityItem}>
              <div className={styles.capabilityHeader}>
                <Badge variant="primary">{claim.capabilityId}</Badge>
                <Badge variant={MATCH_STATUSES[claim.satisfaction]?.badge || 'info'}>{MATCH_STATUSES[claim.satisfaction]?.label || claim.satisfaction}</Badge>
              </div>
              <p>能力等级：SL{claim.securityLevel} | 证据：{claim.evidenceType}</p>
              {claim.dependency && <p>依赖条件：{claim.dependency}</p>}
              {claim.claimScope && <p>声明边界：{claim.claimScope}</p>}
              {claim.limitation && <p>适用边界：{claim.limitation}</p>}
              {claim.riskNote && <p>风险备注：{claim.riskNote}</p>}
            </div>
          ))}
        </div>
      </Card>

      <Card className={styles.detailCard}>
        <h3>统一依赖与限制</h3>
        <p>{latest.dependencies || '无统一依赖说明'}</p>
        <p>{latest.limitations || '无已知不适配边界说明'}</p>
      </Card>

      {top && (
        <Card className={styles.detailCard}>
          <h3>项目适配摘要</h3>
          <p>{top.recommendations.label}：{top.recommendations.description}</p>
          <div className={styles.capabilityList}>
            <Badge variant="success">原生满足 {top.statusBreakdown.native}</Badge>
            <Badge variant="info">配置后满足 {top.statusBreakdown.configured}</Badge>
            <Badge variant="warning">依赖外围控制 {top.statusBreakdown.external}</Badge>
            <Badge variant="warning">补偿措施可接受 {top.statusBreakdown.compensating}</Badge>
            <Badge variant="danger">不满足 {top.statusBreakdown.missing}</Badge>
          </div>
        </Card>
      )}

      <div className={styles.actions}>
        <Link to="/translation-center">
          <Button variant="ghost">查看翻译中心</Button>
        </Link>
        <Link to="/vendor">
          <Button variant="ghost">继续调整</Button>
        </Link>
        <Link to="/selection">
          <Button variant="primary">查看选型匹配</Button>
        </Link>
      </div>
    </div>
  );
}
