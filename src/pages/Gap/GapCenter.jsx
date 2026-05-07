import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
import { getCapabilityDisplay } from '../../data/capabilities';
import { useProject, useVendorPath } from '../../hooks/useProject';
import styles from './GapCenter.module.css';

function buildGapItems(matchResults, savedItems = []) {
  const rows = matchResults?.results || [];
  const savedMap = new Map(savedItems.map((item) => [item.id, item]));
  return rows
    .filter((item) => item.status === 'missing' || item.status === 'external' || item.status === 'partial')
    .map((item) => {
      const saved = savedMap.get(item.id);
      return {
        ...item,
        mitigation: saved?.mitigation || (item.status === 'missing'
          ? '建议更换设备、调整架构或补充外围控制后再评估。'
          : item.status === 'external'
            ? '建议由边界防护、跳板、日志平台或集中身份管理进行补偿。'
            : '建议通过配置加固、功能启用或实施条件补齐后关闭差距。'),
        acceptanceImpact: saved?.acceptanceImpact || (item.severity === 'high' ? '高，可能影响验收' : '中，需在验收前确认关闭路径'),
        residualRisk: saved?.residualRisk || (item.severity === 'high' ? '建议纳入残余风险登记' : '建议视补偿措施有效性决定是否登记'),
        owner: saved?.owner || item.owner,
        saved: Boolean(saved)
      };
    });
}

export function GapCenter() {
  const { state, actions } = useProject();
  const { matchResults, gapClosureItems } = useVendorPath();
  const baseItems = useMemo(() => buildGapItems(matchResults, gapClosureItems), [matchResults, gapClosureItems]);
  const [items, setItems] = useState(baseItems);
  const [savedAtLeastOnce, setSavedAtLeastOnce] = useState(false);

  useEffect(() => {
    setItems(baseItems);
  }, [baseItems]);

  const updateItem = (id, field, value) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value, saved: false } : item)));
  };

  const handleSave = () => {
    const nextItems = items.map((item) => ({ ...item, saved: true }));
    setItems(nextItems);
    setSavedAtLeastOnce(true);
    actions.setGapClosureItems(nextItems.map(({ id, capabilityId, controlObjective, status, severity, mitigation, acceptanceImpact, residualRisk, owner, evidenceType }) => ({
      id,
      capabilityId,
      controlObjective,
      status,
      severity,
      mitigation,
      acceptanceImpact,
      residualRisk,
      owner,
      evidenceType
    })));
  };

  return (
    <ProjectStageShell stageNumber="05" title="差距闭环" projectName={state.projectMeta?.projectName} outputLabel="补偿措施与残余风险" prevAction={{ to: '/selection', label: '上一步' }} guidance={{ summary: '本页处理差距闭环，并将项目级补偿措施和残余风险记录保存到交付状态。', role: '业主 / 集成商 / 设备商', usage: '逐条确认补偿措施、责任方、验收影响和残余风险后保存，再进入交付中心。' }}>
      <section className={styles.page}>
        <div className={styles.hero}>
          <div>
            <strong>差距闭环中心</strong>
            <p>本页只回答“怎么补、谁来补、是否影响验收、是否登记残余风险”。</p>
            <span className={styles.helper}>{items.length ? `当前共有 ${items.length} 条待闭环差距。` : '当前没有需要闭环的差距项。'}{savedAtLeastOnce || gapClosureItems.length ? ' 已保存闭环决策。' : ''}</span>
          </div>
          <div className={styles.heroActions}>
            <Button variant="secondary" size="small" onClick={handleSave} disabled={!items.length}>保存闭环决策</Button>
            <Link to="/report"><Button variant="primary" size="small">进入交付中心</Button></Link>
          </div>
        </div>

        <div className={styles.list}>
          {items.length ? items.map((item) => (
            <article key={item.id} className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <strong>{getCapabilityDisplay(item.capabilityId).label}</strong>
                  <div className={styles.capabilityMeta}><span className={styles.standardTag}>{getCapabilityDisplay(item.capabilityId).frText}</span><span className={styles.standardTag}>{getCapabilityDisplay(item.capabilityId).srText}</span></div><span className={styles.meta}>{item.controlObjective}</span>
                </div>
                <span className={item.saved ? styles.savedTag : styles.pendingTag}>{item.saved ? '已保存' : '未保存'}</span>
              </div>

              <div className={styles.readonlyGrid}>
                <div><span>差距状态</span><strong>{item.status}</strong></div>
                <div><span>证据来源</span><strong>{item.evidenceType || '未填写'}</strong></div>
                <div><span>严重度</span><strong>{item.severity}</strong></div>
              </div>

              <label className={styles.field}>
                <span>责任方</span>
                <input value={item.owner || ''} onChange={(event) => updateItem(item.id, 'owner', event.target.value)} placeholder="示例：设备商 / 集成商 / 业主" />
              </label>

              <label className={styles.field}>
                <span>补偿措施</span>
                <textarea value={item.mitigation || ''} onChange={(event) => updateItem(item.id, 'mitigation', event.target.value)} rows="3" placeholder="填写项目级补偿措施、替代控制或实施动作" />
              </label>

              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>验收影响</span>
                  <textarea value={item.acceptanceImpact || ''} onChange={(event) => updateItem(item.id, 'acceptanceImpact', event.target.value)} rows="2" placeholder="填写是否影响验收、前置条件和确认方式" />
                </label>

                <label className={styles.field}>
                  <span>残余风险</span>
                  <textarea value={item.residualRisk || ''} onChange={(event) => updateItem(item.id, 'residualRisk', event.target.value)} rows="2" placeholder="填写是否登记残余风险及后续跟踪要求" />
                </label>
              </div>
            </article>
          )) : <div className={styles.empty}>当前没有需要闭环的差距项。</div>}
        </div>
      </section>
    </ProjectStageShell>
  );
}
