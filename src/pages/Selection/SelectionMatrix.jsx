import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
import { getCapabilityDisplay } from '../../data/capabilities';
import { useIntegratorPath, useProject, useVendorPath } from '../../hooks/useProject';
import styles from './SelectionMatrix.module.css';

const STEPS = [
  { id: 'overview', title: '匹配结果总览' },
  { id: 'gaps', title: '待闭环项' },
  { id: 'mitigation', title: '补偿措施' },
  { id: 'risk', title: '验收与风险' },
  { id: 'review', title: '闭环确认' }
];

const STATUS_LABELS = { fulfilled: '满足', partial: '部分满足', missing: '不满足', external: '需外部补偿', na: '不适用' };

function buildSelectionResults(plan, latestCapability) {
  const requirements = plan?.capabilityRequirements || [];
  const claimMap = new Map((latestCapability?.capabilityClaims || []).map((item) => [item.capabilityId, item]));
  const rows = requirements.map((requirement) => {
    const claim = claimMap.get(requirement.capabilityId);
    const status = claim?.satisfaction || 'missing';
    const severity = status === 'missing' ? 'high' : status === 'external' ? 'medium' : status === 'partial' ? 'medium' : 'low';
    return {
      id: requirement.id,
      capabilityId: requirement.capabilityId,
      controlObjective: requirement.controlObjective,
      status,
      evidenceType: claim?.evidenceType || '未填写',
      gapNote: status === 'missing' ? '当前未形成可接受实现路径。' : status === 'external' ? '需通过外围系统或边界控制补足。' : status === 'partial' ? '需配置或补充条件后满足。' : '当前可满足项目要求。',
      severity,
      owner: status === 'external' ? '集成商/业主' : status === 'missing' ? '设备商/集成商' : '设备商'
    };
  });
  return {
    rows,
    summary: {
      high: rows.filter((item) => item.severity === 'high').length,
      medium: rows.filter((item) => item.severity === 'medium').length,
      low: rows.filter((item) => item.severity === 'low').length
    }
  };
}

function buildGapItems(selectionResults, savedItems = []) {
  const rows = selectionResults?.filter((item) => item.status === 'missing' || item.status === 'external' || item.status === 'partial') || [];
  const savedMap = new Map((savedItems || []).map((item) => [item.id, item]));
  return rows.map((item) => {
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

export function SelectionMatrix({ initialStep = 0 }) {
  const navigate = useNavigate();
  const { state, actions } = useProject();
  const { plan } = useIntegratorPath();
  const { capabilities, gapClosureItems } = useVendorPath();
  const latestCapability = capabilities?.[capabilities.length - 1];
  const selection = useMemo(() => buildSelectionResults(plan, latestCapability), [plan, latestCapability]);
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [savedAtLeastOnce, setSavedAtLeastOnce] = useState(false);
  const baseGapItems = useMemo(() => buildGapItems(selection.rows, gapClosureItems), [selection.rows, gapClosureItems]);
  const [gapItems, setGapItems] = useState(baseGapItems);
  const step = STEPS[currentStep];
  const isReviewStep = currentStep === STEPS.length - 1;

  useEffect(() => {
    setGapItems(baseGapItems);
  }, [baseGapItems]);

  const handleSaveSelection = () => {
    actions.setMatchResults({ results: selection.rows, summary: selection.summary });
  };

  const updateGapItem = (id, field, value) => {
    setGapItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value, saved: false } : item)));
  };

  const handleSaveGap = () => {
    const nextItems = gapItems.map((item) => ({ ...item, saved: true }));
    setGapItems(nextItems);
    setSavedAtLeastOnce(true);
    actions.setMatchResults({ results: selection.rows, summary: selection.summary });
    actions.setGapClosureItems(nextItems.map(({ id, capabilityId, controlObjective, status, severity, mitigation, acceptanceImpact, residualRisk, owner, evidenceType }) => ({ id, capabilityId, controlObjective, status, severity, mitigation, acceptanceImpact, residualRisk, owner, evidenceType })));
  };

  if (!plan || !latestCapability) {
    return <ProjectStageShell stageNumber="04" title="闭环" projectName={state.projectMeta?.projectName} outputLabel="要求与能力匹配结果"><div className={styles.empty}><Button variant="primary" onClick={() => navigate('/vendor')}>先完成设备能力声明</Button></div></ProjectStageShell>;
  }

  let content = null;

  switch (step.id) {
    case 'overview':
      content = <section className={styles.page}><div className={styles.hero}><div><strong>匹配概览</strong><p>先确认要求与能力匹配结果，再进入闭环处理。</p></div><div className={styles.summaryChips}><span className={styles.high}>高 {selection.summary.high}</span><span className={styles.medium}>中 {selection.summary.medium}</span><span className={styles.low}>低 {selection.summary.low}</span></div></div><table className={styles.table}><thead><tr><th>要求项</th><th>控制目标</th><th>状态</th><th>说明</th><th>责任归属</th></tr></thead><tbody>{selection.rows.map((row) => <tr key={row.id}><td><strong>{getCapabilityDisplay(row.capabilityId).label}</strong><div className={styles.capabilityMeta}><span className={styles.standardTag}>{getCapabilityDisplay(row.capabilityId).frText}</span><span className={styles.standardTag}>{getCapabilityDisplay(row.capabilityId).srText}</span></div></td><td>{row.controlObjective}</td><td><span className={`${styles.badge} ${styles[row.severity]}`}>{STATUS_LABELS[row.status] || row.status}</span></td><td>{row.gapNote} / 证据：{row.evidenceType}</td><td>{row.owner}</td></tr>)}</tbody></table><div className={styles.actions}><Button variant="secondary" size="medium" onClick={handleSaveSelection}>保存匹配结果</Button></div></section>;
      break;
    case 'gaps':
      content = <section className={styles.page}><div className={styles.hero}><div><strong>待闭环项</strong><p>只保留需要处理的差距项，便于后续补偿与责任分派。</p></div></div><table className={styles.table}><thead><tr><th>能力项</th><th>状态</th><th>严重度</th><th>差距说明</th><th>责任归属</th></tr></thead><tbody>{gapItems.length ? gapItems.map((item) => <tr key={item.id}><td>{getCapabilityDisplay(item.capabilityId).label}</td><td>{STATUS_LABELS[item.status] || item.status}</td><td>{item.severity}</td><td>{item.gapNote}</td><td>{item.owner || '未填写'}</td></tr>) : <tr><td colSpan="5" className={styles.empty}>当前没有需要闭环的差距项。</td></tr>}</tbody></table></section>;
      break;
    case 'mitigation':
      content = <section className={styles.page}><div className={styles.list}>{gapItems.length ? gapItems.map((item) => <article key={item.id} className={styles.card}><div className={styles.cardHead}><div><strong>{getCapabilityDisplay(item.capabilityId).label}</strong><span className={styles.meta}>{item.controlObjective}</span></div></div><label className={styles.field}><span>补偿措施</span><textarea value={item.mitigation || ''} onChange={(event) => updateGapItem(item.id, 'mitigation', event.target.value)} rows="3" placeholder="填写项目级补偿措施、替代控制或实施动作" /></label></article>) : <div className={styles.empty}>当前没有需要闭环的差距项。</div>}</div></section>;
      break;
    case 'risk':
      content = <section className={styles.page}><div className={styles.list}>{gapItems.length ? gapItems.map((item) => <article key={item.id} className={styles.card}><div className={styles.cardHead}><div><strong>{getCapabilityDisplay(item.capabilityId).label}</strong><span className={styles.meta}>{item.status} / {item.severity}</span></div></div><div className={styles.formGrid}><label className={styles.field}><span>责任方</span><input value={item.owner || ''} onChange={(event) => updateGapItem(item.id, 'owner', event.target.value)} placeholder="示例：设备商 / 集成商 / 业主" /></label><label className={styles.field}><span>验收影响</span><textarea value={item.acceptanceImpact || ''} onChange={(event) => updateGapItem(item.id, 'acceptanceImpact', event.target.value)} rows="2" placeholder="填写是否影响验收、前置条件和确认方式" /></label><label className={styles.field}><span>残余风险</span><textarea value={item.residualRisk || ''} onChange={(event) => updateGapItem(item.id, 'residualRisk', event.target.value)} rows="2" placeholder="填写是否登记残余风险及后续跟踪要求" /></label></div></article>) : <div className={styles.empty}>当前没有需要闭环的差距项。</div>}</div></section>;
      break;
    default:
      content = <section className={styles.page}><div className={styles.hero}><div><strong>闭环确认</strong><p>确认匹配结果与闭环信息后保存，再进入交付中心。</p><span className={styles.meta}>{savedAtLeastOnce || gapClosureItems.length ? '已保存部分或全部闭环决策。' : '尚未保存闭环决策。'}</span></div><div className={styles.actions}><Button variant="secondary" size="medium" onClick={handleSaveGap}>保存闭环结果</Button><Button variant="primary" size="medium" onClick={() => navigate('/report')}>进入交付中心</Button></div></div><table className={styles.table}><thead><tr><th>能力项</th><th>补偿措施</th><th>验收影响</th><th>残余风险</th><th>责任方</th></tr></thead><tbody>{gapItems.length ? gapItems.map((item) => <tr key={item.id}><td>{getCapabilityDisplay(item.capabilityId).label}</td><td>{item.mitigation || '未填写'}</td><td>{item.acceptanceImpact || '未填写'}</td><td>{item.residualRisk || '未填写'}</td><td>{item.owner || '未填写'}</td></tr>) : <tr><td colSpan="5" className={styles.empty}>当前没有需要闭环的差距项。</td></tr>}</tbody></table></section>;
  }

  return (
    <ProjectStageShell stageNumber="04" title="闭环" projectName={state.projectMeta?.projectName} outputLabel={`步骤 ${currentStep + 1}/${STEPS.length} · ${step.title}`}>
      <section className={styles.page}>
        <div className={styles.stepTabs}>{STEPS.map((item, index) => <button key={item.id} type="button" className={`${styles.stepTab} ${index === currentStep ? styles.stepTabActive : ''}`} onClick={() => setCurrentStep(index)}>{String(index + 1).padStart(2, '0')} {item.title}</button>)}</div>
        <div>{content}</div>
        <div className={styles.actions}>{currentStep === 0 ? <Button variant="ghost" size="medium" onClick={() => navigate('/vendor/result')}>返回设备结果</Button> : <Button variant="ghost" size="medium" onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}>上一步</Button>}{isReviewStep ? <Button variant="primary" size="medium" onClick={() => navigate('/report')}>进入交付中心</Button> : <Button variant="primary" size="medium" onClick={() => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))}>下一步</Button>}</div>
      </section>
    </ProjectStageShell>
  );
}
