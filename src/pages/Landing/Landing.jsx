import { Link } from 'react-router-dom';
import { Button, NotePanel } from '../../components/Common';
import styles from './Landing.module.css';

const SECTIONS = [
  {
    tone: 'orange',
    title: '项目前期协同断点',
    cards: [
      { title: '业主方', points: ['安全目标仍停留在“想加强防护”的模糊表述', '关键资产、外部连接和维护边界尚未形成项目输入', '验收关注难以转化为集成商可响应的设计依据'] },
      { title: '集成商', points: ['客户需求缺少结构化背景，方案起点不清晰', '分区、通信和边界控制难以回溯到业务风险', '设计说明依赖经验表达，缺少可交接依据'] },
      { title: '设备商', points: ['产品安全能力难以对应具体项目要求', '证据类型、适用边界和限制条件表达分散', '外部系统依赖和补偿条件容易在后期才暴露'] }
    ]
  },
  {
    tone: 'green',
    title: '问题转化机制',
    cards: [
      { title: '需求转译', points: ['从业务后果和运行约束识别安全关注', '将模糊诉求转化为 IEC 62443 项目语言', '把讨论结果沉淀为后续设计可使用的输入'] },
      { title: '响应建模', points: ['把风险关注映射到分区、通信和边界控制', '将设计响应进一步转化为项目级能力需求', '让方案说明具备可解释、可追溯的依据链'] },
      { title: '差距闭环', points: ['识别满足、部分满足、不满足和外部依赖项', '将能力差距转化为补偿措施和责任分工', '明确验收影响和残余风险，支撑后续决策'] }
    ]
  },
  {
    tone: 'blue',
    title: '阶段成果输出',
    cards: [
      { title: '标准化项目输入', points: ['形成可交接的业务场景、关键对象和外部连接描述', '沉淀安全担忧、业务后果和验收关注', '为后续设计响应提供统一输入口径'] },
      { title: '响应与匹配结果', points: ['输出分区、通信、边界控制和能力需求摘要', '形成产品能力、证据、依赖和限制声明', '生成项目需求与设备能力的匹配视图'] },
      { title: '追溯与交付材料', points: ['生成输入、风险、设计、能力和差距的追溯矩阵', '记录补偿措施、责任方、验收影响和残余风险', '输出可用于后续评审和沟通的 Markdown 交付摘要'] }
    ]
  },
  {
    tone: 'purple',
    title: '三方对齐价值',
    cards: [
      { title: '业主方', points: ['把业务场景、关键系统和外部连接说清楚', '把安全担忧、业务后果和验收关注沉淀为项目输入', '减少“想做安全但说不清楚”的沟通损耗'] },
      { title: '集成商', points: ['基于项目输入形成更清晰的设计依据', '用追溯链解释方案如何响应风险关注', '提前识别输入缺口、能力边界和补偿需求'] },
      { title: '设备商', points: ['将产品能力转化为面向项目的能力声明', '明确证据类型、适用边界和外部依赖', '避免产品能力在项目语境中被误读或过度承诺'] }
    ]
  }
];

function SummaryCard({ item }) {
  return (
    <article className={styles.summaryCard}>
      <strong>{item.title}</strong>
      <div className={styles.pointList}>
        {item.points.map((point) => <p key={point}>{point}</p>)}
      </div>
    </article>
  );
}

export function Landing() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroBadge}>IEC 62443 需求转译与对齐平台</div>
        <h1>将模糊的工业安全诉求转化为可响应、可追溯的项目语言。</h1>
        <p className={styles.lead}>面向 IEC 62443 项目前期沟通，帮助业主、集成商与设备商对齐需求输入、设计响应、设备能力与差距闭环。</p>
        <div className={styles.actions}>
          <Link to="/dashboard"><Button variant="primary" size="medium">进入项目总览</Button></Link>
          <Link to="/learning"><Button variant="secondary" size="medium">IEC62443简明教程</Button></Link>
          <Link to="/platform-guide"><Button variant="secondary" size="medium">查看平台说明</Button></Link>
        </div>
      </section>

      {SECTIONS.map((section) => (
        <section key={section.title} className={`${styles.topicSection} ${styles[section.tone]}`}>
          <div className={styles.topicHead}><strong>{section.title}</strong></div>
          <div className={styles.summaryGrid}>{section.cards.map((item) => <SummaryCard key={item.title} item={item} />)}</div>
        </section>
      ))}

      <NotePanel title="系统边界" notes={["本工作台是 IEC 62443 项目前期需求转译与对齐演示原型。", "系统输出不构成正式风险评估、认证结论、合规判定或工程设计文件。"]} />
    </div>
  );
}
