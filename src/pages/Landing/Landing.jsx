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
    title: '差距闭环',
    desc: '识别差距、责任归属和补偿路径，沉淀为可追溯的交付结果。'
  }
];

const ROLE_BENEFITS = [
  {
    title: '业主',
    points: [
      '整理业务目标、风险关注与验收重点。',
      '输出可交接的需求与项目边界输入。',
      '为设计、采购和验收建立统一依据。'
    ]
  },
  {
    title: '集成商',
    points: [
      '基于统一输入完成系统分区与通信设计。',
      '形成边界控制建议与能力需求矩阵。',
      '明确设计依据、风险保留与交付边界。'
    ]
  },
  {
    title: '设备商',
    points: [
      '按项目要求声明产品能力、证据与限制。',
      '参与需求匹配、差距识别和责任划分。',
      '为选型决策和闭环措施提供依据。'
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
          面向业主、集成商与设备商的项目工作台。统一整理输入，形成设计依据和能力要求，完成差距识别与闭环交付。
        </p>
        <div className={styles.actions}>
          <Link to="/dashboard"><Button variant="primary" size="medium">进入工作台</Button></Link>
          <Link to="/owner"><Button variant="secondary" size="medium">从项目输入开始</Button></Link>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <strong>主流程</strong>
          <p>把项目输入、系统设计、能力声明和差距闭环串成一条连续链路。</p>
        </div>
        <div className={styles.flowGrid}>
          {FLOW_STEPS.map((item) => (
            <article key={item.title} className={styles.flowCard}>
              <strong>{item.title}</strong>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <strong>角色价值</strong>
          <p>不同角色在同一项目语境下协作，但输出都进入统一的交付与追溯链。</p>
        </div>
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
