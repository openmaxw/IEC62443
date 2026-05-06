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
          <div className={styles.guidanceMeta}>
            <span><strong>填写角色：</strong>{guidance.role}</span>
            <span><strong>使用方式：</strong>{guidance.usage}</span>
          </div>
        </section>
      ) : null}
      <section className={styles.statusRow}>
        <span>{projectName || '未命名项目'}</span>
        <span>{outputLabel}</span>
        {statusText ? <span>{statusText}</span> : null}
      </section>
      <section className={styles.body}>{children}</section>
      {(prevAction || nextAction) ? (
        <section className={styles.navRow}>
          <div className={styles.navActions}>
            {prevAction ? <Link to={prevAction.to}><Button variant="ghost" size="medium">{prevAction.label}</Button></Link> : <span />}
            {nextAction ? <Link to={nextAction.to}><Button variant="primary" size="medium">{nextAction.label}</Button></Link> : <span />}
          </div>
        </section>
      ) : null}
    </div>
  );
}
