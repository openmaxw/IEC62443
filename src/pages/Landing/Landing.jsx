import { Link } from 'react-router-dom';
import { Button, NotePanel, SectionBlock } from '../../components/Common';
import styles from './Landing.module.css';

const PAIN_POINTS = [
  {
    title: '业主方',
    desc: '知道需要提升工业网络安全，但难以将业务场景、关键资产、安全担忧和验收关注表达为 IEC 62443 项目输入。'
  },
  {
    title: '集成商',
    desc: '需要开展分区、边界、通信路径和访问控制设计，但缺少清晰、可追溯的需求依据。'
  },
  {
    title: '设备商',
    desc: '具备产品安全能力、证据和限制条件，但难以判断这些能力如何对应具体项目需求。'
  }
];

const FLOW_STEPS = [
  {
    title: '模糊安全诉求',
    desc: '从业务场景、运行约束、安全担忧和验收关注开始，而不是直接套用标准条文。'
  },
  {
    title: '标准化项目输入',
    desc: '整理关键对象、维护方式、业务影响和初始边界，形成可用于讨论的项目输入。'
  },
  {
    title: '设计响应路径',
    desc: '将输入转化为风险关注、Zone / Conduit、通信路径、边界控制和能力需求。'
  },
  {
    title: '能力匹配与闭环',
    desc: '引导设备商声明能力、证据、依赖与限制，并识别差距、补偿措施和责任归属。'
  }
];

const ROLE_BENEFITS = [
  {
    title: '业主方：形成标准化项目输入',
    points: [
      '将业务场景、关键资产、安全担忧和验收关注整理为结构化输入。',
      '理解自身诉求在 IEC 62443 项目语境下应如何表达。',
      '为后续评估、方案讨论和工程合作建立清晰起点。'
    ]
  },
  {
    title: '集成商：形成有依据的设计响应',
    points: [
      '基于业主输入形成分区、边界、通信和访问控制设计依据。',
      '说明设计如何响应风险关注和项目约束。',
      '减少凭经验设计但难以解释依据的问题。'
    ]
  },
  {
    title: '设备商：形成面向项目的能力声明',
    points: [
      '将产品能力、证据材料、适用边界和外部依赖映射到项目需求。',
      '说明哪些能力可满足，哪些需要系统集成或补偿措施。',
      '降低项目后期才暴露能力边界的风险。'
    ]
  }
];

const OUTCOMES = [
  '一份更清晰的业主项目输入',
  '一组可解释的风险关注与设计响应方向',
  '一套设备能力与项目需求的匹配视图',
  '一份差距、补偿措施和责任归属清单',
  '一份可用于后续评审、方案深化和合作沟通的交付摘要'
];

const QUICK_START_STEPS = [
  { title: '1. 进入项目总览', desc: '从统一项目状态查看当前阶段、缺失输入和建议动作。' },
  { title: '2. 走完响应链路', desc: '依次查看需求澄清、设计响应、能力声明、匹配闭环和交付摘要。' },
  { title: '3. 建立共同语境', desc: '通过追溯链理解输入、风险、设计、能力和差距之间的对应关系。' }
];

export function Landing() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroBadge}>IEC 62443 需求澄清与响应工作台</div>
        <h1>将模糊安全诉求转化为标准化项目输入与清晰响应路径。</h1>
        <p className={styles.lead}>
          面向 IEC 62443 项目前期沟通场景，帮助业主从业务场景、安全担忧和验收关注出发，形成结构化项目输入，并引导集成商与设备商基于同一上下文完成设计响应、能力声明、差距识别与交付准备。
        </p>
        <div className={styles.actions}>
          <Link to="/dashboard"><Button variant="primary" size="medium">进入项目总览</Button></Link>
          <Link to="/learning"><Button variant="secondary" size="medium">查看使用手册</Button></Link>
        </div>
      </section>

      <SectionBlock title="当安全诉求还停留在模糊概念时">
        <div className={styles.painGrid}>
          {PAIN_POINTS.map((item) => (
            <article key={item.title} className={styles.painCard}>
              <strong>{item.title}</strong>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock title="从需求澄清到响应闭环">
        <div className={styles.flowGrid}>
          {FLOW_STEPS.map((item) => (
            <article key={item.title} className={styles.flowCard}>
              <strong>{item.title}</strong>
              <p className={styles.flowItem}>{item.desc}</p>
            </article>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock title="让各方知道应表达什么、响应什么、交付什么">
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

      <SectionBlock title="完成一次流程后可以获得什么">
        <div className={styles.outcomeGrid}>
          {OUTCOMES.map((item) => <div key={item} className={styles.outcomeItem}>{item}</div>)}
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
          <Link to="/dashboard"><Button variant="secondary" size="small">从项目总览加载演示项目</Button></Link>
        </div>
      </SectionBlock>

      <NotePanel title="系统边界" notes={["本工作台是 IEC 62443 项目前期需求澄清与响应演示原型，用于帮助项目相关方建立共同语言、理解响应逻辑和识别后续工作方向。", "系统输出不构成正式风险评估、认证结论、合规判定或工程设计文件，具体项目仍需结合现场条件、专家评审和正式工程流程进一步确认。"]} />
    </div>
  );
}
