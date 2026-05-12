import { Link } from 'react-router-dom';
import { Badge, Button, NotePanel, SectionBlock } from '../../components/Common';
import styles from './LearningMode.module.css';

const SYSTEM_FLOW = ['模糊安全诉求', '需求澄清', '风险关注与要求转译', '设计响应', '能力声明', '匹配闭环', '项目追溯', '交付摘要'];

const PAIN_POINTS = [
  { title: '业主方', points: ['知道需要提升工业网络安全，但难以清晰表达需求。', '不确定哪些业务后果、关键资产和外部连接会影响设计。', '缺少将业务语言转化为 IEC 62443 项目输入的方法。'] },
  { title: '集成商', points: ['客户输入不完整，设计依据不清晰。', '分区、通信和边界控制方案难以追溯到业主需求。', '后续能力匹配、差距闭环和交付摘要难以串联。'] },
  { title: '设备商', points: ['产品能力容易停留在功能罗列，缺少项目语境。', '证据、限制和依赖条件没有提前说明。', '项目后期才发现某些能力需要外部系统或补偿措施。'] }
];

const FEATURE_SECTIONS = [
  { title: '项目总览', route: '/dashboard', value: '让项目团队知道当前走到哪里，还缺什么，下一步做什么。', points: ['查看项目阶段进度', '查看缺失输入和推荐动作', '加载演示项目并进入各阶段页面'] },
  { title: '需求澄清', route: '/owner', value: '将“我想做工业网络安全”转化为后续设计可使用的标准化项目输入。', points: ['填写项目场景、安全担忧和业务后果', '补充维护窗口、关键对象和验收关注', '生成项目输入摘要'] },
  { title: '设计响应', route: '/integrator', value: '让设计不只是经验判断，而是能够解释其来源、依据和响应关系。', points: ['查看业主输入摘要', '形成 Zone / Conduit、通信路径和边界控制', '生成项目级能力需求'] },
  { title: '能力声明', route: '/vendor', value: '让产品安全能力从功能清单变成面向项目需求的能力响应。', points: ['声明产品能力、证据和实现方式', '说明适用边界、依赖条件和限制', '生成能力声明摘要'] },
  { title: '匹配闭环', route: '/selection', value: '提前暴露能力差距，并将差距转化为可讨论、可记录、可交付的处置项。', points: ['查看能力满足情况', '形成待处置差距项', '记录补偿措施、责任方、验收影响和残余风险'] },
  { title: '项目追溯链', route: '/translation-center', value: '让各方看到“为什么有这个设计，为什么需要这个能力，为什么存在这个差距”。', points: ['矩阵展示项目输入、风险、设计、能力和差距', '查看每项能力需求来源', '复核项目逻辑是否连贯'] },
  { title: '交付摘要', route: '/report', value: '将前期沟通过程沉淀为可交接、可复核、可继续推进的阶段性成果。', points: ['汇总项目输入、设计响应、能力声明和闭环结果', '查看 IEC 62443 映射依据', '生成 Markdown 交付摘要'] }
];

const ROLE_VALUES = [
  { title: '销售', value: '把客户模糊的安全意向转化为可推进的项目机会。', points: ['降低客户沟通门槛', '提升售前专业形象', '形成更高质量的商机线索'], sentence: '帮助销售把“客户想做安全”转化为“客户愿意继续讨论的项目机会”。' },
  { title: 'FAE / 方案工程师', value: '将客户输入转化为有依据、可解释、可追溯的设计响应。', points: ['建立需求到设计的追溯链', '提高方案解释效率', '提前识别设计与能力差距'], sentence: '帮助 FAE 把“我建议这样设计”变成“这个设计响应了哪些输入和风险”。' },
  { title: '产品 / 设备团队', value: '将产品安全能力转化为面向项目需求的能力响应和证据表达。', points: ['让产品能力更容易被客户理解', '明确证据、边界和依赖', '反向指导能力资料建设'], sentence: '帮助产品或设备团队把“功能支持”转化为“项目可理解、可验证、可讨论的能力响应”。' },
  { title: '业务负责人 / 管理者', value: '将 IEC 62443 能力沉淀为可复制的业务方法论和跨团队协同工具。', points: ['形成统一的 IEC 62443 沟通入口', '打通集成业务与产品业务', '提升售前和交付标准化程度'], sentence: '帮助组织把 IEC 62443 从个人经验和标准概念，沉淀为可展示、可复用、可协同的业务能力。' }
];

const PROMOTION_TEXT = [
  '这是一个 IEC 62443 项目前期需求转译与对齐平台，用于帮助业主、集成商和设备商在正式评估和工程实施前，先把需求、设计、能力和差距关系说清楚。',
  '它帮助客户把模糊的工业安全诉求，转化为清晰的 IEC 62443 项目响应路径。'
];

export function LearningMode() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <Badge variant="info" size="large">系统平台说明</Badge>
          <h1>IEC 62443 需求转译与对齐平台说明</h1>
          <p>本说明用于帮助不同组织中的销售、方案工程师、产品或设备团队、业务负责人和项目团队理解系统的定位、功能、使用方式和角色价值。</p>
        </div>
        <div className={styles.heroActions}>
          <Link to="/dashboard"><Button variant="primary" size="medium">进入项目总览</Button></Link>
          <Link to="/owner"><Button variant="secondary" size="medium">从需求澄清开始</Button></Link>
        </div>
      </section>

      <section className={styles.article}>
        <SectionBlock title="1. 系统简介">
          <p><strong>IEC 62443 需求转译与对齐平台</strong> 是一个面向工业网络安全项目前期沟通的原型系统。</p>
          <p>它的目标不是替代正式风险评估、合规判定或工程设计审查，而是帮助项目相关方在项目早期先把需求、设计、能力和差距关系说清楚。</p>
          <blockquote>本系统用于将客户模糊的工业安全诉求，转化为标准化项目输入、清晰设计响应、产品能力声明和差距闭环路径。</blockquote>
        </SectionBlock>

        <SectionBlock title="2. 为什么需要这套系统">
          <p>在 IEC 62443 相关项目中，常见问题不是大家完全不知道要做安全，而是各方对“安全需求如何表达、如何设计、如何匹配产品能力”缺少统一语境。</p>
          <div className={styles.cardGrid3}>{PAIN_POINTS.map((item) => <article key={item.title} className={styles.infoCard}><strong>{item.title}</strong><ul>{item.points.map((point) => <li key={point}>{point}</li>)}</ul></article>)}</div>
        </SectionBlock>

        <SectionBlock title="3. 系统核心流程">
          <div className={styles.flow}>{SYSTEM_FLOW.map((item) => <span key={item}>{item}</span>)}</div>
          <p>每一阶段都不是孤立页面，而是为下一阶段提供输入。系统的价值在于把需求澄清、设计响应、能力声明和差距闭环串成一条可追溯路径。</p>
        </SectionBlock>

        <SectionBlock title="4. 系统主要功能">
          <div className={styles.featureList}>{FEATURE_SECTIONS.map((item) => <article key={item.title} className={styles.featureCard}><div><strong>{item.title}</strong><p>{item.value}</p></div><ul>{item.points.map((point) => <li key={point}>{point}</li>)}</ul><Link to={item.route}>打开页面</Link></article>)}</div>
        </SectionBlock>

        <SectionBlock title="5. 对不同角色的价值">
          <div className={styles.roleList}>{ROLE_VALUES.map((item) => <article key={item.title} className={styles.roleCard}><div><strong>{item.title}</strong><p>{item.value}</p></div><ul>{item.points.map((point) => <li key={point}>{point}</li>)}</ul><blockquote>{item.sentence}</blockquote></article>)}</div>
        </SectionBlock>

        <SectionBlock title="6. 对外推广时的推荐表达">
          <div className={styles.quoteList}>{PROMOTION_TEXT.map((item) => <blockquote key={item}>{item}</blockquote>)}</div>
        </SectionBlock>

        <NotePanel title="7. 当前边界" notes={["本系统不替代正式风险评估、认证或合规结论。", "本系统不替代详细工程设计和专家审查。", "演示数据不代表真实产品或项目背书。", "规则、映射和建议需要结合具体项目复核。"]} />
      </section>
    </div>
  );
}
