import { Link } from 'react-router-dom';
import { Button, Card } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
import { useOwnerPath, useIntegratorPath, useVendorPath, useProject, useProjectStatus } from '../../hooks/useProject';
import { getDashboardViewModel } from '../../domain/viewModels/dashboardVendorViewModels';
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
  const { actions } = useProject();
  const { projectMeta, assessment, riskProfile } = useOwnerPath();
  const { plan } = useIntegratorPath();
  const { capabilities, matchResults } = useVendorPath();
  const { progress, missingInputs, nextAction } = useProjectStatus();
  const viewModel = getDashboardViewModel({ projectMeta, assessment, riskProfile, plan, capabilities, matchResults, progress, missingInputs, nextAction });

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

  const statusPanel = (
    <>
      <div className={styles.statusHighlight}>
        <span>{viewModel.statusSummary.title}</span>
        <strong>{viewModel.statusSummary.headline}</strong>
        <em>{viewModel.statusSummary.detail}</em>
      </div>
      <div className={styles.statusTags}>
        {viewModel.statusSummary.pills.map((item) => <span key={item} className={styles.statusTag}>{item}</span>)}
      </div>
    </>
  );

  return (
    <ProjectStageShell
      stageNumber="00"
      title="工作台"
      projectName={viewModel.projectName}
      outputLabel={`总进度 ${viewModel.progress.completed} / ${viewModel.progress.total}`}
      statusText={viewModel.nextAction ? '待推进下一阶段' : '当前项目已形成完整阶段结果'}
      statusPanel={statusPanel}
      guidance={{ summary: '您可在工作台查看当前项目进度、待补充事项与建议动作。' }}
      toolbar={<><Button variant="secondary" size="small" onClick={handleLoadDemo}>加载演示项目</Button><Button variant="danger" size="small" onClick={handleReset}>重置项目</Button></>}
    >
      <section className={styles.page}>
        <section className={styles.hero}>
          <div>
            <h1>{viewModel.projectName || '当前项目'}</h1>
            <p>{viewModel.projectDescription}</p>
            <div className={styles.heroStats}>{viewModel.overviewStats.map((item) => <div key={item.label} className={styles.heroStat}><span>{item.label}</span><strong>{item.value}</strong></div>)}</div>
          </div>
          <div className={styles.heroAction}>
            {viewModel.nextAction ? <Link to={viewModel.nextAction.route}><Button variant="primary" size="small">下一步：{viewModel.nextAction.label}</Button></Link> : <Link to="/report"><Button variant="secondary" size="small">查看交付中心</Button></Link>}
          </div>
        </section>

        <section className={styles.grid}>
          <Card title="建议动作">
            <div className={styles.nextActionCard}>
              <strong>{viewModel.nextAction?.label || '当前阶段已基本完成'}</strong>
              <span>{viewModel.nextAction?.description || '可以转入交付中心查看阶段成果，或回到具体页面继续细化内容。'}</span>
              <em className={styles.noteText}>该建议根据当前项目状态生成，便于您优先处理关键步骤。</em>
              <div className={styles.inlineActions}>
                {viewModel.nextAction ? <Link to={viewModel.nextAction.route}><Button variant="primary" size="small">前往处理</Button></Link> : <Link to="/report"><Button variant="secondary" size="small">查看交付中心</Button></Link>}
              </div>
            </div>
          </Card>

          <Card title="缺失输入">
            <div className={styles.listBlock}>
              {viewModel.missingInputs.length ? viewModel.missingInputs.map((item) => (
                <Link key={item.id} to={item.route} className={styles.linkRow}>{item.label}</Link>
              )) : <div className={styles.empty}>当前关键输入已基本齐备，可继续完善设计和交付。</div>}
            </div>
          </Card>
        </section>

        <section className={styles.notePanel}>
          <strong>使用说明</strong>
          <em>建议优先处理缺失输入较多或系统推荐的阶段；如需快速了解整体流程，可先加载演示项目查看示例。</em>
        </section>

        <section className={styles.cardGrid}>
          {viewModel.cards.map((card) => (
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
