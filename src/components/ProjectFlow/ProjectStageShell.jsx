import { Link } from 'react-router-dom';
import { Badge, Button } from '../Common';
import styles from './ProjectStageShell.module.css';

export function ProjectStageShell({ stageNumber, title, projectName, outputLabel, nextAction, toolbar, statusText, children }) {
  return (
    <div className={styles.page}>
      <section className={styles.toolbarRow}>
        <div className={styles.titleGroup}>
          <Badge variant="primary" size="medium">阶段 {stageNumber}</Badge>
          <strong>{title}</strong>
        </div>
        <div className={styles.actionGroup}>
          {toolbar}
          {nextAction ? <Link to={nextAction.to}><Button variant="primary" size="medium">{nextAction.label}</Button></Link> : null}
        </div>
      </section>
      <section className={styles.statusRow}>
        <span>{projectName || '未命名项目'}</span>
        <span>{outputLabel}</span>
        {statusText ? <span>{statusText}</span> : null}
      </section>
      <section className={styles.body}>{children}</section>
    </div>
  );
}
