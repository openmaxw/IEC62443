import { Link } from 'react-router-dom';
import { Badge, Button, NotePanel, SectionBlock } from '../../components/Common';
import { FR_CATEGORIES, SECURITY_LEVELS } from '../../data/rules';
import styles from './LearningMode.module.css';

const PATHS = [
  {
    title: '快速体验路径',
    desc: '适合第一次了解系统。先加载演示项目，再查看项目总览、追溯矩阵和交付摘要。',
    steps: ['进入项目总览', '加载演示项目', '查看项目追溯链', '查看交付摘要'],
    to: '/dashboard'
  },
  {
    title: '正式澄清路径',
    desc: '适合从模糊安全诉求开始，逐步形成项目输入、设计响应和能力匹配。',
    steps: ['需求澄清', '设计响应', '能力声明', '匹配闭环', '交付摘要'],
    to: '/owner'
  },
  {
    title: '复核评审路径',
    desc: '适合项目负责人、顾问或评审者检查输入、设计、能力和差距是否对齐。',
    steps: ['项目追溯链', '匹配闭环', '交付摘要'],
    to: '/translation-center'
  }
];

const PAGE_GUIDES = [
  { title: '项目总览', route: '/dashboard', desc: '查看当前项目进度、缺失输入、推荐下一步和各阶段完成情况。' },
  { title: '需求澄清', route: '/owner', desc: '业主方填写业务场景、安全担忧、关键对象、运行约束和验收关注。' },
  { title: '项目输入摘要', route: '/owner/result', desc: '将需求澄清结果整理成后续设计响应可使用的标准化项目输入。' },
  { title: '设计响应', route: '/integrator', desc: '集成商基于项目输入形成分区、通信、边界控制和能力需求草案。' },
  { title: '设计响应摘要', route: '/integrator/result', desc: '查看设计响应结果、设计依据、能力需求和需求—设计对应关系。' },
  { title: '能力声明', route: '/vendor', desc: '设备商声明产品能力、证据类型、适用边界、依赖条件和限制说明。' },
  { title: '能力声明摘要', route: '/vendor/result', desc: '查看产品能力如何响应项目需求，以及哪些项需要外部补偿或条件确认。' },
  { title: '匹配闭环', route: '/selection', desc: '查看能力满足情况、待处置差距，并记录补偿措施、责任方、验收影响和残余风险。' },
  { title: '项目追溯链', route: '/translation-center', desc: '用矩阵查看项目输入、风险关注、设计响应、能力需求和差距状态之间的对应关系。' },
  { title: '交付摘要', route: '/report', desc: '汇总阶段成果、闭环状态和 IEC 62443 映射依据，并生成 Markdown 摘要。' }
];

const ROLE_GUIDES = [
  { title: '业主方', points: ['重点使用需求澄清和项目输入摘要。', '关注业务后果、关键资产、外部连接和验收关注是否表达清楚。', '通过交付摘要理解后续合作需要补充哪些信息。'] },
  { title: '集成商', points: ['重点使用设计响应、项目追溯链和匹配闭环。', '关注设计依据是否来自明确项目输入。', '检查分区、通信、边界控制和能力需求是否可解释。'] },
  { title: '设备商', points: ['重点使用能力声明和能力声明摘要。', '关注产品能力、证据、依赖和限制是否对应项目需求。', '提前说明需要系统集成或外部补偿的能力边界。'] },
  { title: '项目负责人 / 顾问', points: ['重点使用项目总览、项目追溯链和交付摘要。', '复核多方输入是否处在同一上下文。', '识别后续评估、方案深化和工程实施的工作重点。'] }
];

const OUTPUTS = [
  '标准化项目输入',
  '设计响应摘要',
  '能力声明摘要',
  '匹配闭环记录',
  '项目追溯矩阵',
  'Markdown 交付摘要'
];

export function LearningMode() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <Badge variant="info" size="large">系统使用手册</Badge>
          <h1>了解每个页面的用途，以及不同角色应该如何使用。</h1>
          <p>本手册用于帮助有工业安全需求但概念尚不清晰的用户，理解如何通过本系统完成需求澄清、设计响应、能力声明、匹配闭环和交付摘要。</p>
        </div>
        <div className={styles.heroActions}>
          <Link to="/dashboard"><Button variant="primary" size="medium">进入项目总览</Button></Link>
          <Link to="/owner"><Button variant="secondary" size="medium">从需求澄清开始</Button></Link>
        </div>
      </section>

      <SectionBlock title="推荐使用路径">
        <div className={styles.pathGrid}>
          {PATHS.map((item) => (
            <article key={item.title} className={styles.pathCard}>
              <strong>{item.title}</strong>
              <p>{item.desc}</p>
              <div className={styles.stepList}>{item.steps.map((step) => <span key={step}>{step}</span>)}</div>
              <Link to={item.to}><Button variant="secondary" size="small">进入路径</Button></Link>
            </article>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock title="页面功能说明">
        <div className={styles.pageGuideGrid}>
          {PAGE_GUIDES.map((item) => (
            <article key={item.title} className={styles.pageGuideCard}>
              <strong>{item.title}</strong>
              <p>{item.desc}</p>
              <Link to={item.route}>打开页面</Link>
            </article>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock title="不同角色怎么用">
        <div className={styles.roleGrid}>
          {ROLE_GUIDES.map((item) => (
            <article key={item.title} className={styles.roleCard}>
              <strong>{item.title}</strong>
              <ul>{item.points.map((point) => <li key={point}>{point}</li>)}</ul>
            </article>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock title="走完流程后可以形成什么">
        <div className={styles.outputGrid}>{OUTPUTS.map((item) => <div key={item} className={styles.outputItem}>{item}</div>)}</div>
      </SectionBlock>

      <SectionBlock title="术语速查：FR 七大类">
        <div className={styles.grid}>
          {Object.entries(FR_CATEGORIES).map(([code, item]) => (
            <div key={code} className={styles.note}><strong>{code}</strong><span>{item.name}</span><p>{item.description}</p></div>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock title="术语速查：SL 1-4">
        <div className={styles.grid}>
          {Object.entries(SECURITY_LEVELS).map(([key, item]) => (
            <div key={key} className={styles.note}><strong>{key}</strong><span>{item.name}</span><p>{item.target}</p></div>
          ))}
        </div>
      </SectionBlock>
      <NotePanel title="使用边界" notes={["本系统是需求澄清与响应原型，不是正式风险评估、认证判定或工程设计审查工具。", "页面输出可用于前期沟通、方案深化和后续合作准备，具体项目仍需结合现场条件和专家评审确认。"]} />
    </div>
  );
}
