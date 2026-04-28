import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, ProgressBar, ViewModeTabs } from '../../components/Common';
import { useIntegratorPath, useVendorPath, useProject } from '../../hooks/useProject';
import { performMatching } from '../../utils/matchEngine';
import { FR_CATEGORIES } from '../../data/rules';
import { getMatchStatusLabel, getMatchStatusVariant } from '../../utils/matchPresentation';
import styles from './SelectionMatrix.module.css';

export function SelectionMatrix() {
  const { actions } = useProject();
  const { plan } = useIntegratorPath();
  const { capabilities } = useVendorPath();
  const [viewMode, setViewMode] = useState('basic');

  if (!plan || !capabilities || capabilities.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p>请先完成集成商规划和设备商能力录入。</p>
          <div className={styles.emptyLinks}>
            <Link to="/integrator"><Button variant="secondary">集成商规划</Button></Link>
            <Link to="/vendor"><Button variant="secondary">设备商录入</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  const match = performMatching(plan, capabilities);
  const primary = match.results[0];
  actions.setMatchResults(match);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>选型匹配中心</h1>
        <p className={styles.subtitle}>结构化比对能力声明与项目需求</p>
      </div>

      <Card className={styles.matrixCard}>
        <h3>解释层级</h3>
        <ViewModeTabs value={viewMode} onChange={setViewMode} />
      </Card>

      <Card className={styles.scoreCard} variant="accent">
        <div className={styles.scoreSection}>
          <div className={styles.scoreValue}>
            <span className={styles.scoreNumber}>{primary?.overallScore || 0}%</span>
            <span className={styles.scoreLabel}>匹配度</span>
          </div>
          <div className={styles.scoreDetails}>
            <div className={styles.scoreDetail}><Badge variant="success">原生满足</Badge><span>{primary?.statusBreakdown.native || 0}</span></div>
            <div className={styles.scoreDetail}><Badge variant="info">配置后满足</Badge><span>{primary?.statusBreakdown.configured || 0}</span></div>
            <div className={styles.scoreDetail}><Badge variant="warning">依赖外围控制</Badge><span>{primary?.statusBreakdown.external || 0}</span></div>
            <div className={styles.scoreDetail}><Badge variant="warning">补偿措施可接受</Badge><span>{primary?.statusBreakdown.compensating || 0}</span></div>
            <div className={styles.scoreDetail}><Badge variant="danger">不满足</Badge><span>{primary?.statusBreakdown.missing || 0}</span></div>
          </div>
          <div className={styles.recommendation}>
            <Badge variant={primary?.recommendations.level === 'excellent' ? 'success' : primary?.recommendations.level === 'good' ? 'info' : primary?.recommendations.level === 'warning' ? 'warning' : 'danger'} size="large">
              {primary?.recommendations.label || '待评估'}
            </Badge>
            <p>{primary?.recommendations.description}</p>
          </div>
        </div>
      </Card>

      <Card className={styles.matrixCard}>
        <h3>能力需求矩阵</h3>
        <table className={styles.matrixTable}>
          <thead>
            <tr>
              <th>能力项</th>
              <th>控制目标</th>
              <th>FR</th>
              <th>满足方式</th>
              <th>证据</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {(primary?.details || []).map((detail, index) => (
              <tr key={`${detail.capabilityId}-${index}`}>
                <td>{detail.capabilityId}</td>
                <td>{detail.controlObjective}</td>
                <td>{viewMode !== 'basic' ? detail.sourceFR.map((fr) => <Badge key={fr} variant="primary" size="small">{fr}</Badge>) : '-'}</td>
                <td>{detail.providedBy || '-'}</td>
                <td>{viewMode === 'professional' ? (detail.evidenceType || '-') : '-'}</td>
                <td><Badge variant={getMatchStatusVariant(detail.status)} size="small">{getMatchStatusLabel(detail.status)}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className={styles.frCoverageCard}>
        <h3>FR 覆盖概览</h3>
        <div className={styles.frCoverageList}>
          {(plan.requiredFR || []).map((frCode) => {
            const total = (primary?.details || []).filter((item) => item.sourceFR.includes(frCode)).length;
            const matched = (primary?.details || []).filter((item) => item.sourceFR.includes(frCode) && item.status !== 'missing').length;
            const percentage = total > 0 ? Math.round((matched / total) * 100) : 0;
            return (
              <div key={frCode} className={styles.frCoverageItem}>
                <div className={styles.frHeader}>
                  <Badge variant="primary">{frCode}</Badge>
                  <span className={styles.frName}>{FR_CATEGORIES[frCode]?.name}</span>
                  <span className={styles.frPercent}>{percentage}%</span>
                </div>
                <ProgressBar value={percentage} variant={percentage >= 70 ? 'success' : percentage >= 40 ? 'warning' : 'danger'} size="medium" />
                <p className={styles.frDesc}>{FR_CATEGORIES[frCode]?.description}</p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className={styles.gapCard}>
        <h3>差距分析</h3>
        <div className={styles.gapList}>
          {[...(primary?.partial || []), ...(primary?.external || []), ...(primary?.compensating || []), ...(primary?.missing || [])].map((detail, index) => (
            <div key={`${detail.capabilityId}-${index}`} className={`${styles.gapItem} ${styles.warning}`}>
              <div className={styles.gapHeader}>
                <span className={styles.gapLabel}>{detail.capabilityId}</span>
                <Badge variant={getMatchStatusVariant(detail.status)} size="small">{getMatchStatusLabel(detail.status)}</Badge>
              </div>
              <p className={styles.gapDesc}>{viewMode === 'basic' ? '建议结合外围系统、补偿措施或配置策略进一步评估。' : (detail.limitation || detail.dependency || '建议结合外围系统或补偿措施进一步评估。')}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className={styles.actions}>
        <Link to="/translation-center"><Button variant="ghost">查看翻译中心</Button></Link>
        <Link to="/vendor"><Button variant="ghost">调整能力声明</Button></Link>
        <Link to="/report"><Button variant="primary">查看交付中心</Button></Link>
      </div>
    </div>
  );
}
