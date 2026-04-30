import { Link } from 'react-router-dom';
import { Button, Badge } from '../../components/Common';
import { useProject } from '../../hooks/useProject';
import { INDUSTRIES } from '../../data/industries';
import styles from './Home.module.css';

function deriveStage(state) {
  if (state.selectionAnalysis?.results?.results?.length || state.selectionAnalysis?.results?.results?.[0]) return { route: '/selection', action: '查看当前结果' };
  if (state.vendorCatalog?.capabilities?.length) return { route: '/vendor/result', action: '进入当前步骤' };
  if (state.integratorDesign?.plan) return { route: '/integrator/result', action: '进入当前步骤' };
  if (state.ownerProfile?.assessment && state.riskTranslation?.profile) return { route: '/owner/result', action: '进入当前步骤' };
  return { route: '/owner', action: '从需求开始' };
}

export function Home() {
  const { state, actions } = useProject();
  const currentStage = deriveStage(state);
  const projectMeta = state.projectMeta || {};
  const updateMeta = (field, value) => actions.setProjectMeta({ [field]: value });

  return (
    <div className={styles.page}>
      <section className={styles.topBar}>
        <div>
          <Badge variant="primary" size="medium">项目</Badge>
          <strong className={styles.projectTitle}>{projectMeta.projectName || 'IEC 62443 协同工作台'}</strong>
        </div>
        <Link to={currentStage.route}><Button variant="primary" size="medium">{currentStage.action}</Button></Link>
      </section>

      <section className={styles.projectPanel}>
        <input value={projectMeta.projectName || ''} onChange={(event) => updateMeta('projectName', event.target.value)} placeholder="项目名称" />
        <input value={projectMeta.organizationName || ''} onChange={(event) => updateMeta('organizationName', event.target.value)} placeholder="业主单位" />
        <input value={projectMeta.siteName || ''} onChange={(event) => updateMeta('siteName', event.target.value)} placeholder="工厂/装置/站点" />
        <select value={projectMeta.industry || ''} onChange={(event) => updateMeta('industry', event.target.value)}>
          <option value="">行业/场景</option>
          {INDUSTRIES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select value={projectMeta.scenarioType || ''} onChange={(event) => updateMeta('scenarioType', event.target.value)}>
          <option value="">项目类型</option>
          <option value="new-build">新建</option>
          <option value="retrofit">改造</option>
          <option value="expansion">扩建</option>
          <option value="assessment">评估</option>
        </select>
        <input value={projectMeta.projectObjective || ''} onChange={(event) => updateMeta('projectObjective', event.target.value)} placeholder="一句话目标" />
      </section>

      <section className={styles.menuTable}>
        <div className={styles.menuRow}><span>需求</span><small>业主访谈</small><Link to="/owner"><Button variant="secondary" size="small">进入</Button></Link></div>
        <div className={styles.menuRow}><span>设计</span><small>集成商设计</small><Link to="/integrator"><Button variant="secondary" size="small">进入</Button></Link></div>
        <div className={styles.menuRow}><span>能力</span><small>设备商声明</small><Link to="/vendor"><Button variant="secondary" size="small">进入</Button></Link></div>
        <div className={styles.menuRow}><span>差距</span><small>匹配结果</small><Link to="/selection"><Button variant="secondary" size="small">进入</Button></Link></div>
      </section>
    </div>
  );
}
