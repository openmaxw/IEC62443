import { Link } from 'react-router-dom';
import { Button, Card } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
import { useOwnerPath, useIntegratorPath, useVendorPath, useProject, useProjectStatus } from '../../hooks/useProject';
import styles from './Dashboard.module.css';

const STAGE_LABELS = {
  project: '项目建立',
  owner: '业主输入',
  integrator: '集成设计',
  vendor: '设备声明',
  selection: '闭环',
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
    if (window.confirm('将加载“台湾某大型半导体企业－新竹 12 英寸晶圆厂 + MOXA EDR-G9010”演示项目，用于快速检查各页面功能。是否继续？')) {
      actions.loadDemoProject();
    }
  };

  const cards = [
    {
      id: 'owner',
      title: '业主输入',
      ready: progress.stageStatus.owner,
      detail: assessment ? `已形成风险与业务输入摘要${riskProfile ? '，可交接给集成商' : ''}` : '待完成项目场景、后果、约束输入',
      route: progress.stageStatus.owner ? '/owner/result' : '/owner',
      substeps: progress.substeps.owner
    },
    {
      id: 'integrator',
      title: '集成设计',
      ready: progress.stageStatus.integrator,
      detail: plan ? `已形成 ${plan.zones?.length || 0} 个 zone、${plan.communicationFlows?.length || 0} 条通信流` : '待完成 Zone / Conduit 与通信设计',
      route: progress.stageStatus.integrator ? '/integrator/result' : '/integrator',
      substeps: progress.substeps.integrator
    },
    {
      id: 'vendor',
      title: '设备声明',
      ready: progress.stageStatus.vendor,
      detail: capabilities.length ? `已录入 ${capabilities.length} 份能力声明` : '待录入产品能力、边界与证据',
      route: progress.stageStatus.vendor ? '/vendor/result' : '/vendor',
      substeps: progress.substeps.vendor
    },
    {
      id: 'selection',
      title: '闭环',
      ready: progress.stageStatus.selection,
      detail: matchResults?.results?.length ? `已生成 ${matchResults.results.length} 条闭环输入结果` : '待完成要求-能力匹配与闭环处理',
      route: '/selection',
      substeps: progress.substeps.selection
    }
  ];

  return (
    <ProjectStageShell
      stageNumber="00"
      title="工作台"
      projectName={projectMeta.projectName}
      outputLabel={`总进度 ${progress.completed} / ${progress.total}`}
      guidance={{
        summary: '工作台用于查看当前项目进度、关键缺口和下一步动作。'
      }}
      toolbar={<><Button variant="secondary" size="small" onClick={handleLoadDemo}>加载演示项目</Button><Button variant="secondary" size="small" onClick={handleReset}>重置项目</Button></>}
    >
      <section className={styles.page}>
        <section className={styles.hero}>
          <div>
            <h1>{projectMeta.projectName || '当前项目'}</h1>
            <p>
              {[projectMeta.organizationName, projectMeta.siteName, projectMeta.industry, projectMeta.scenarioType].filter(Boolean).join(' / ') || '先从业主步骤 01 填写项目场景与基础信息，再按阶段推进 IEC 62443 协同工作流。'}
            </p>
          </div>
          <div className={styles.heroAction}>
            {nextAction ? <Link to={nextAction.route}><Button variant="primary" size="small">下一步：{nextAction.label}</Button></Link> : <Link to="/report"><Button variant="secondary" size="small">查看交付中心</Button></Link>}
          </div>
        </section>

        <section className={styles.grid}>
          <Card title="下一步建议">
            <div className={styles.nextActionCard}>
              <strong>{nextAction?.label || '当前阶段已基本完成'}</strong>
              <span>{nextAction?.description || '可以转入交付中心查看阶段成果，或回到具体页面继续细化内容。'}</span>
              <div className={styles.inlineActions}>
                {nextAction ? <Link to={nextAction.route}><Button variant="primary" size="small">前往处理</Button></Link> : <Link to="/report"><Button variant="secondary" size="small">查看交付中心</Button></Link>}
              </div>
            </div>
          </Card>

          <Card title="缺失输入">
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
              {card.substeps ? <div className={styles.substepBlock}><div className={styles.substepSummary}>子步骤 {card.substeps.completed} / {card.substeps.total}</div><div className={styles.substepList}>{card.substeps.items.map((item) => <div key={item.id} className={`${styles.substepItem} ${item.completed ? styles.substepDone : styles.substepTodo}`}><span>{item.id}</span><strong>{item.label}</strong></div>)}</div></div> : null}
              <Link to={card.route}><Button variant={card.ready ? 'secondary' : 'primary'} size="small">查看阶段</Button></Link>
            </article>
          ))}
        </section>
      </section>
    </ProjectStageShell>
  );
}
