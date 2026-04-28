import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge } from '../../components/Common';
import { useProject, useOwnerPath, useIntegratorPath, useVendorPath } from '../../hooks/useProject';
import {
  createAcceptanceDeliverable,
  createIntegratorDeliverables,
  createOwnerDeliverables,
  createVendorDeliverables
} from '../../data/deliverables';
import { exportReportAsJSON } from '../../utils/reportGenerator';
import styles from './ReportCenter.module.css';

const VIEW_MODES = [
  { id: 'owner', label: '业主版项目摘要' },
  { id: 'integrator', label: '集成商版规划草案' },
  { id: 'vendor', label: '设备商版能力说明' },
  { id: 'acceptance', label: '验收检查表' },
  { id: 'complete', label: '完整交付包' }
];

function DeliverableSection({ section }) {
  return (
    <section className={styles.reportSection}>
      <h3>{section.title}</h3>
      <div className={styles.itemList}>
        {(section.items || []).length === 0 ? (
          <div className={styles.noData}>当前暂无内容</div>
        ) : (
          section.items.map((item) => (
            <div key={item.id} className={styles.itemCard}>
              <strong>{item.title}</strong>
              <p>{item.summary}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function DeliverableView({ deliverable }) {
  return (
    <div className={styles.reportContent}>
      <div className={styles.reportHeader}>
        <h2>{deliverable.audience === 'owner' ? '业主版项目摘要' : deliverable.audience === 'integrator' ? '集成商版规划草案' : deliverable.audience === 'vendor' ? '设备商版能力说明' : '验收检查表'}</h2>
        <p className={styles.reportMeta}>{deliverable.summary.projectName} | {deliverable.summary.headline}</p>
      </div>
      {deliverable.sections.map((section) => <DeliverableSection key={section.id} section={section} />)}
      <section className={styles.reportSection}>
        <h3>{deliverable.disclaimer.title}</h3>
        <div className={styles.itemCard}><p>{deliverable.disclaimer.text}</p></div>
      </section>
    </div>
  );
}

export function ReportCenter() {
  const { state } = useProject();
  const { projectMeta, assessment, riskProfile } = useOwnerPath();
  const { plan } = useIntegratorPath();
  const { capabilities, matchResults } = useVendorPath();
  const [viewMode, setViewMode] = useState('owner');

  const deliverables = useMemo(() => ({
    owner: assessment && riskProfile ? createOwnerDeliverables({ assessment, riskProfile }) : null,
    integrator: createIntegratorDeliverables({ projectMeta: state.projectMeta || projectMeta, riskProfile, plan }),
    vendor: createVendorDeliverables({ capabilities, matchResults }),
    acceptance: createAcceptanceDeliverable({ plan, riskProfile })
  }), [assessment, capabilities, matchResults, plan, projectMeta, riskProfile, state.projectMeta]);

  if (!assessment || !riskProfile) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p>暂无足够数据生成交付物，请先完成业主路径。</p>
          <Link to="/owner" className={styles.goButton}>去评估</Link>
        </div>
      </div>
    );
  }

  const handleExport = (format) => {
    const payload = viewMode === 'complete'
      ? {
          audience: 'complete',
          generatedAt: new Date().toISOString(),
          summary: {
            projectName: state.projectMeta?.projectName || projectMeta?.projectName || '未命名项目',
            status: state.projectMeta?.status || 'draft'
          },
          sections: deliverables,
          disclaimer: deliverables.owner.disclaimer,
          traceability: {
            owner: deliverables.owner.traceability,
            integrator: deliverables.integrator.traceability,
            vendor: deliverables.vendor.traceability,
            acceptance: deliverables.acceptance.traceability
          }
        }
      : deliverables[viewMode];

    if (format === 'json') {
      exportReportAsJSON(payload);
    } else {
      window.print();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>交付中心</h1>
        <p className={styles.subtitle}>固定输出业主摘要、规划草案、能力说明、验收检查表与完整交付包</p>
        <div className={styles.exportButtons}>
          <Link to="/dashboard" className={styles.goButton}>返回项目工作台</Link>
          <Link to="/translation-center" className={styles.goButton}>查看翻译中心</Link>
        </div>
      </div>

      <Card className={styles.selectorCard}>
        <div className={styles.viewModes}>
          {VIEW_MODES.map((mode) => (
            <button key={mode.id} className={`${styles.modeButton} ${viewMode === mode.id ? styles.active : ''}`} onClick={() => setViewMode(mode.id)}>
              {mode.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className={styles.reportCard}>
        {viewMode === 'complete' ? (
          <div className={styles.reportContent}>
            <div className={styles.reportHeader}>
              <h2>完整交付包</h2>
              <p className={styles.reportMeta}>{state.projectMeta?.projectName || projectMeta?.projectName || '未命名项目'} | 当前状态：{state.projectMeta?.status || 'draft'}</p>
            </div>
            <div className={styles.completeGrid}>
              <Card><h3>业主版项目摘要</h3><Badge variant="success">已纳入</Badge></Card>
              <Card><h3>集成商版规划草案</h3><Badge variant="info">已纳入</Badge></Card>
              <Card><h3>设备商版能力说明</h3><Badge variant="warning">已纳入</Badge></Card>
              <Card><h3>验收检查表</h3><Badge variant="primary">已纳入</Badge></Card>
            </div>
            {Object.values(deliverables).map((deliverable) => <DeliverableView key={deliverable.type} deliverable={deliverable} />)}
          </div>
        ) : (
          <DeliverableView deliverable={deliverables[viewMode]} />
        )}
      </Card>

      <Card className={styles.exportCard}>
        <h3>导出</h3>
        <div className={styles.exportButtons}>
          <Button variant="primary" onClick={() => handleExport('json')}>导出 JSON</Button>
          <Button variant="secondary" onClick={() => handleExport('print')}>可打印视图</Button>
        </div>
      </Card>
    </div>
  );
}
