import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, ViewModeTabs } from '../../components/Common';
import { useOwnerPath } from '../../hooks/useProject';
import { INDUSTRIES } from '../../data/industries';
import { createOwnerDeliverables } from '../../data/deliverables';
import styles from './OwnerResult.module.css';

function getBadgeVariant(level) {
  if (level === 'high') return 'danger';
  if (level === 'medium') return 'warning';
  return 'default';
}

export function OwnerResult() {
  const { projectMeta, assessment, riskProfile } = useOwnerPath();
  const [viewMode, setViewMode] = useState('basic');

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

  const industryName = INDUSTRIES.find((item) => item.id === assessment.industry)?.name || assessment.industry;
  const deliverable = createOwnerDeliverables({ assessment, riskProfile });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>业主交接物</h1>
        <p className={styles.subtitle}>{(projectMeta?.projectName || assessment.projectName || '安全网络规划项目')} - {industryName}</p>
      </div>

      <Card className={styles.summaryCard}>
        <h3>解释层级</h3>
        <ViewModeTabs value={viewMode} onChange={setViewMode} />
      </Card>

      <Card className={styles.riskCard} variant="accent">
        <div className={styles.riskLevel}>
          <div className={styles.riskInfo}>
            <Badge variant="warning" size="large">风险关注画像</Badge>
            <p className={styles.riskDesc}>{deliverable.summary.headline}</p>
            <p className={styles.riskDesc}>{deliverable.summary.recommendedTarget}</p>
          </div>
        </div>
      </Card>

      {deliverable.sections.map((section) => (
        <Card key={section.id} className={styles.summaryCard}>
          <h3>{section.title}</h3>
          <div className={styles.focusList}>
            {section.items.length === 0 ? (
              <p className={styles.frDesc}>当前暂无可展示内容，请补充上一阶段输入。</p>
            ) : section.items.map((item, index) => (
              <div key={item.id || `${section.id}-${index}`} className={styles.focusItem}>
                <span className={styles.focusNumber}>{index + 1}</span>
                <div className={styles.focusText}>
                  <strong>{item.title || item.text || item.id}</strong>
                  <p>{item.summary || item.text}</p>
                  {item.level ? <Badge variant={getBadgeVariant(item.level)}>{item.level}</Badge> : null}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <Card className={styles.traceCard}>
        <h3>建议依据与可追溯链</h3>
        <div className={styles.focusList}>
          {(deliverable.traceability || []).map((item, index) => (
            <div key={`${item.controlObjective}-${index}`} className={styles.focusItem}>
              <span className={styles.focusNumber}>{index + 1}</span>
              <div className={styles.focusText}>
                <strong>{item.controlObjective}</strong>
                <p>输入条件：{(item.inputConditions || []).join('；') || '无'}</p>
                <p>风险关注：{(item.riskConcerns || []).join('、') || '无'}</p>
                {viewMode !== 'basic' && <p>对应 FR：{(item.fr || []).join('、') || '无'}</p>}
                {viewMode === 'professional' && <p>设备能力：{(item.capabilityNeeds || []).join('、') || '无'}</p>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className={styles.summaryCard}>
        <h3>{deliverable.disclaimer.title}</h3>
        <p className={styles.frDesc}>{deliverable.disclaimer.text}</p>
      </Card>

      <div className={styles.actions}>
        <Link to="/translation-center">
          <Button variant="ghost" size="large">查看翻译中心</Button>
        </Link>
        <Link to="/integrator">
          <Button variant="primary" size="large">继续到集成商路径</Button>
        </Link>
        <Link to="/report">
          <Button variant="secondary" size="large">查看交付中心</Button>
        </Link>
      </div>
    </div>
  );
}
