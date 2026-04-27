import { Link } from 'react-router-dom';
import { Card, Button, Badge, ProgressBar } from '../../components/Common';
import { useVendorPath } from '../../hooks/useProject';
import { PRODUCT_TYPES, CAPABILITY_MATURITY, CAPABILITY_CATEGORIES, CAPABILITY_OPTIONS } from '../../data/capabilities';
import styles from './VendorResult.module.css';

export function VendorResult() {
  const { capabilities } = useVendorPath();

  if (!capabilities || capabilities.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p>暂无能力数据，请先录入产品能力。</p>
          <Link to="/vendor">
            <Button variant="primary">去录入</Button>
          </Link>
        </div>
      </div>
    );
  }

  const latestCapability = capabilities[capabilities.length - 1];
  const productTypeName = PRODUCT_TYPES.find(t => t.id === latestCapability.productType)?.name || latestCapability.productType;

  // 计算各项 FR 的覆盖率
  const frCoverage = calculateFRCoverage(latestCapability.capabilities);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>设备能力评估报告</h1>
        <p className={styles.subtitle}>{latestCapability.productName}</p>
      </div>

      {/* Summary Card */}
      <Card className={styles.summaryCard} variant="accent">
        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <div className={styles.summaryValue}>{latestCapability.productName}</div>
            <div className={styles.summaryLabel}>产品名称</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryValue}>{productTypeName}</div>
            <div className={styles.summaryLabel}>产品类型</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryValue}>SL {latestCapability.securityLevel}</div>
            <div className={styles.summaryLabel}>安全等级</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryValue}>{latestCapability.capabilities.length}</div>
            <div className={styles.summaryLabel}>能力项</div>
          </div>
        </div>
      </Card>

      {/* Capability Profile */}
      <Card className={styles.profileCard}>
        <h3>能力画像</h3>
        <div className={styles.capabilityCloud}>
          {latestCapability.capabilities.map(capId => {
            const cap = Object.values(CAPABILITY_OPTIONS)
              .flat()
              .find(opt => opt.id === capId);
            const maturity = latestCapability.maturityScores[capId] || 1;
            return (
              <div key={capId} className={styles.capabilityTag}>
                <Badge variant="primary">{cap?.label}</Badge>
                <span className={styles.maturityLevel}>L{maturity}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* FR Coverage */}
      <Card className={styles.coverageCard}>
        <h3>FR 维度覆盖度</h3>
        <div className={styles.coverageList}>
          {Object.entries(frCoverage).map(([fr, data]) => (
            <div key={fr} className={styles.coverageItem}>
              <div className={styles.coverageHeader}>
                <Badge variant={data.percentage >= 70 ? 'success' : data.percentage >= 40 ? 'warning' : 'danger'}>
                  {fr}
                </Badge>
                <span className={styles.coverageName}>{data.name}</span>
                <span className={styles.coveragePercent}>{data.percentage}%</span>
              </div>
              <ProgressBar
                value={data.percentage}
                variant={data.percentage >= 70 ? 'success' : data.percentage >= 40 ? 'warning' : 'danger'}
                size="medium"
              />
              <div className={styles.coverageDetails}>
                已覆盖: {data.covered}/{data.total} 项能力
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Capability Details */}
      <Card className={styles.detailsCard}>
        <h3>能力详情</h3>
        {Object.entries(CAPABILITY_CATEGORIES).map(([category, info]) => {
          const categoryCaps = latestCapability.capabilities
            .filter(capId => {
              const cap = Object.values(CAPABILITY_OPTIONS)
                .flat()
                .find(opt => opt.id === capId);
              return cap && CAPABILITY_OPTIONS[category]?.some(opt => opt.id === capId);
            })
            .map(capId => Object.values(CAPABILITY_OPTIONS)
              .flat()
              .find(opt => opt.id === capId))
            .filter(Boolean);

          if (categoryCaps.length === 0) return null;

          return (
            <div key={category} className={styles.detailGroup}>
              <h4>{info.name}</h4>
              <div className={styles.detailList}>
                {categoryCaps.map(cap => (
                  <div key={cap.id} className={styles.detailItem}>
                    <div className={styles.detailHeader}>
                      <span className={styles.detailLabel}>{cap.label}</span>
                      <Badge variant="info" size="small">{cap.fr}</Badge>
                    </div>
                    <div className={styles.maturityIndicator}>
                      {CAPABILITY_MATURITY.map(ml => (
                        <div
                          key={ml.level}
                          className={`${styles.maturityDot} ${
                            (latestCapability.maturityScores[cap.id] || 0) >= ml.level ? styles.active : ''
                          }`}
                          title={ml.name}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </Card>

      {/* Evidence Notes */}
      {latestCapability.evidenceNotes && (
        <Card className={styles.evidenceCard}>
          <h3>证据说明</h3>
          <p className={styles.evidenceText}>{latestCapability.evidenceNotes}</p>
        </Card>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <Link to="/vendor">
          <Button variant="ghost">继续录入</Button>
        </Link>
        <Link to="/selection">
          <Button variant="primary">进入选型匹配</Button>
        </Link>
      </div>
    </div>
  );
}

function calculateFRCoverage(capabilities) {
  const frList = ['FR1', 'FR2', 'FR3', 'FR4', 'FR5', 'FR6', 'FR7', 'FR8'];
  const coverage = {};

  const frNames = {
    FR1: '标识与认证控制',
    FR2: '使用控制',
    FR3: '完整性',
    FR4: '数据机密性',
    FR5: '限制数据流',
    FR6: '事件响应',
    FR7: '可用性',
    FR8: '资源可用性'
  };

  frList.forEach(fr => {
    const allCaps = Object.values(CAPABILITY_OPTIONS)
      .flat()
      .filter(opt => opt.fr === fr);

    const coveredCaps = allCaps.filter(cap =>
      capabilities.includes(cap.id)
    );

    coverage[fr] = {
      name: frNames[fr],
      total: allCaps.length,
      covered: coveredCaps.length,
      percentage: allCaps.length > 0
        ? Math.round((coveredCaps.length / allCaps.length) * 100)
        : 0
    };
  });

  return coverage;
}
