import { Link } from 'react-router-dom';
import { Badge, Button } from '../Common';
import styles from './ProjectStageShell.module.css';

export function ProjectStageShell({
  stageNumber,
  title,
  projectName,
  outputLabel,
  toolbar,
  statusText,
  statusPanel,
  prevAction,
  nextAction,
  guidance,
  children
}) {
  return (
    <div className={styles.page}>
      <section className={styles.toolbarRow}>
        <div className={styles.titleGroup}>
          <Badge variant="primary" size="medium">阶段 {stageNumber}</Badge>
          <strong>{title}</strong>
        </div>
        <div className={styles.actionGroup}>
          {toolbar}
        </div>
      </section>
      {guidance ? (
        <section className={styles.guidanceRow}>
          <p>{guidance.summary}</p>
        </section>
      ) : null}
      <section className={styles.statusPanel}>
        <div className={styles.statusSummary}>
          <div className={styles.statusItem}>
            <span>项目</span>
            <strong>{projectName || '未命名项目'}</strong>
          </div>
          <div className={styles.statusItem}>
            <span>当前输出</span>
            <strong>{outputLabel}</strong>
          </div>
          {statusText ? (
            <div className={styles.statusItem}>
              <span>当前状态</span>
              <strong>{statusText}</strong>
            </div>
          ) : null}
        </div>
        {statusPanel ? <div className={styles.statusAside}>{statusPanel}</div> : null}
      </section>
      <section className={styles.body}>{children}</section>
      {(prevAction || nextAction) ? (
        <section className={styles.navRow}>
          <div className={styles.navActions}>
            {prevAction ? <Link to={prevAction.to}><Button variant="ghost" size="medium">{prevAction.label}</Button></Link> : null}
            {nextAction ? <Link to={nextAction.to}><Button variant="primary" size="medium">{nextAction.label}</Button></Link> : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
