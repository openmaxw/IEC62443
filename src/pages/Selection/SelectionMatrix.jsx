import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, NotePanel, StatusBadge, StatusSummaryPanel, StepTabs, WorkflowNavBar } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
import { getCapabilityDisplay } from '../../data/capabilities';
import { useIntegratorPath, useProject, useVendorPath } from '../../hooks/useProject';
import { getSelectionViewModel } from '../../domain/viewModels/selectionReportViewModels';
import styles from './SelectionMatrix.module.css';

const STEPS = [
  { id: 'overview', title: '匹配结果总览' },
  { id: 'gaps', title: '待闭环项' },
  { id: 'mitigation', title: '补偿措施' },
  { id: 'risk', title: '验收与风险' },
  { id: 'review', title: '闭环确认' }
];

const STATUS_LABELS = { fulfilled: '满足', partial: '部分满足', missing: '不满足', external: '需外部补偿', na: '不适用' };

function isSameObject(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function SelectionMatrix({ initialStep = 0 }) {
  const navigate = useNavigate();
  const { state, actions } = useProject();
  const { projectMeta, plan } = useIntegratorPath();
  const { capabilities, gapClosureItems, matchResults } = useVendorPath();
  const viewModel = getSelectionViewModel({ projectMeta, plan, capabilities, gapClosureItems, matchResults });
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [savedAtLeastOnce, setSavedAtLeastOnce] = useState(false);
  const [gapItems, setGapItems] = useState(viewModel.gapItems);
  const step = STEPS[currentStep];
  const isReviewStep = currentStep === STEPS.length - 1;

  useEffect(() => {
    if (isSameObject(viewModel.gapItems, gapItems)) return undefined;

    const timer = window.setTimeout(() => {
      setGapItems(viewModel.gapItems);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [viewModel.gapItems, gapItems]);

  const handleSaveSelection = () => {
    const nextResults = { results: viewModel.selection.rows, summary: viewModel.selection.summary };
    if (!isSameObject(state.selectionAnalysis?.results, nextResults)) {
      actions.setMatchResults(nextResults);
    }
  };

  const updateGapItem = (id, field, value) => {
    setGapItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value, saved: false } : item)));
  };

  const handleSaveGap = () => {
    if (!isSameObject(state.selectionAnalysis?.results, { results: viewModel.selection.rows, summary: viewModel.selection.summary })) {
      actions.setMatchResults({ results: viewModel.selection.rows, summary: viewModel.selection.summary });
    }
    if (!isSameObject(state.gapClosure?.items, gapItems)) {
      actions.setGapClosureItems(gapItems);
    }
    setSavedAtLeastOnce(true);
  };

  let content;
  switch (step.id) {
    case 'overview':
      content = <section className={styles.page}><div className={styles.hero}><div><strong>匹配概览</strong><p>请先确认当前设计能力需求与最新设备声明的匹配结果。</p><span className={styles.meta}>{viewModel.latestCapability ? '已识别最新设备能力声明。' : '尚未生成设备能力声明，结果将显示为待满足。'}</span></div><div className={styles.actions}><Button variant="secondary" size="medium" onClick={handleSaveSelection}>保存匹配结果</Button><Button variant="primary" size="medium" onClick={() => setCurrentStep(1)}>查看待闭环项</Button></div></div><table className={styles.table}><thead><tr><th>能力项</th><th>控制目标</th><th>满足情况</th><th>证据类型</th><th>差距说明</th></tr></thead><tbody>{viewModel.selection.rows.length ? viewModel.selection.rows.map((item) => <tr key={item.id}><td>{getCapabilityDisplay(item.capabilityId).label}</td><td>{item.controlObjective}</td><td><StatusBadge tone={item.status === 'missing' ? 'danger' : item.status === 'external' || item.status === 'partial' ? 'warning' : 'success'}>{STATUS_LABELS[item.status] || item.status}</StatusBadge></td><td>{item.evidenceType}</td><td>{item.gapNote}</td></tr>) : <tr><td colSpan="5" className={styles.empty}>当前没有可分析的能力需求，请先返回集成设计与设备声明页面补充输入。</td></tr>}</tbody></table></section>;
      break;
    case 'gaps':
      content = <section className={styles.page}><table className={styles.table}><thead><tr><th>能力项</th><th>控制目标</th><th>严重度</th><th>差距说明</th><th>责任建议</th></tr></thead><tbody>{gapItems.length ? gapItems.map((item) => <tr key={item.id}><td>{getCapabilityDisplay(item.capabilityId).label}</td><td>{item.controlObjective}</td><td><StatusBadge tone={item.severity === 'high' ? 'danger' : item.severity === 'medium' ? 'warning' : 'success'}>{item.severity}</StatusBadge></td><td>{item.gapNote}</td><td>{item.owner || '未填写'}</td></tr>) : <tr><td colSpan="5" className={styles.empty}>当前没有需要闭环的差距项。</td></tr>}</tbody></table></section>;
      break;
    case 'mitigation':
      content = <section className={styles.page}>{gapItems.length ? <table className={styles.formTable}><thead><tr><th>能力项</th><th>控制目标</th><th>补偿措施</th></tr></thead><tbody>{gapItems.map((item) => <tr key={item.id}><th>{getCapabilityDisplay(item.capabilityId).label}</th><td>{item.controlObjective}</td><td><textarea value={item.mitigation || ''} onChange={(event) => updateGapItem(item.id, 'mitigation', event.target.value)} rows="3" placeholder="填写项目级补偿措施、替代控制或实施动作" /></td></tr>)}</tbody></table> : <div className={styles.empty}>当前没有需要闭环的差距项。</div>}</section>;
      break;
    case 'risk':
      content = <section className={styles.page}>{gapItems.length ? <table className={styles.formTable}><thead><tr><th>能力项</th><th>责任方</th><th>验收影响</th><th>残余风险</th></tr></thead><tbody>{gapItems.map((item) => <tr key={item.id}><th><div><strong>{getCapabilityDisplay(item.capabilityId).label}</strong><span className={styles.meta}>{item.status} / {item.severity}</span></div></th><td><input value={item.owner || ''} onChange={(event) => updateGapItem(item.id, 'owner', event.target.value)} placeholder="示例：设备商 / 集成商 / 业主" /></td><td><textarea value={item.acceptanceImpact || ''} onChange={(event) => updateGapItem(item.id, 'acceptanceImpact', event.target.value)} rows="2" placeholder="填写是否影响验收、前置条件和确认方式" /></td><td><textarea value={item.residualRisk || ''} onChange={(event) => updateGapItem(item.id, 'residualRisk', event.target.value)} rows="2" placeholder="填写是否登记残余风险及后续跟踪要求" /></td></tr>)}</tbody></table> : <div className={styles.empty}>当前没有需要闭环的差距项。</div>}</section>;
      break;
    default:
      content = <section className={styles.page}><div className={styles.hero}><div><strong>闭环确认</strong><p>确认匹配结果与闭环信息后保存，再进入交付中心。</p><span className={styles.meta}>{savedAtLeastOnce || gapClosureItems.length ? '已保存部分或全部闭环决策。' : '尚未保存闭环决策。'}</span></div><div className={styles.actions}><Button variant="secondary" size="medium" onClick={handleSaveGap}>保存闭环结果</Button><Button variant="primary" size="medium" onClick={() => navigate('/report')}>进入交付中心</Button></div></div><table className={styles.table}><thead><tr><th>能力项</th><th>补偿措施</th><th>验收影响</th><th>残余风险</th><th>责任方</th></tr></thead><tbody>{gapItems.length ? gapItems.map((item) => <tr key={item.id}><td>{getCapabilityDisplay(item.capabilityId).label}</td><td>{item.mitigation || '未填写'}</td><td>{item.acceptanceImpact || '未填写'}</td><td>{item.residualRisk || '未填写'}</td><td>{item.owner || '未填写'}</td></tr>) : <tr><td colSpan="5" className={styles.empty}>当前没有需要闭环的差距项。</td></tr>}</tbody></table></section>;
  }

  return (
    <ProjectStageShell stageNumber="04" title="闭环" projectName={viewModel.projectName} outputLabel={`步骤 ${currentStep + 1}/${STEPS.length} · ${step.title}`} statusText={viewModel.statusSummary.headline} guidance={{ summary: '请在本页确认匹配结果、补偿措施、责任归属及验收影响。' }} statusPanel={<StatusSummaryPanel label={viewModel.statusSummary.title} value={viewModel.statusSummary.headline} note={viewModel.statusSummary.detail} pills={viewModel.statusSummary.pills} />}>
      <section className={styles.page}>
        <StepTabs items={STEPS} currentIndex={currentStep} onChange={setCurrentStep} />
        <div>{content}</div>
        <NotePanel title="闭环说明" notes={["请完整填写补偿措施、责任归属、验收影响与残余风险信息。", "如需补充设备能力声明或设计依据，请返回前序页面更新后再继续闭环处理。"]} />
        <WorkflowNavBar leftLabel={currentStep === 0 ? '返回设备结果' : '上一步'} rightLabel={isReviewStep ? '进入交付中心' : '下一步'} onLeftClick={currentStep === 0 ? () => navigate('/vendor/result') : () => setCurrentStep((prev) => Math.max(prev - 1, 0))} onRightClick={isReviewStep ? () => navigate('/report') : () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))} />
      </section>
    </ProjectStageShell>
  );
}
