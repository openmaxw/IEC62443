import { Link } from 'react-router-dom';
import { Button, Badge, Card } from '../../components/Common';
import { useOwnerPath, useIntegratorPath, useVendorPath, useProject, useProjectStatus } from '../../hooks/useProject';
import styles from './Dashboard.module.css';

const STAGE_LABELS = {
  project: '项目建立',
  owner: '业主输入',
  integrator: '集成设计',
  vendor: '设备声明',
  selection: '差距分析',
  report: '交付汇总'
};

export function Dashboard() {
  const { state, actions } = useProject();
  const { projectMeta, assessment, riskProfile } = useOwnerPath();
  const { plan } = useIntegratorPath();
  const { capabilities, matchResults } = useVendorPath();
  const { progress, missingInputs, nextAction } = useProjectStatus();

  const handleReset = () => {
    if (window.confirm('初始化后将清空当前项目及后续流程的全部已填写信息，是否继续？')) {
      actions.resetProject();
    }
  };

  const handleLoadDemo = () => {
    if (window.confirm('将加载一套完整演示数据，用于快速检查各页面功能。是否继续？')) {
      actions.loadDemoProject();
    }
  };

  const cards = [
    {
      id: 'owner',
      title: '业主输入',
      ready: progress.stageStatus.owner,
      detail: assessment ? `已形成风险与业务输入摘要${riskProfile ? '，可交接给集成商' : ''}` : '待完成项目场景、后果、约束输入',
      route: progress.stageStatus.owner ? '/owner/result' : '/owner'
    },
    {
      id: 'integrator',
      title: '集成设计',
      ready: progress.stageStatus.integrator,
      detail: plan ? `已形成 ${plan.zones?.length || 0} 个 zone、${plan.communicationFlows?.length || 0} 条通信流` : '待完成 Zone / Conduit 与通信设计',
      route: progress.stageStatus.integrator ? '/integrator/result' : '/integrator'
    },
    {
      id: 'vendor',
      title: '设备声明',
      ready: progress.stageStatus.vendor,
      detail: capabilities.length ? `已录入 ${capabilities.length} 份能力声明` : '待录入产品能力、边界与证据',
      route: progress.stageStatus.vendor ? '/vendor/result' : '/vendor'
    },
    {
      id: 'selection',
      title: '差距分析',
      ready: progress.stageStatus.selection,
      detail: matchResults?.results?.length ? `已生成 ${matchResults.results.length} 条匹配分析结果` : '待完成要求-能力差距分析',
      route: '/selection'
    }
  ];

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <Badge variant="primary" size="medium">项目工作台</Badge>
          <h1>{projectMeta.projectName || '当前项目'}</h1>
          <p>
            {[projectMeta.organizationName, projectMeta.siteName, projectMeta.industry, projectMeta.scenarioType].filter(Boolean).join(' / ') || '先从业主步骤 01 填写项目场景与基础信息，再按阶段推进 IEC 62443 协同工作流。'}
          </p>
        </div>
        <div className={styles.heroAction}>
          <div className={styles.progressValue}>{progress.percentage}%</div>
          <div className={styles.progressText}>已完成 {progress.completed} / {progress.total} 个阶段</div>
          <Link to={nextAction.route}><Button variant="primary" size="medium">继续：{nextAction.label}</Button></Link>
        </div>
      </section>

      <section className={styles.grid}>
        <Card title="快速开始" description="从这里初始化项目，或一键加载演示数据查看完整链路。">
          <div className={styles.nextActionCard}>
            <strong>{state.projectMeta?.projectName ? '当前已存在项目数据' : '当前尚未初始化项目数据'}</strong>
            <span>建议先进入业主步骤 01 填写项目基础信息与项目场景（现已并入业主页）；如需快速查看流程，可先加载演示数据。</span>
            <div className={styles.inlineActions}>
              <Button variant="secondary" size="small" onClick={handleLoadDemo}>加载演示数据</Button>
              <Button variant="ghost" size="small" onClick={handleReset}>初始化</Button>
            </div>
          </div>
        </Card>

        <Card title="下一步建议" description="优先引导到最值得继续推进的页面。">
          <div className={styles.nextActionCard}>
            <strong>{nextAction.label}</strong>
            <span>建议继续前往 `{nextAction.route}` 完成当前阶段任务。</span>
            <Link to={nextAction.route}><Button variant="secondary" size="small">前往处理</Button></Link>
          </div>
        </Card>
      </section>

      <section className={styles.progressSection}>
        {progress.stages.map((stage) => (
          <div key={stage.id} className={`${styles.stageItem} ${progress.stageStatus[stage.id] ? styles.stageDone : ''}`}>
            <span>{STAGE_LABELS[stage.id]}</span>
            <strong>{progress.stageStatus[stage.id] ? '已完成' : '待推进'}</strong>
          </div>
        ))}
      </section>

      <section className={styles.grid}>
        <Card title="缺失输入" description="系统根据当前项目状态判断接下来需要补齐的内容。">
          <div className={styles.listBlock}>
            {missingInputs.length ? missingInputs.map((item) => (
              <Link key={item.id} to={item.route} className={styles.linkRow}>{item.label}</Link>
            )) : <div className={styles.empty}>当前关键输入已基本齐备，可继续完善设计和交付。</div>}
          </div>
        </Card>
      </section>

      <section className={styles.cardGrid}>
        {cards.map((card) => (
          <article key={card.id} className={styles.statusCard}>
            <div className={styles.statusHead}>
              <strong>{card.title}</strong>
              <span className={card.ready ? styles.ready : styles.pending}>{card.ready ? '已具备' : '待补齐'}</span>
            </div>
            <p>{card.detail}</p>
            <Link to={card.route}><Button variant={card.ready ? 'secondary' : 'primary'} size="small">查看阶段</Button></Link>
          </article>
        ))}
      </section>
    </div>
  );
}
