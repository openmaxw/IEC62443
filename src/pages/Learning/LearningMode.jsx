import { useState } from 'react';
import { Card, Badge } from '../../components/Common';
import { FR_CATEGORIES, SECURITY_LEVELS } from '../../data/rules';
import styles from './LearningMode.module.css';

const TOPICS = [
  { id: 'overview', label: 'IEC 62443 概述' },
  { id: 'roles', label: '三方角色关系' },
  { id: 'fr', label: 'FR 维度解析' },
  { id: 'sl', label: 'SL 安全等级' },
  { id: 'sr', label: 'SR 系统要求' },
  { id: 'zones', label: 'Zone/Conduit' },
  { id: 'maturity', label: '能力成熟度' },
  { id: 'misconceptions', label: '常见误区' }
];

export function LearningMode() {
  const [activeTopic, setActiveTopic] = useState('overview');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>学习模式</h1>
        <p className={styles.subtitle}>边做边学，了解 IEC 62443 核心概念</p>
      </div>

      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.topicList}>
            {TOPICS.map(topic => (
              <button
                key={topic.id}
                className={`${styles.topicButton} ${activeTopic === topic.id ? styles.active : ''}`}
                onClick={() => setActiveTopic(topic.id)}
              >
                {topic.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.main}>
          {activeTopic === 'overview' && <OverviewSection />}
          {activeTopic === 'roles' && <RolesSection />}
          {activeTopic === 'fr' && <FRSection />}
          {activeTopic === 'sl' && <SLSection />}
          {activeTopic === 'sr' && <SRSection />}
          {activeTopic === 'zones' && <ZonesSection />}
          {activeTopic === 'maturity' && <MaturitySection />}
          {activeTopic === 'misconceptions' && <MisconceptionsSection />}
        </main>
      </div>
    </div>
  );
}

function OverviewSection() {
  return (
    <div className={styles.content}>
      <h2>IEC 62443 概述</h2>

      <Card className={styles.conceptCard}>
        <h3>什么是 IEC 62443？</h3>
        <p>
          IEC 62443 是一个专注于工业自动化和控制系统（IACS）安全的国际标准系列。它为业主、集成商和设备商提供了统一的安全框架和方法论。
        </p>
      </Card>

      <Card className={styles.conceptCard}>
        <h3>核心价值：三步翻译</h3>
        <div className={styles.flowDiagram}>
          <div className={styles.flowStep}>
            <span className={styles.stepNum}>1</span>
            <span>业主语言 → 安全目标</span>
          </div>
          <div className={styles.flowArrow}>→</div>
          <div className={styles.flowStep}>
            <span className={styles.stepNum}>2</span>
            <span>安全目标 → 系统规划</span>
          </div>
          <div className={styles.flowArrow}>→</div>
          <div className={styles.flowStep}>
            <span className={styles.stepNum}>3</span>
            <span>系统规划 → 设备能力</span>
          </div>
        </div>
      </Card>

      <Card className={styles.conceptCard}>
        <h3>标准结构</h3>
        <ul className={styles.list}>
          <li><strong>IEC 62443-1-1</strong> - 概念模型和术语</li>
          <li><strong>IEC 62443-2-1</strong> - 安全管理系统要求</li>
          <li><strong>IEC 62443-2-2</strong> - 安全等级提升实施指南</li>
          <li><strong>IEC 62443-2-3</strong> - 资产管理和补丁管理</li>
          <li><strong>IEC 62443-2-4</strong> - 服务提供商安全能力</li>
          <li><strong>IEC 62443-3-3</strong> - 系统要求</li>
          <li><strong>IEC 62443-4-1</strong> - 产品开发安全要求</li>
          <li><strong>IEC 62443-4-2</strong> - 组件安全技术要求</li>
        </ul>
      </Card>
    </div>
  );
}

function RolesSection() {
  return (
    <div className={styles.content}>
      <h2>三方角色关系</h2>

      <Card className={styles.conceptCard}>
        <h3>业主 / 资产所有者</h3>
        <p>定义业务目标和风险偏好，决定系统的安全等级需求。</p>
        <div className={styles.roleResponsibilities}>
          <h4>职责</h4>
          <ul>
            <li>提出业务目标和安全需求</li>
            <li>定义风险偏好和验收标准</li>
            <li>制定安全运维策略</li>
          </ul>
        </div>
        <div className={styles.roleOutput}>
          <h4>输出</h4>
          <Badge variant="primary">安全目标建议</Badge>
          <Badge variant="primary">风险画像</Badge>
          <Badge variant="primary">验收清单</Badge>
        </div>
      </Card>

      <Card className={styles.conceptCard}>
        <h3>集成商 / 方案设计方</h3>
        <p>将业主需求转化为具体的技术方案和系统设计。</p>
        <div className={styles.roleResponsibilities}>
          <h4>职责</h4>
          <ul>
            <li>制定分区分域方案</li>
            <li>设计通信矩阵和安全规则</li>
            <li>提出设备能力需求</li>
          </ul>
        </div>
        <div className={styles.roleOutput}>
          <h4>输出</h4>
          <Badge variant="info">Zone/Conduit 规划</Badge>
          <Badge variant="info">通信矩阵</Badge>
          <Badge variant="info">能力需求清单</Badge>
        </div>
      </Card>

      <Card className={styles.conceptCard}>
        <h3>设备商 / 产品供应商</h3>
        <p>提供符合安全能力要求的产品和解决方案。</p>
        <div className={styles.roleResponsibilities}>
          <h4>职责</h4>
          <ul>
            <li>提供组件安全能力说明</li>
            <li>输出能力证据和认证</li>
            <li>支持项目选型匹配</li>
          </ul>
        </div>
        <div className={styles.roleOutput}>
          <h4>输出</h4>
          <Badge variant="success">能力画像</Badge>
          <Badge variant="success">匹配分析</Badge>
          <Badge variant="success">差距分析</Badge>
        </div>
      </Card>
    </div>
  );
}

function FRSection() {
  return (
    <div className={styles.content}>
      <h2>FR 维度解析</h2>
      <p className={styles.intro}>FR（Fundamental Requirements）是 IEC 62443 的8个核心安全维度。</p>

      <div className={styles.frGrid}>
        {Object.entries(FR_CATEGORIES).map(([fr, info]) => (
          <Card key={fr} className={styles.frCard}>
            <div className={styles.frHeader}>
              <Badge variant="accent">{fr}</Badge>
              <h4>{info.name}</h4>
            </div>
            <p className={styles.frDescription}>{info.description}</p>
            <div className={styles.frSR}>
              <span>相关 SR:</span>
              <div className={styles.srTags}>
                {info.sr.slice(0, 4).map(sr => (
                  <Badge key={sr} variant="default" size="small">{sr}</Badge>
                ))}
                {info.sr.length > 4 && <Badge variant="default" size="small">...</Badge>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SLSection() {
  return (
    <div className={styles.content}>
      <h2>SL 安全等级</h2>
      <p className={styles.intro}>SL（Security Level）定义了4个安全等级，从SL1到SL4应对不同级别的威胁。</p>

      <div className={styles.slGrid}>
        {Object.entries(SECURITY_LEVELS).map(([key, sl]) => (
          <Card key={key} className={styles.slCard}>
            <div className={styles.slLevel}>SL {sl.level}</div>
            <h3>{sl.name}</h3>
            <p className={styles.slDescription}>{sl.description}</p>
            <div className={styles.slTarget}>
              <Badge variant={sl.level >= 3 ? 'danger' : sl.level >= 2 ? 'warning' : 'success'}>
                目标: {sl.target}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      <Card className={styles.conceptCard}>
        <h3>如何选择安全等级？</h3>
        <table className={styles.slTable}>
          <thead>
            <tr>
              <th>业务场景</th>
              <th>建议 SL</th>
              <th>威胁级别</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>普通工业环境，无特殊威胁</td>
              <td>SL 1</td>
              <td>防止意外违规</td>
            </tr>
            <tr>
              <td>有防护意识的攻击者</td>
              <td>SL 2</td>
              <td>防止简单手段攻击</td>
            </tr>
            <tr>
              <td>有资源的攻击者</td>
              <td>SL 3</td>
              <td>防止复杂手段攻击</td>
            </tr>
            <tr>
              <td>高资源攻击者（国家级威胁）</td>
              <td>SL 4</td>
              <td>防止最高级威胁</td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function SRSection() {
  return (
    <div className={styles.content}>
      <h2>SR 系统要求</h2>
      <p className={styles.intro}>SR（System Requirements）是针对每个 FR 维度的具体要求。</p>

      <Card className={styles.conceptCard}>
        <h3>FR1 标识与认证控制 - 核心 SR</h3>
        <ul className={styles.srList}>
          <li><strong>SR1.1</strong> - 基于唯一标识的人员识别</li>
          <li><strong>SR1.2</strong> - 基于唯一标识的设备识别</li>
          <li><strong>SR1.3</strong> - 多因素认证</li>
          <li><strong>SR1.4</strong> - 账户管理</li>
          <li><strong>SR1.5</strong> - 访问策略管理</li>
        </ul>
      </Card>

      <Card className={styles.conceptCard}>
        <h3>FR2 使用控制 - 核心 SR</h3>
        <ul className={styles.srList}>
          <li><strong>SR2.1</strong> - 基于角色的访问控制</li>
          <li><strong>SR2.2</strong> - 最小权限原则</li>
          <li><strong>SR2.3</strong> - 持久的会话策略</li>
          <li><strong>SR2.4</strong> - 权限撤销机制</li>
        </ul>
      </Card>

      <Card className={styles.conceptCard}>
        <h3>FR3 完整性 - 核心 SR</h3>
        <ul className={styles.srList}>
          <li><strong>SR3.1</strong> - 软件和配置完整性</li>
          <li><strong>SR3.2</strong> - 授权用户和软件完整性</li>
          <li><strong>SR3.3</strong> - 固件完整性验证</li>
          <li><strong>SR3.4</strong> - 配置变更审计</li>
        </ul>
      </Card>
    </div>
  );
}

function ZonesSection() {
  return (
    <div className={styles.content}>
      <h2>Zone / Conduit 模型</h2>

      <Card className={styles.conceptCard}>
        <h3>什么是 Zone？</h3>
        <p>Zone（区域）是一个具有共同安全要求的资产集合。Zone 内部共享相同的安全等级，Zone 边界提供访问控制点。</p>
        <div className={styles.keyPoint}>
          <strong>关键概念：</strong>Zone 是逻辑隔离单元，不是物理位置。
        </div>
      </Card>

      <Card className={styles.conceptCard}>
        <h3>什么是 Conduit？</h3>
        <p>Conduit（管道）是 Zone 之间的通信通道。它包含了所有通过 zone 边界的通信路径和网络基础设施。</p>
        <div className={styles.keyPoint}>
          <strong>关键概念：</strong>Conduit 保护 Zone 之间的数据流。
        </div>
      </Card>

      <Card className={styles.conceptCard}>
        <h3>典型 Zone 划分</h3>
        <div className={styles.zoneExample}>
          <div className={styles.zoneBox}>
            <Badge variant="success">企业网络 (SL1)</Badge>
          </div>
          <div className={styles.zoneBox}>
            <Badge variant="info">DMZ (SL2)</Badge>
          </div>
          <div className={styles.zoneBox}>
            <Badge variant="info">OT网络 (SL2)</Badge>
          </div>
          <div className={styles.zoneBox}>
            <Badge variant="warning">单元区域 (SL3)</Badge>
          </div>
          <div className={styles.zoneBox}>
            <Badge variant="danger">安全系统 (SL4)</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}

function MaturitySection() {
  return (
    <div className={styles.content}>
      <h2>能力成熟度模型</h2>

      <Card className={styles.conceptCard}>
        <h3>为什么需要成熟度评估？</h3>
        <p>同一安全能力可能有不同的实现深度。成熟度模型帮助我们评估能力是否"足够"。</p>
      </Card>

      <div className={styles.maturityGrid}>
        {[
          { level: 1, name: '基础', description: '具备基本能力，满足最低要求', color: 'default' },
          { level: 2, name: '标准', description: '符合行业标准和最佳实践', color: 'info' },
          { level: 3, name: '高级', description: '增强型安全功能，主动防护', color: 'warning' },
          { level: 4, name: '卓越', description: '最高等级安全能力，全面防护', color: 'danger' }
        ].map(m => (
          <Card key={m.level} className={styles.maturityCard}>
            <div className={styles.maturityLevel} data-level={m.level}>
              L{m.level}
            </div>
            <h4>{m.name}</h4>
            <p>{m.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MisconceptionsSection() {
  return (
    <div className={styles.content}>
      <h2>常见误区</h2>

      <div className={styles.misconceptionList}>
        <Card className={styles.misconceptionCard}>
          <h3>误区 1：SL 等级越高越好</h3>
          <p><strong>真相：</strong>SL 等级应根据实际威胁等级选择。过高的 SL 会显著增加成本和复杂性。</p>
          <p><strong>正确做法：</strong>评估实际威胁，选择"够用"的 SL。</p>
        </Card>

        <Card className={styles.misconceptionCard}>
          <h3>误区 2：有了防火墙就安全了</h3>
          <p><strong>真相：</strong>防火墙只是纵深防御的一层。单一防护无法应对内部威胁和高级攻击。</p>
          <p><strong>正确做法：</strong>建立多层次安全架构。</p>
        </Card>

        <Card className={styles.misconceptionCard}>
          <h3>误区 3：PLC 直接连到企业网络没问题</h3>
          <p><strong>真相：</strong>这是最常见的安全隐患。IT/OT 混合网络会引入大量攻击面。</p>
          <p><strong>正确做法：</strong>实施 IT/OT 隔离，使用 DMZ 进行安全互联。</p>
        </Card>

        <Card className={styles.misconceptionCard}>
          <h3>误区 4：安全设备买来就安全了</h3>
          <p><strong>真相：</strong>安全产品需要正确配置和维护才能发挥作用。</p>
          <p><strong>正确做法：</strong>制定安全运维规程，持续监控和更新。</p>
        </Card>

        <Card className={styles.misconceptionCard}>
          <h3>误区 5：老系统无法升级安全</h3>
          <p><strong>真相：</strong>可以通过网络分段、监控和加固降低风险。</p>
          <p><strong>正确做法：</strong>采用补偿性控制措施，逐步升级。</p>
        </Card>
      </div>
    </div>
  );
}
