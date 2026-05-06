import { Link } from 'react-router-dom';
import { Button, Badge } from '../../components/Common';
import { useProject } from '../../hooks/useProject';
import { INDUSTRIES } from '../../data/industries';
import styles from './Home.module.css';

export function Home() {
  const { state, actions } = useProject();
  const projectMeta = state.projectMeta || {};
  const updateMeta = (field, value) => actions.setProjectMeta({ [field]: value });
  const handleReset = () => {
    if (window.confirm('初始化后将清空当前项目及后续流程的全部已填写信息，是否继续？')) {
      actions.resetProject();
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.toolbarRow}>
        <div className={styles.titleGroup}>
          <Badge variant="primary" size="medium">阶段 0</Badge>
          <strong>项目</strong>
        </div>
        <div className={styles.actionGroup}>
          <Button variant="secondary" size="medium" onClick={handleReset}>初始化</Button>
        </div>
      </section>

      <section className={styles.guidanceRow}>
        <p>本页用于填写项目基础信息，形成后续需求整理、设计分析、能力声明与差距比对的共同上下文。</p>
        <div className={styles.guidanceMeta}>
          <span><strong>填写角色：</strong>项目负责人 / 业主侧牵头人</span>
          <span><strong>使用方式：</strong>补充项目基础信息后，进入需求页面开展后续工作</span>
        </div>
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

      <section className={styles.navSection}>
        <div className={styles.navActions}>
          <Link to="/"><Button variant="ghost" size="medium">上一步</Button></Link>
          <Link to="/owner"><Button variant="primary" size="medium">下一步</Button></Link>
        </div>
      </section>
    </div>
  );
}
