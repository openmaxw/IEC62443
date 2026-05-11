import { Link } from 'react-router-dom';
import { Button, NotePanel, SectionBlock } from '../../components/Common';
import styles from './Landing.module.css';

const FLOW_STEPS = [
  {
    title: '业务输入',
    desc: '把项目场景、关键对象、维护方式、验收关注和业务后果整理成可交接输入。'
  },
  {
    title: '设计响应',
    desc: '把输入翻译为分区、通信、边界控制和能力需求，形成可核对的系统设计依据。'
  },
  {
    title: '能力声明',
    desc: '围绕项目能力需求核对产品声明、证据、依赖条件与适用边界。'
  },
  {
    title: '差距闭环',
    desc: '明确不满足项、补偿措施、责任归属与验收影响，沉淀成可追溯交付结果。'
  }
];

const ROLE_BENEFITS = [
  {
    title: '业主收益',
    points: [
      '把项目输入、关键对象和验收关注整理成可交接依据。',
      '更清楚地看到当前还缺什么、下一步该推进什么。',
      '减少口头沟通和反复确认造成的信息偏差。'
    ]
  },
  {
    title: '集成商收益',
    points: [
      '把需求翻译成分区、通信、边界控制和能力需求。',
      '更容易把设计依据、设备声明和闭环结果串起来。',
      '减少设计、匹配、交付之间的断点。'
    ]
  },
  {
    title: '设备商收益',
    points: [
      '围绕项目要求整理能力声明、证据、依赖与限制说明。',
      '更容易说明哪些能力可满足、哪些需要外部补偿。',
      '减少在项目后期才暴露能力边界的问题。'
    ]
  }
];

const QUICK_START_STEPS = [
  { title: '1. 进入工作台', desc: '点击“进入工作台”，如需快速体验可先加载半导体晶圆厂演示项目。' },
  { title: '2. 按角色查看', desc: '业主看输入与风险翻译，集成商看设计响应，设备商看能力声明。' },
  { title: '3. 审核交付', desc: '审核者从追溯链和交付中心查看差距闭环、IEC 映射和交付摘要。' }
];

export function Landing() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroBadge}>IEC 62443 协同工作台</div>
        <h1>让 IEC 62443 项目协同更清楚。</h1>
        <p className={styles.lead}>
          帮助业主、集成商和设备商在同一套流程里完成输入整理、设计响应、能力核对与闭环交付。
        </p>
        <div className={styles.actions}>
          <Link to="/dashboard"><Button variant="primary" size="medium">进入工作台</Button></Link>
        </div>
      </section>

      <SectionBlock title="主链路">
        <div className={styles.flowGrid}>
          {FLOW_STEPS.map((item) => (
            <article key={item.title} className={styles.flowCard}>
              <strong>{item.title}</strong>
              <p className={styles.flowItem}>{item.desc}</p>
            </article>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock title="3 分钟体验路径">
        <div className={styles.quickStartGrid}>
          {QUICK_START_STEPS.map((item) => (
            <article key={item.title} className={styles.quickStartCard}>
              <strong>{item.title}</strong>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
        <div className={styles.quickStartAction}>
          <Link to="/dashboard"><Button variant="secondary" size="small">从工作台加载演示项目</Button></Link>
        </div>
      </SectionBlock>

      <SectionBlock title="收益">
        <div className={styles.valueList}>
          {ROLE_BENEFITS.map((section) => (
            <article key={section.title} className={styles.valueCard}>
              <strong>{section.title}</strong>
              <div className={styles.pointList}>
                {section.points.map((point) => (
                  <p key={point} className={styles.pointItem}>{point}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </SectionBlock>
      <NotePanel title="首页说明" notes={["首页用于说明系统定位、主链路和价值，不承担项目数据录入任务。", "建议从工作台进入正式协同流程，再根据阶段结果回看追溯链与交付汇总。"]} />
    </div>
  );
}
