import { Link } from 'react-router-dom';
import { Card, Badge, Button } from '../../components/Common';
import { FR_CATEGORIES, SECURITY_LEVELS } from '../../data/rules';
import styles from './LearningMode.module.css';

const ENTRY_POINTS = [
  { title: '看不懂 Zone / Conduit？', desc: '适合在集成设计阶段快速补概念。', to: '/integrator' },
  { title: '看不懂 FR / SL？', desc: '适合理解风险翻译和要求分配。', to: '/translation-center' },
  { title: '看不懂闭环？', desc: '适合在匹配结果和补偿措施阶段查看。', to: '/selection' }
];

export function LearningMode() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <Badge variant="info" size="large">学习模式</Badge>
          <h1>只保留项目里最常碰到的 IEC 62443 关键词。</h1>
          <p>它是主流程的辅助解释层，不替代项目工作流本身。</p>
        </div>
      </section>

      <Card title="从主流程进入学习">
        <div className={styles.entryGrid}>
          {ENTRY_POINTS.map((item) => (
            <div key={item.title} className={styles.note}>
              <strong>{item.title}</strong>
              <span>{item.desc}</span>
              <Link to={item.to}><Button variant="secondary" size="small">返回对应阶段</Button></Link>
            </div>
          ))}
        </div>
      </Card>

      <Card title="FR 七大类">
        <div className={styles.grid}>
          {Object.entries(FR_CATEGORIES).map(([code, item]) => (
            <div key={code} className={styles.note}><strong>{code}</strong><span>{item.name}</span><p>{item.description}</p></div>
          ))}
        </div>
      </Card>

      <Card title="SL 1-4">
        <div className={styles.grid}>
          {Object.entries(SECURITY_LEVELS).map(([key, item]) => (
            <div key={key} className={styles.note}><strong>{key}</strong><span>{item.name}</span><p>{item.target}</p></div>
          ))}
        </div>
      </Card>
    </div>
  );
}
