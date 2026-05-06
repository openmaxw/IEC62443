import { Link } from 'react-router-dom';
import { Button } from '../../components/Common';
import styles from './Landing.module.css';

const ROLE_BENEFITS = [
  {
    title: '业主收益',
    points: [
      '快速梳理项目目标、需求边界与风险重点。',
      '降低前期信息缺失和沟通偏差带来的不确定性。',
      '更高效地形成可执行、可交付的项目输入。'
    ]
  },
  {
    title: '集成商收益',
    points: [
      '基于统一输入开展方案设计，减少反复澄清。',
      '更准确地对齐需求、约束条件与实施边界。',
      '提升设计过程与最终交付结果的一致性。'
    ]
  },
  {
    title: '设备商收益',
    points: [
      '按统一框架表达产品能力、适配范围与限制条件。',
      '减少能力描述差异带来的理解偏差和沟通成本。',
      '更顺畅地参与差距分析、方案比较与项目选型。'
    ]
  }
];

export function Landing() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>让 IEC 62443 项目协同更清晰。</h1>
        <p className={styles.lead}>
          这是一个面向业主、集成商、设备商的 IEC 62443 协同系统，以统一项目上下文串联需求整理、方案设计、能力声明与差距分析，帮助项目更快对齐目标、更高效推进实施、更完整沉淀交付成果。
        </p>
        <div className={styles.actions}>
          <Link to="/project"><Button variant="primary" size="medium">进入项目</Button></Link>
        </div>
      </section>

      <section className={styles.valueSection}>
        <div className={styles.valueList}>
          {ROLE_BENEFITS.map((role) => (
            <article key={role.title} className={styles.valueCard}>
              <strong>{role.title}</strong>
              <div className={styles.pointList}>
                {role.points.map((point) => (
                  <p key={point}>{point}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
