import { Card, Badge } from '../../components/Common';
import { FR_CATEGORIES, SECURITY_LEVELS } from '../../data/rules';
import styles from './LearningMode.module.css';

export function LearningMode() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <Badge variant="info" size="large">学习模式</Badge>
          <h1>只保留最该知道的 IEC 62443 关键词。</h1>
          <p>目标不是背标准条文，而是快速理解项目里最常出现的概念。</p>
        </div>
      </section>

      <Card title="FR 七大类" subtitle="这是系统翻译时最常用的专业语言。">
        <div className={styles.grid}>
          {Object.entries(FR_CATEGORIES).map(([code, item]) => (
            <div key={code} className={styles.note}><strong>{code}</strong><span>{item.name}</span><p>{item.description}</p></div>
          ))}
        </div>
      </Card>

      <Card title="SL 1-4" subtitle="不是越高越好，而是与后果和场景匹配。">
        <div className={styles.grid}>
          {Object.entries(SECURITY_LEVELS).map(([key, item]) => (
            <div key={key} className={styles.note}><strong>{key}</strong><span>{item.name}</span><p>{item.target}</p></div>
          ))}
        </div>
      </Card>
    </div>
  );
}
