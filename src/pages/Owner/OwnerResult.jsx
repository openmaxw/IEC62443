import { Link } from 'react-router-dom';
import { Card, Button, Badge, ProgressBar } from '../../components/Common';
import { useOwnerPath } from '../../hooks/useProject';
import { INDUSTRIES } from '../../data/industries';
import styles from './OwnerResult.module.css';

export function OwnerResult() {
  const { assessment, riskProfile } = useOwnerPath();

  if (!assessment || !riskProfile) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p>暂无评估数据，请先完成评估问卷。</p>
          <Link to="/owner">
            <Button variant="primary">去评估</Button>
          </Link>
        </div>
      </div>
    );
  }

  const industryName = INDUSTRIES.find(i => i.id === assessment.industry)?.name || assessment.industry;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>风险评估报告</h1>
        <p className={styles.subtitle}>
          {assessment.projectName || '安全网络规划项目'} - {industryName}
        </p>
      </div>

      {/* Risk Level Section */}
      <Card className={styles.riskCard} variant="accent">
        <div className={styles.riskLevel}>
          <div className={styles.riskScore}>
            <svg className={styles.riskGauge} viewBox="0 0 100 50">
              <path
                d="M10 45 A 35 35 0 0 1 90 45"
                fill="none"
                stroke="var(--color-bg-input)"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M10 45 A 35 35 0 0 1 90 45"
                fill="none"
                stroke={getRiskColor(riskProfile.riskLevel.level)}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${riskProfile.riskLevel.percentage * 1.1} 110`}
              />
            </svg>
            <div className={styles.scoreValue}>
              <span className={styles.scoreNumber}>{riskProfile.riskLevel.percentage}</span>
              <span className={styles.scoreLabel}>风险指数</span>
            </div>
          </div>
          <div className={styles.riskInfo}>
            <Badge
              variant={
                riskProfile.riskLevel.level === 'high' ? 'danger' :
                riskProfile.riskLevel.level === 'medium' ? 'warning' : 'success'
              }
              size="large"
            >
              {riskProfile.riskLevel.label}
            </Badge>
            <p className={styles.riskDesc}>
              {riskProfile.riskLevel.level === 'high' && '您的系统面临较高风险，建议优先关注安全建设'}
              {riskProfile.riskLevel.level === 'medium' && '您的系统面临中等风险，建议持续改进安全状况'}
              {riskProfile.riskLevel.level === 'low' && '您的系统风险较低，可按标准流程推进安全建设'}
            </p>
          </div>
        </div>
      </Card>

      {/* Radar Chart */}
      <Card className={styles.chartCard}>
        <h3>风险雷达图</h3>
        <div className={styles.radarContainer}>
          <RadarChart data={riskProfile.radarData} />
        </div>
      </Card>

      {/* Protection Focus */}
      <Card className={styles.focusCard}>
        <h3>保护重点</h3>
        <div className={styles.focusList}>
          {riskProfile.protectionFocus.map((focus, idx) => (
            <div key={idx} className={styles.focusItem}>
              <span className={styles.focusNumber}>{idx + 1}</span>
              <span className={styles.focusText}>{focus}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Security Level Recommendation */}
      <Card className={styles.slCard}>
        <h3>建议安全等级</h3>
        <div className={styles.slGrid}>
          {riskProfile.recommendedSL.map(sl => (
            <div key={sl.level} className={`${styles.slItem} ${sl.level === riskProfile.recommendedSL[0].level ? styles.recommended : ''}`}>
              <div className={styles.slLevel}>SL {sl.level}</div>
              <div className={styles.slName}>{sl.name}</div>
              <div className={styles.slDesc}>{sl.description}</div>
              <div className={styles.slTarget}>适用: {sl.target}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* FR Dimensions */}
      <Card className={styles.frCard}>
        <h3>重点安全维度 (FR)</h3>
        <div className={styles.frGrid}>
          {riskProfile.frDimensions.map(fr => (
            <div key={fr.code} className={styles.frItem}>
              <div className={styles.frHeader}>
                <Badge variant="primary">{fr.code}</Badge>
                <span className={styles.frName}>{fr.name}</span>
              </div>
              <p className={styles.frDesc}>{fr.description}</p>
              <div className={styles.frSR}>
                相关要求: {fr.sr.slice(0, 4).join(', ')}...
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Key Risks */}
      {riskProfile.summary?.keyRisks?.length > 0 && (
        <Card className={styles.keyRisksCard}>
          <h3>关键风险项</h3>
          <div className={styles.riskList}>
            {riskProfile.summary.keyRisks.map(risk => (
              <div key={risk.id} className={`${styles.riskItem} ${styles[risk.level]}`}>
                <div className={styles.riskItemHeader}>
                  <span className={styles.riskItemTitle}>{risk.risk}</span>
                  <Badge variant={risk.level === 'high' ? 'danger' : 'warning'} size="small">
                    {risk.level === 'high' ? '高风险' : '中风险'}
                  </Badge>
                </div>
                <p className={styles.riskItemDesc}>{risk.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Summary */}
      <Card className={styles.summaryCard}>
        <h3>评估摘要</h3>
        <p className={styles.summaryText}>{riskProfile.summary?.description}</p>
      </Card>

      {/* Actions */}
      <div className={styles.actions}>
        <Link to="/owner">
          <Button variant="ghost">重新评估</Button>
        </Link>
        <Link to="/integrator">
          <Button variant="primary">开始系统规划</Button>
        </Link>
      </div>
    </div>
  );
}

// Simple Radar Chart Component
function RadarChart({ data }) {
  const centerX = 150;
  const centerY = 150;
  const radius = 100;
  const angleStep = (2 * Math.PI) / data.length;

  const points = data.map((item, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const value = (item.value / 100) * radius;
    return {
      x: centerX + value * Math.cos(angle),
      y: centerY + value * Math.sin(angle),
      label: item.dimension,
      value: item.value
    };
  });

  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  const axisPoints = data.map((_, i) => {
    const angle = angleStep * i - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });

  const labelPoints = data.map((item, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const labelRadius = radius + 25;
    return {
      x: centerX + labelRadius * Math.cos(angle),
      y: centerY + labelRadius * Math.sin(angle),
      label: item.dimension,
      value: item.value
    };
  });

  return (
    <svg viewBox="0 0 300 300" className={styles.radarSvg}>
      {/* Background circles */}
      {[0.25, 0.5, 0.75, 1].map((scale, i) => (
        <circle
          key={i}
          cx={centerX}
          cy={centerY}
          r={radius * scale}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      ))}

      {/* Axis lines */}
      {axisPoints.map((point, i) => (
        <line
          key={i}
          x1={centerX}
          y1={centerY}
          x2={point.x}
          y2={point.y}
          stroke="var(--color-border)"
          strokeWidth="1"
        />
      ))}

      {/* Data polygon */}
      <polygon
        points={polygonPoints}
        fill="rgba(255, 111, 0, 0.3)"
        stroke="var(--color-accent)"
        strokeWidth="2"
      />

      {/* Data points */}
      {points.map((point, i) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="4"
          fill="var(--color-accent)"
        />
      ))}

      {/* Labels */}
      {labelPoints.map((point, i) => (
        <text
          key={i}
          x={point.x}
          y={point.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className={styles.radarLabel}
        >
          {point.label}
        </text>
      ))}
    </svg>
  );
}

function getRiskColor(level) {
  switch (level) {
    case 'high': return 'var(--color-danger)';
    case 'medium': return 'var(--color-warning)';
    case 'low': return 'var(--color-success)';
    default: return 'var(--color-accent)';
  }
}
