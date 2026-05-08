import { Link } from 'react-router-dom';
import { Button } from '../../components/Common';
import styles from './Landing.module.css';

const FLOW_STEPS = [
  {
    title: '输入整理',
    desc: '整理业务目标、风险关注、维护方式和验收重点，形成可交接的项目输入。'
  },
  {
    title: '设计翻译',
    desc: '将输入转化为分区、通信、边界控制和能力需求，形成系统设计依据。'
  },
  {
    title: '能力对齐',
    desc: '围绕项目要求声明产品能力、证据、依赖条件和适用边界。'
  },
  {
    title: '闭环',
    desc: '确认匹配结果、责任归属和补偿路径，沉淀为可追溯的交付结果。'
  }
];

const ROLE_BENEFITS = [
  {
    title: '业主',
    points: [
      '明确需求与验收重点。',
      '输出项目边界与风险关注。',
      '形成可交接的输入依据。'
    ]
  },
  {
    title: '集成商',
    points: [
      '完成分区与通信设计。',
      '形成控制要求与设计依据。',
      '明确实施与交付边界。'
    ]
  },
  {
    title: '设备商',
    points: [
      '声明产品能力与证据。',
      '说明依赖条件与限制。',
      '支撑制造边界设备能力对齐与闭环处置。'
    ]
  }
];

export function Landing() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroBadge}>IEC 62443 项目工作台</div>
        <h1>让 IEC 62443 项目从需求到交付更可追溯。</h1>
        <p className={styles.lead}>
          统一项目输入，沉淀设计依据、能力声明与闭环交付。
        </p>
        <div className={styles.actions}>
          <Link to="/dashboard"><Button variant="primary" size="medium">进入工作台</Button></Link>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <strong>流程</strong>
        </div>
        <div className={styles.flowGrid}>
          {FLOW_STEPS.map((item) => (
            <article key={item.title} className={styles.flowCard}>
              <strong>{item.title}</strong>
              <p className={styles.flowItem}>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <strong>价值</strong>
        </div>
        <div className={styles.valueList}>
          {ROLE_BENEFITS.map((role) => (
            <article key={role.title} className={styles.valueCard}>
              <strong>{role.title}</strong>
              <div className={styles.pointList}>
                {role.points.map((point) => (
                  <p key={point} className={styles.pointItem}>{point}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
