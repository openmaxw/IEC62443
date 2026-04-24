import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge } from '../../components/Common';
import { useProject } from '../../context/ProjectContext';
import { useOwnerPath, useIntegratorPath, useVendorPath } from '../../hooks/useProject';
import { exportReportAsJSON } from '../../utils/reportGenerator';
import styles from './ReportCenter.module.css';

const VIEW_MODES = [
  { id: 'owner', label: '业主版' },
  { id: 'integrator', label: '集成商版' },
  { id: 'vendor', label: '设备商版' },
  { id: 'complete', label: '完整版' }
];

export function ReportCenter() {
  const { state } = useProject();
  const { assessment, riskProfile } = useOwnerPath();
  const { plan } = useIntegratorPath();
  const { capabilities } = useVendorPath();

  const [viewMode, setViewMode] = useState('owner');

  const canGenerateReport = assessment && riskProfile;

  if (!canGenerateReport) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p>暂无足够的评估数据生成报告。</p>
          <p>请先完成业主评估流程。</p>
          <Link to="/owner" className={styles.goButton}>
            去评估
          </Link>
        </div>
      </div>
    );
  }

  const handleExport = (format) => {
    const report = generateReport(viewMode, { assessment, riskProfile, plan, capabilities });
    if (format === 'json') {
      exportReportAsJSON(report);
    } else if (format === 'pdf') {
      // 使用浏览器打印功能生成 PDF
      window.print();
    }
  };

  const renderReportContent = () => {
    switch (viewMode) {
      case 'owner':
        return <OwnerReport assessment={assessment} riskProfile={riskProfile} />;
      case 'integrator':
        return <IntegratorReport plan={plan} riskProfile={riskProfile} />;
      case 'vendor':
        return <VendorReport capabilities={capabilities} />;
      case 'complete':
        return <CompleteReport assessment={assessment} riskProfile={riskProfile} plan={plan} capabilities={capabilities} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>报告中心</h1>
        <p className={styles.subtitle}>生成并导出项目报告</p>
      </div>

      {/* View Mode Selector */}
      <Card className={styles.selectorCard}>
        <div className={styles.viewModes}>
          {VIEW_MODES.map(mode => (
            <button
              key={mode.id}
              className={`${styles.modeButton} ${viewMode === mode.id ? styles.active : ''}`}
              onClick={() => setViewMode(mode.id)}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Report Preview */}
      <Card className={styles.reportCard}>
        {renderReportContent()}
      </Card>

      {/* Export Actions */}
      <Card className={styles.exportCard}>
        <h3>导出报告</h3>
        <div className={styles.exportButtons}>
          <Button variant="primary" onClick={() => handleExport('json')}>
            导出 JSON
          </Button>
          <Button variant="secondary" onClick={() => handleExport('pdf')}>
            导出 PDF
          </Button>
        </div>
      </Card>
    </div>
  );
}

function OwnerReport({ assessment, riskProfile }) {
  if (!assessment || !riskProfile) return null;

  return (
    <div className={styles.reportContent}>
      <div className={styles.reportHeader}>
        <h2>业主安全需求评估报告</h2>
        <p className={styles.reportMeta}>
          项目: {assessment.projectName || '未命名项目'} | 行业: {assessment.industry}
        </p>
      </div>

      <section className={styles.reportSection}>
        <h3>1. 风险评估结果</h3>
        <div className={styles.riskResult}>
          <Badge variant={riskProfile.riskLevel.level === 'high' ? 'danger' : riskProfile.riskLevel.level === 'medium' ? 'warning' : 'success'} size="large">
            {riskProfile.riskLevel.label}
          </Badge>
          <p>风险指数: {riskProfile.riskLevel.percentage}%</p>
        </div>
      </section>

      <section className={styles.reportSection}>
        <h3>2. 建议安全等级</h3>
        <div className={styles.slRecommendation}>
          {riskProfile.recommendedSL.map(sl => (
            <div key={sl.level} className={styles.slItem}>
              <span className={styles.slLevel}>SL {sl.level}</span>
              <span>{sl.name}</span>
              <span className={styles.slTarget}>{sl.target}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.reportSection}>
        <h3>3. 重点安全维度</h3>
        <div className={styles.frList}>
          {riskProfile.frDimensions.map(fr => (
            <div key={fr.code} className={styles.frItem}>
              <Badge variant="primary">{fr.code}</Badge>
              <span>{fr.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.reportSection}>
        <h3>4. 保护重点</h3>
        <ul className={styles.protectionList}>
          {riskProfile.protectionFocus.map((focus, idx) => (
            <li key={idx}>{focus}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function IntegratorReport({ plan, riskProfile }) {
  if (!plan) return <div className={styles.noData}>暂无集成商规划数据</div>;

  return (
    <div className={styles.reportContent}>
      <div className={styles.reportHeader}>
        <h2>集成商系统规划报告</h2>
        <p className={styles.reportMeta}>目标安全等级: SL {plan.targetSL}</p>
      </div>

      <section className={styles.reportSection}>
        <h3>1. 分区规划</h3>
        <div className={styles.zoneList}>
          {plan.zones.map((zoneId, idx) => (
            <Badge key={idx} variant="info">{zoneId}</Badge>
          ))}
        </div>
      </section>

      <section className={styles.reportSection}>
        <h3>2. 通信管道</h3>
        <div className={styles.zoneList}>
          {plan.conduits.map((conduitId, idx) => (
            <Badge key={idx} variant="primary">{conduitId}</Badge>
          ))}
        </div>
      </section>

      <section className={styles.reportSection}>
        <h3>3. 安全规则建议</h3>
        <div className={styles.rulesList}>
          {plan.securityRules?.map((rule, idx) => (
            <div key={idx} className={styles.ruleItem}>{rule}</div>
          )) || <p>暂无规则数据</p>}
        </div>
      </section>
    </div>
  );
}

function VendorReport({ capabilities }) {
  if (!capabilities || capabilities.length === 0) return <div className={styles.noData}>暂无设备商能力数据</div>;

  const latest = capabilities[capabilities.length - 1];

  return (
    <div className={styles.reportContent}>
      <div className={styles.reportHeader}>
        <h2>设备商能力评估报告</h2>
        <p className={styles.reportMeta}>{latest.productName}</p>
      </div>

      <section className={styles.reportSection}>
        <h3>1. 产品信息</h3>
        <div className={styles.productInfo}>
          <div className={styles.infoItem}>
            <span>产品名称:</span>
            <strong>{latest.productName}</strong>
          </div>
          <div className={styles.infoItem}>
            <span>产品类型:</span>
            <strong>{latest.productType}</strong>
          </div>
          <div className={styles.infoItem}>
            <span>安全等级:</span>
            <strong>SL {latest.securityLevel}</strong>
          </div>
        </div>
      </section>

      <section className={styles.reportSection}>
        <h3>2. 安全能力</h3>
        <div className={styles.capabilityList}>
          {latest.capabilities.map((capId, idx) => (
            <Badge key={idx} variant="primary">{capId}</Badge>
          ))}
        </div>
      </section>
    </div>
  );
}

function CompleteReport({ assessment, riskProfile, plan, capabilities }) {
  return (
    <div className={styles.reportContent}>
      <div className={styles.reportHeader}>
        <h2>完整项目报告</h2>
        <p className={styles.reportMeta}>
          项目: {assessment?.projectName || '未命名项目'} | 生成时间: {new Date().toLocaleDateString()}
        </p>
      </div>

      <section className={styles.reportSection}>
        <h3>第一部分: 业主需求</h3>
        <p>风险等级: {riskProfile?.riskLevel?.label || 'N/A'}</p>
        <p>建议安全等级: {riskProfile?.recommendedSL?.[0]?.level || 'N/A'}</p>
      </section>

      <section className={styles.reportSection}>
        <h3>第二部分: 系统规划</h3>
        <p>分区数量: {plan?.zones?.length || 0}</p>
        <p>通信管道: {plan?.conduits?.length || 0}</p>
      </section>

      <section className={styles.reportSection}>
        <h3>第三部分: 设备能力</h3>
        <p>能力项数量: {capabilities?.length || 0}</p>
      </section>
    </div>
  );
}

function generateReport(viewMode, data) {
  return {
    type: viewMode,
    generatedAt: new Date().toISOString(),
    data
  };
}
