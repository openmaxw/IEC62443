import { Link } from 'react-router-dom';
import { Card, Button, Badge } from '../../components/Common';
import { useVendorPath, useIntegratorPath } from '../../hooks/useProject';
import { performMatching } from '../../utils/matchEngine';
import styles from './SelectionMatrix.module.css';

export function SelectionMatrix() {
  const { capabilities, matchResults } = useVendorPath();
  const { plan } = useIntegratorPath();

  const result = matchResults || (plan && capabilities?.length ? performMatching(plan, capabilities) : null);
  const primary = result?.results?.[0];

  if (!plan || !capabilities?.length) {
    return (
      <div className={styles.page}>
        <Card className={styles.empty} title="暂无匹配结果" subtitle="请先完成集成设计和设备能力声明。">
          <div className={styles.actions}>
            <Link to="/integrator"><Button variant="secondary" size="large">去集成设计</Button></Link>
            <Link to="/vendor"><Button variant="primary" size="large">去设备声明</Button></Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <Badge variant="primary" size="large">选型匹配中心</Badge>
          <h1>{primary?.vendorName || '当前候选产品'}</h1>
          <p>看总体匹配、缺口项和后续补偿措施，而不是只看一个总分。</p>
        </div>
        <div className={styles.scoreCard}>
          <span>总体匹配度</span>
          <strong>{primary?.overallScore ?? 0}%</strong>
          <p>{primary?.recommendations?.description || '待匹配'}</p>
        </div>
      </section>

      <section className={styles.grid}>
        <Card title="状态分布" subtitle="五档匹配结果。">
          <div className={styles.list}>
            <div className={styles.note}>原生满足：{primary?.statusBreakdown.native || 0}</div>
            <div className={styles.note}>配置满足：{primary?.statusBreakdown.configured || 0}</div>
            <div className={styles.note}>依赖外围：{primary?.statusBreakdown.external || 0}</div>
            <div className={styles.note}>补偿措施：{primary?.statusBreakdown.compensating || 0}</div>
            <div className={styles.note}>不满足：{primary?.statusBreakdown.missing || 0}</div>
          </div>
        </Card>
        <Card title="差距重点" subtitle="优先看非原生满足项。">
          <div className={styles.list}>
            {[...(primary?.partial || []), ...(primary?.external || []), ...(primary?.compensating || []), ...(primary?.missing || [])].slice(0, 10).map((item, index) => (
              <div key={`${item.capabilityId}-${index}`} className={styles.note}><strong>{item.capabilityId}</strong><span>{item.limitation || item.dependency || '建议进一步核对外围依赖与补偿措施。'}</span></div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
