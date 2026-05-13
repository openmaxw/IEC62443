import { Link } from 'react-router-dom';
import { Badge, Button, DataTable, NotePanel, SectionBlock } from '../../components/Common';
import styles from './LearningMode.module.css';

const ROLE_CARDS = [
  {
    title: '业主 / 资产所有者',
    standard: 'IEC 62443-2-x 为主，3-2 / 3-3 也必须理解',
    responsibility: '提出业务目标、风险接受原则、目标安全等级、运维约束和验收关注。',
    question: '我有哪些关键系统、外部连接、业务后果和验收风险需要说清楚？'
  },
  {
    title: '系统集成商 / 方案方',
    standard: 'IEC 62443-3-2 / 3-3 与 2-4 为主',
    responsibility: '把业主输入转化为 Zone / Conduit、边界控制、访问控制、审计和能力需求。',
    question: '我的设计如何回应业主风险关注，并证明系统级要求被覆盖？'
  },
  {
    title: '设备商 / 产品供应商',
    standard: 'IEC 62443-4-1 / 4-2 为主',
    responsibility: '声明产品安全能力、证据、适用边界、配置前提、外部依赖和限制条件。',
    question: '产品能满足什么、需要怎样配置、哪些能力依赖集成或补偿？'
  }
];

const STANDARD_SERIES = [
  ['IEC 62443-1-x', '通用', '术语、概念、模型和方法基础。'],
  ['IEC 62443-2-x', '业主 / 运营组织', '网络安全管理系统、补丁管理、运行维护和安全计划。'],
  ['IEC 62443-3-x', '系统与项目', '风险评估、系统安全要求、安全等级、Zone / Conduit。'],
  ['IEC 62443-4-x', '产品与组件', '安全开发生命周期和组件技术安全要求。']
];

const IT_OT_ROWS = [
  ['主要目标', '优先保护数据、业务应用和办公效率。', '优先保护安全生产、连续运行、设备和工艺过程。'],
  ['变化速度', '系统更新、自动化部署和版本迭代相对频繁。', '系统生命周期长，变更必须谨慎评估停机、工艺和安全影响。'],
  ['安全措施', '可较快采用新工具、新代理、新补丁和自动化策略。', '很多控制系统不能随意安装代理、重启、扫描或自动更新，需要通过分区、边界、白名单、受控远程维护、审计和补偿措施保护。'],
  ['风险后果', '主要影响数据泄露、业务中断和合规风险。', '可能影响生产停机、设备损坏、人员安全、环境事件和供应连续性。'],
  ['验证方式', '更容易通过 IT 测试环境、自动化策略和集中管理验证。', '需要结合现场架构、维护窗口、供应商支持、工艺约束和验收边界验证。']
];

const FR_ROWS = [
  ['FR 1', '识别与认证控制', 'IAC', '你是谁？用户、设备和软件实体如何被识别和认证。'],
  ['FR 2', '使用控制', 'UC', '你能做什么？权限、角色、会话和授权如何被控制。'],
  ['FR 3', '系统完整性', 'SI', '有没有被篡改？系统、通信和软件完整性如何被保护。'],
  ['FR 4', '数据机密性', 'DC', '谁能看见？敏感数据传输和存储如何被保护。'],
  ['FR 5', '受限数据流', 'RDF', '数据走哪条路？区域边界、通信路径和网络分段如何受控。'],
  ['FR 6', '事件及时响应', 'TRE', '出事怎么发现和响应？日志、审计、告警和事件记录如何形成。'],
  ['FR 7', '资源可用性', 'RA', '系统能不能持续运行？抗拒绝服务、备份、恢复和资源管理如何保障。']
];

const FR_ALIGNMENT_ROWS = [
  ['FR 1 识别与认证', 'SR 1.x：系统如何识别和认证用户、设备或软件实体。', 'CR 1.x：组件是否支持身份、认证、账号和认证机制。'],
  ['FR 2 使用控制', 'SR 2.x：系统如何控制授权、角色、权限和会话。', 'CR 2.x：组件是否支持授权、权限控制和使用限制。'],
  ['FR 3 系统完整性', 'SR 3.x：系统如何防篡改、验证完整性并保护通信。', 'CR 3.x：组件是否支持完整性保护、恶意代码防护和安全更新相关能力。'],
  ['FR 4 数据机密性', 'SR 4.x：系统如何保护传输和存储中的敏感数据。', 'CR 4.x：组件是否支持保密性保护和相关加密能力。'],
  ['FR 5 受限数据流', 'SR 5.x：系统如何通过区域、管道和边界控制限制数据流。', 'CR 5.x：组件是否支持网络边界、接口和通信流向控制能力。'],
  ['FR 6 事件及时响应', 'SR 6.x：系统如何形成审计、日志、告警和事件响应基础。', 'CR 6.x：组件是否支持事件记录、审计和安全状态输出。'],
  ['FR 7 资源可用性', 'SR 7.x：系统如何维持资源、抗拒绝服务并支持恢复。', 'CR 7.x：组件是否支持可用性、资源管理和抗拒绝服务相关能力。']
];

const SL_ROWS = [
  ['SL 1', '防止偶然或意外违规', '非恶意误用、操作失误、偶发配置问题。'],
  ['SL 2', '抵御使用简单手段的故意违规', '低资源、通用技能、低动机的攻击者。'],
  ['SL 3', '抵御使用复杂手段的故意违规', '中等资源、具备 IACS 专业知识、目标明确的攻击者。'],
  ['SL 4', '抵御高能力攻击者的复杂违规', '扩展资源、高 IACS 专业能力、高动机攻击者。']
];

const CONCEPT_CARDS = [
  { tag: 'FR', title: 'Foundational Requirements', text: '7 大基础安全要求，是系统和组件要求的高层分类。' },
  { tag: 'SR', title: 'System Requirements', text: '系统级要求，主要见于 IEC 62443-3-3，用于描述 IACS 系统应满足什么。' },
  { tag: 'RE', title: 'Requirement Enhancements', text: 'SR 的要求增强，随目标 SL 提高而叠加，不是独立替代项。' },
  { tag: 'CR', title: 'Component Requirements', text: '组件级要求，主要见于 IEC 62443-4-2，用于描述产品/组件应具备什么能力。' },
  { tag: 'SL', title: 'Security Level', text: '安全等级，表达目标对象抵御不同能力攻击者的程度；系统 SL 与组件能力边界不能简单等同。' }
];

const COMPONENT_ROWS = [
  ['EDR', 'Embedded Device Requirements', '嵌入式设备要求', 'PLC、RTU、传感器、执行器等。'],
  ['HDR', 'Host Device Requirements', '主机设备要求', '工业 PC、HMI、工程师站、服务器等。'],
  ['NDR', 'Network Device Requirements', '网络设备要求', '交换机、路由器、防火墙、网关等。'],
  ['SAR', 'Software Application Requirements', '软件应用要求', 'SCADA、配置软件、应用服务等。']
];

const MISCONCEPTIONS = [
  ['4-2 认证设备等于系统满足 3-3', '不准确。4-2 说明组件能力，3-3 关注系统设计、配置、集成和运行条件。'],
  ['系统目标 SL 越高，所有组件都必须机械等同同一 SL', '过度简化。组件能力必须支撑系统要求，但还要结合风险评估、架构、补偿措施和适用边界判断。'],
  ['VPN 有 MFA 就代表远程维护完全满足要求', '不准确。VPN 只是进入路径的一部分，还需要看到达关键系统后的身份、授权、审计、边界和会话控制。'],
  ['设备商只需要懂 4-x，不需要理解 3-3', '不够。设备能力最终要服务系统级需求，设备商需要理解能力如何被集成商用于项目响应。'],
  ['IEC 62443 是一次性认证任务', '不准确。它涉及生命周期、运维、变更、补丁、事件响应和持续改进。']
];

const FLOW_STEPS = ['业主说清业务事实', '形成风险关注与目标', '集成商设计系统响应', '设备商声明能力边界', '三方确认差距与补偿', '沉淀追溯与交付摘要'];

export function LearningMode() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <Badge variant="info" size="large">IEC 62443 简明教程</Badge>
          <h1>用一页看懂 IEC 62443 的角色、要求和对齐逻辑。</h1>
          <p>这页面向业主、集成商和设备商的非专业使用者，重点解释项目早期最容易混淆的概念：谁提出需求、谁设计响应、谁声明能力、差距如何闭环。</p>
        </div>
        <div className={styles.heroActions}>
          <Link to="/owner"><Button variant="primary" size="medium">从需求澄清开始</Button></Link>
          <Link to="/platform-guide"><Button variant="secondary" size="medium">查看平台说明</Button></Link>
        </div>
      </section>

      <section className={styles.article}>
        <SectionBlock title="1. 先记住一句话">
          <blockquote>IEC 62443 不是让某一方单独“拿证”的工具，而是一套让业主、集成商和设备商围绕工业控制系统安全目标进行分工、设计、声明和持续管理的标准体系。</blockquote>
          <div className={styles.flow}>{FLOW_STEPS.map((item) => <span key={item}>{item}</span>)}</div>
        </SectionBlock>

        <SectionBlock title="2. 为什么 IEC 62443 是为 OT / IACS 设计的">
          <p>IEC 62443 面向工业自动化和控制系统（IACS）。这类场景和普通 IT 最大的不同，不是“有没有网络安全”，而是安全措施必须服从生产连续性、现场安全、工艺稳定和长生命周期约束。</p>
          <DataTable><thead><tr><th>维度</th><th>IT 常见特点</th><th>OT / IACS 常见特点</th></tr></thead><tbody>{IT_OT_ROWS.map((row) => <tr key={row[0]}><td><strong>{row[0]}</strong></td><td>{row[1]}</td><td>{row[2]}</td></tr>)}</tbody></DataTable>
          <p className={styles.noteText}>所以 IEC 62443 不只是把 IT 安全工具搬进工厂，而是强调分区分域、边界控制、受控远程访问、补偿措施、生命周期管理和多方责任对齐。</p>
        </SectionBlock>

        <SectionBlock title="3. 三类核心角色如何协作">
          <div className={styles.roleGrid}>{ROLE_CARDS.map((item) => <article key={item.title} className={styles.roleCard}><strong>{item.title}</strong><p className={styles.meta}>{item.standard}</p><p>{item.responsibility}</p><blockquote>{item.question}</blockquote></article>)}</div>
        </SectionBlock>

        <SectionBlock title="4. IEC 62443 标准体系速览">
          <DataTable><thead><tr><th>系列</th><th>主要对象</th><th>简明理解</th></tr></thead><tbody>{STANDARD_SERIES.map((row) => <tr key={row[0]}><td><strong>{row[0]}</strong></td><td>{row[1]}</td><td>{row[2]}</td></tr>)}</tbody></DataTable>
          <p className={styles.noteText}>实际项目中不要机械地把某一系列只交给某一方。IEC 62443 更像一条信任链：业主输入、系统设计、产品能力和运行维护需要相互衔接。</p>
        </SectionBlock>

        <SectionBlock title="5. 七大基础要求 FR：项目讨论的共同语言">
          <DataTable><thead><tr><th>FR</th><th>中文名称</th><th>英文缩写</th><th>非专业理解</th></tr></thead><tbody>{FR_ROWS.map((row) => <tr key={row[0]}><td><span className={styles.tag}>{row[0]}</span></td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td></tr>)}</tbody></DataTable>
        </SectionBlock>

        <SectionBlock title="6. SL 安全等级：不是分数，而是抵御能力目标">
          <DataTable><thead><tr><th>等级</th><th>标准含义</th><th>非专业理解</th></tr></thead><tbody>{SL_ROWS.map((row) => <tr key={row[0]}><td><span className={`${styles.tag} ${styles.slTag}`}>{row[0]}</span></td><td>{row[1]}</td><td>{row[2]}</td></tr>)}</tbody></DataTable>
          <p className={styles.noteText}>更严谨地说，系统安全等级通常应按 FR 分别看待，形成类似 SL 向量的理解；不能简单用一个平均分代表所有安全能力。</p>
        </SectionBlock>

        <SectionBlock title="7. FR / SR / RE / CR / SL 的关系">
          <div className={styles.conceptGrid}>{CONCEPT_CARDS.map((item) => <article key={item.tag} className={styles.conceptCard}><span>{item.tag}</span><strong>{item.title}</strong><p>{item.text}</p></article>)}</div>
          <div className={styles.memoryBanner}>FR 是共同安全领域 · SR 从系统角度展开 · CR 从组件角度支撑 · RE 增强 SR · SL 表达目标强度</div>
          <DataTable><thead><tr><th>共同 FR 领域</th><th>系统侧 SR 怎么看</th><th>组件侧 CR 怎么支撑</th></tr></thead><tbody>{FR_ALIGNMENT_ROWS.map((row) => <tr key={row[0]}><td><strong>{row[0]}</strong></td><td>{row[1]}</td><td>{row[2]}</td></tr>)}</tbody></DataTable>
          <p className={styles.noteText}>这样理解更不容易混淆：SR 和 CR 不是两套互不相干的评判标准，而是在同一组 FR 安全目标下，分别回答“系统应该如何设计”和“组件应该具备什么能力”。</p>
        </SectionBlock>

        <SectionBlock title="8. 组件要求：EDR / HDR / NDR / SAR">
          <DataTable><thead><tr><th>缩写</th><th>英文</th><th>中文</th><th>典型对象</th></tr></thead><tbody>{COMPONENT_ROWS.map((row) => <tr key={row[0]}><td><span className={styles.tag}>{row[0]}</span></td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td></tr>)}</tbody></DataTable>
          <p className={styles.noteText}>组件能力是系统安全的基础之一，但组件证书或功能清单不能自动替代系统级设计、配置、集成、运维和验收。</p>
        </SectionBlock>

        <SectionBlock title="9. 常见误解澄清">
          <div className={styles.misconceptionList}>{MISCONCEPTIONS.map((item) => <article key={item[0]} className={styles.misconceptionCard}><strong>{item[0]}</strong><p>{item[1]}</p></article>)}</div>
        </SectionBlock>

        <SectionBlock title="10. 与本平台的关系">
          <div className={styles.alignmentGrid}>
            <article><strong>业主输入</strong><p>把业务后果、关键资产、外部连接和验收关注说清楚。</p></article>
            <article><strong>设计响应</strong><p>把风险关注转化为 Zone / Conduit、边界控制、访问控制和能力需求。</p></article>
            <article><strong>能力声明</strong><p>把产品能力、证据、适用边界和外部依赖说清楚。</p></article>
            <article><strong>匹配闭环</strong><p>把满足项、部分满足项、差距项、补偿措施和残余风险记录下来。</p></article>
          </div>
        </SectionBlock>

        <NotePanel title="学习边界" notes={["本页是简明培训材料，用于帮助非专业人员建立共同语言，不替代 IEC 62443 标准原文。", "具体项目的目标 SL、系统要求、组件要求和补偿措施需要结合风险评估、现场架构、产品证据和专家复核。", "本平台输出不构成正式认证、合规结论、风险评估结论或工程设计文件。"]} />
      </section>
    </div>
  );
}
