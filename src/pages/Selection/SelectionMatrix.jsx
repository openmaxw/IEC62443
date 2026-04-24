import { Link } from 'react-router-dom';
import { Card, Button, Badge, ProgressBar } from '../../components/Common';
import { useProject } from '../../context/ProjectContext';
import { useIntegratorPath, useVendorPath } from '../../hooks/useProject';
import { PRODUCT_TYPES, CAPABILITY_OPTIONS, MATURITY_LEVELS } from '../../data/capabilities';
import { FR_CATEGORIES } from '../../data/rules';
import styles from './SelectionMatrix.module.css';

export function SelectionMatrix() {
  const { state } = useProject();
  const { plan } = useIntegratorPath();
  const { capabilities } = useVendorPath();

  if (!plan || !capabilities || capabilities.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p>请先完成集成商规划和设备商能力录入。</p>
          <div className={styles.emptyLinks}>
            <Link to="/integrator">
              <Button variant="secondary">集成商规划</Button>
            </Link>
            <Link to="/vendor">
              <Button variant="secondary">设备商录入</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const latestCapability = capabilities[capabilities.length - 1];
  const productTypeName = PRODUCT_TYPES.find(t => t.id === latestCapability.productType)?.name || '';

  // 计算匹配度
  const matchScore = calculateMatchScore(plan, latestCapability);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>选型匹配中心</h1>
        <p className={styles.subtitle}>设备能力与项目需求匹配分析</p>
      </div>

      {/* Match Score Overview */}
      <Card className={styles.scoreCard} variant="accent">
        <div className={styles.scoreSection}>
          <div className={styles.scoreCircle}>
            <svg viewBox="0 0 120 120" className={styles.scoreSvg}>
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="var(--color-bg-input)"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={getScoreColor(matchScore.percentage)}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${matchScore.percentage * 3.14} 314`}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className={styles.scoreValue}>
              <span className={styles.scoreNumber}>{matchScore.percentage}%</span>
              <span className={styles.scoreLabel}>匹配度</span>
            </div>
          </div>

          <div className={styles.scoreDetails}>
            <div className={styles.scoreDetail}>
              <Badge variant="success">完全满足</Badge>
              <span>{matchScore.fullMatch} 项</span>
            </div>
            <div className={styles.scoreDetail}>
              <Badge variant="warning">部分满足</Badge>
              <span>{matchScore.partialMatch} 项</span>
            </div>
            <div className={styles.scoreDetail}>
              <Badge variant="danger">未满足</Badge>
              <span>{matchScore.missingCount} 项</span>
            </div>
          </div>

          <div className={styles.recommendation}>
            <Badge variant={matchScore.percentage >= 70 ? 'success' : matchScore.percentage >= 40 ? 'warning' : 'danger'} size="large">
              {matchScore.percentage >= 70 ? '推荐选型' : matchScore.percentage >= 40 ? '需评估差距' : '不满足基本需求'}
            </Badge>
            <p>{getRecommendationText(matchScore.percentage)}</p>
          </div>
        </div>
      </Card>

      {/* Capability Requirements vs Provided */}
      <Card className={styles.matrixCard}>
        <h3>需求匹配矩阵</h3>
        <table className={styles.matrixTable}>
          <thead>
            <tr>
              <th>需求项</th>
              <th>FR</th>
              <th>最低等级</th>
              <th>产品等级</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {matchScore.details.map((detail, idx) => (
              <tr key={idx}>
                <td>{detail.label}</td>
                <td><Badge variant="primary" size="small">{detail.fr}</Badge></td>
                <td>{MATURITY_LEVELS.find(m => m.level === detail.requiredMaturity)?.name}</td>
                <td>
                  {detail.providedMaturity > 0
                    ? MATURITY_LEVELS.find(m => m.level === detail.providedMaturity)?.name
                    : '-'}
                </td>
                <td>
                  <Badge
                    variant={detail.status === 'full' ? 'success' : detail.status === 'partial' ? 'warning' : 'danger'}
                    size="small"
                  >
                    {detail.status === 'full' ? '满足' : detail.status === 'partial' ? '部分' : '未满足'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* FR Coverage */}
      <Card className={styles.frCoverageCard}>
        <h3>FR 维度覆盖分析</h3>
        <div className={styles.frCoverageList}>
          {plan.requiredFR.map(frCode => {
            const frDetails = FR_CATEGORIES[frCode];
            const matchedCaps = matchScore.details.filter(
              d => d.fr === frCode && d.status !== 'missing'
            ).length;
            const totalCaps = matchScore.details.filter(d => d.fr === frCode).length;
            const percentage = totalCaps > 0 ? Math.round((matchedCaps / totalCaps) * 100) : 0;

            return (
              <div key={frCode} className={styles.frCoverageItem}>
                <div className={styles.frHeader}>
                  <Badge variant="primary">{frCode}</Badge>
                  <span className={styles.frName}>{frDetails?.name}</span>
                  <span className={styles.frPercent}>{percentage}%</span>
                </div>
                <ProgressBar
                  value={percentage}
                  variant={percentage >= 70 ? 'success' : percentage >= 40 ? 'warning' : 'danger'}
                  size="medium"
                />
                <p className={styles.frDesc}>{frDetails?.description}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Gap Analysis */}
      {matchScore.missingCount > 0 && (
        <Card className={styles.gapCard}>
          <h3>差距分析</h3>
          <div className={styles.gapList}>
            {matchScore.details.filter(d => d.status !== 'full').map((detail, idx) => (
              <div key={idx} className={`${styles.gapItem} ${styles[detail.status]}`}>
                <div className={styles.gapHeader}>
                  <span className={styles.gapLabel}>{detail.label}</span>
                  <Badge
                    variant={detail.status === 'partial' ? 'warning' : 'danger'}
                    size="small"
                  >
                    {detail.status === 'partial' ? '部分满足' : '未满足'}
                  </Badge>
                </div>
                <p className={styles.gapDesc}>
                  {detail.status === 'partial'
                    ? `当前等级 ${detail.providedMaturity}，建议提升至 ${detail.requiredMaturity}`
                    : `缺少此能力，需要补充`}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Product Info */}
      <Card className={styles.productCard}>
        <h3>候选产品信息</h3>
        <div className={styles.productInfo}>
          <div className={styles.productMain}>
            <h4>{latestCapability.productName}</h4>
            <Badge variant="info">{productTypeName}</Badge>
            <Badge variant="primary">SL {latestCapability.securityLevel}</Badge>
          </div>
          <div className={styles.productStats}>
            <div className={styles.productStat}>
              <span className={styles.statValue}>{latestCapability.capabilities.length}</span>
              <span className={styles.statLabel}>能力项</span>
            </div>
            <div className={styles.productStat}>
              <span className={styles.statValue}>
                {Object.values(latestCapability.maturityScores).filter((m, i, a) => a.indexOf(m) === i).length || 1}
              </span>
              <span className={styles.statLabel}>成熟度级别</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className={styles.actions}>
        <Link to="/vendor">
          <Button variant="ghost">调整能力录入</Button>
        </Link>
        <Link to="/report">
          <Button variant="primary">生成报告</Button>
        </Link>
      </div>
    </div>
  );
}

function calculateMatchScore(plan, capability) {
  const requiredCaps = [];

  // 根据 plan.requiredFR 生成需求能力列表
  plan.requiredFR.forEach(fr => {
    Object.entries(CAPABILITY_OPTIONS).forEach(([category, options]) => {
      options.filter(opt => opt.fr === fr).forEach(opt => {
        requiredCaps.push({
          ...opt,
          minMaturity: plan.targetSL
        });
      });
    });
  });

  const details = requiredCaps.map(req => {
    // capability.capabilities is an array of capability IDs
    const providedCapId = capability.capabilities.find(c => c === req.id);
    const providedMaturity = providedCapId ? (capability.maturityScores[req.id] || 1) : 0;

    let status = 'missing';
    if (providedCapId) {
      status = providedMaturity >= req.minMaturity ? 'full' : 'partial';
    }

    return {
      ...req,
      providedMaturity,
      status,
      fr: req.fr
    };
  });

  const fullMatch = details.filter(d => d.status === 'full').length;
  const partialMatch = details.filter(d => d.status === 'partial').length;
  const missingCount = details.filter(d => d.status === 'missing').length;

  const percentage = details.length > 0
    ? Math.round(((fullMatch * 2 + partialMatch) / (details.length * 2)) * 100)
    : 0;

  return {
    details: details.slice(0, 15), // 限制显示数量
    fullMatch,
    partialMatch,
    missingCount,
    percentage
  };
}

function getScoreColor(percentage) {
  if (percentage >= 70) return 'var(--color-success)';
  if (percentage >= 40) return 'var(--color-warning)';
  return 'var(--color-danger)';
}

function getRecommendationText(percentage) {
  if (percentage >= 70) {
    return '该产品基本满足项目需求，建议进入候选名单进行进一步评估。';
  } else if (percentage >= 40) {
    return '该产品部分满足需求，建议评估差距项是否可接受或寻求替代方案。';
  }
  return '该产品无法满足项目基本安全需求，建议寻找其他供应商或产品。';
}
