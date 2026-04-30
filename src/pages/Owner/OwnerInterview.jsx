import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
import { useProject } from '../../hooks/useProject';
import { generateRiskProfile } from '../../utils/riskEngine';
import {
  CONSEQUENCE_LEVEL_OPTIONS,
  REMOTE_ACCESS_OPTIONS,
  THIRD_PARTY_ACCESS_OPTIONS,
  ACCEPTANCE_PREFERENCE_OPTIONS,
  REMOTE_OWNERSHIP_OPTIONS
} from '../../data/enums';
import { INDUSTRIES } from '../../data/industries';
import styles from './OwnerInterview.module.css';

const STEPS = [
  { id: 'industry', title: '项目场景' },
  { id: 'impacts', title: '业务后果' },
  { id: 'exposure', title: '暴露面' },
  { id: 'maturity', title: '现状基础' },
  { id: 'constraints', title: '约束条件' },
  { id: 'assets', title: '关键对象' },
  { id: 'projectName', title: '生成结果' }
];

const IMPACT_FIELDS = [
  { key: 'safetyImpact', label: '人身安全' },
  { key: 'environmentalImpact', label: '环境影响' },
  { key: 'productionImpact', label: '产能连续性' },
  { key: 'qualityImpact', label: '质量一致性' },
  { key: 'financialImpact', label: '财务损失' },
  { key: 'complianceImpact', label: '监管合规' },
  { key: 'brandImpact', label: '品牌声誉' }
];

const MATURITY_FIELDS = [
  ['networkSegmentationMaturity', '网络隔离'],
  ['identityMaturity', '身份管理'],
  ['loggingMaturity', '日志审计'],
  ['patchMaturity', '补丁维护']
];

const ASSETS = [
  { id: 'plc', name: 'PLC' },
  { id: 'scada', name: 'SCADA' },
  { id: 'engineering', name: '工程师站' },
  { id: 'historian', name: '历史库' },
  { id: 'network', name: '工业网络' },
  { id: 'safety', name: '安全系统' },
  { id: 'remote-gateway', name: '远程接入' },
  { id: 'server', name: '工业服务器' }
];

function OptionPills({ value, onChange, options }) {
  return (
    <div className={styles.pillRow}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`${styles.pill} ${value === option.value ? styles.pillActive : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function OwnerInterview() {
  const navigate = useNavigate();
  const { state, actions } = useProject();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    projectName: state.projectMeta?.projectName || '',
    industry: state.projectMeta?.industry || '',
    safetyImpact: '', environmentalImpact: '', productionImpact: '', qualityImpact: '', financialImpact: '', complianceImpact: '', brandImpact: '',
    remoteAccessNeed: '', thirdPartyAccess: '',
    networkSegmentationMaturity: '', identityMaturity: '', loggingMaturity: '', patchMaturity: '',
    maintenanceWindow: '', upgradeWindow: '', remoteOperationsOwnership: 'shared', acceptancePreference: 'security-first', criticalAssets: []
  });

  const step = STEPS[currentStep];
  const updateField = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
  const toggleAsset = (item) => setFormData((prev) => ({ ...prev, criticalAssets: prev.criticalAssets.includes(item) ? prev.criticalAssets.filter((entry) => entry !== item) : [...prev.criticalAssets, item] }));

  const handleComplete = () => {
    const projectName = formData.projectName || state.projectMeta?.projectName || `${formData.industry || '工业项目'} IEC 62443 需求访谈`;
    const nextForm = { ...formData, projectName, industry: formData.industry || state.projectMeta?.industry || '' };
    actions.setProjectMeta({ projectName, industry: nextForm.industry, status: 'owner-completed' });
    actions.setOwnerAssessment(nextForm);
    actions.setProjectName(projectName);
    actions.setRiskProfile(generateRiskProfile(nextForm));
    navigate('/owner/result');
  };

  let content = null;
  switch (step.id) {
    case 'industry':
      content = <div className={styles.infoTable}><div><span>项目名称</span><strong>{state.projectMeta?.projectName || '未填写'}</strong></div><div><span>行业</span><strong>{INDUSTRIES.find((item) => item.id === (state.projectMeta?.industry || formData.industry))?.name || '未填写'}</strong></div><div><span>业主单位</span><strong>{state.projectMeta?.organizationName || '未填写'}</strong></div><div><span>站点</span><strong>{state.projectMeta?.siteName || '未填写'}</strong></div></div>;
      break;
    case 'impacts':
      content = <table className={styles.matrix}><thead><tr><th>后果项</th><th>选择</th></tr></thead><tbody>{IMPACT_FIELDS.map((field) => <tr key={field.key}><td>{field.label}</td><td><OptionPills value={formData[field.key]} onChange={(value) => updateField(field.key, value)} options={CONSEQUENCE_LEVEL_OPTIONS} /></td></tr>)}</tbody></table>;
      break;
    case 'exposure':
      content = <table className={styles.matrix}><thead><tr><th>项目项</th><th>选择</th></tr></thead><tbody><tr><td>远程运维</td><td><OptionPills value={formData.remoteAccessNeed} onChange={(value) => updateField('remoteAccessNeed', value)} options={REMOTE_ACCESS_OPTIONS} /></td></tr><tr><td>第三方接入</td><td><OptionPills value={formData.thirdPartyAccess} onChange={(value) => updateField('thirdPartyAccess', value)} options={THIRD_PARTY_ACCESS_OPTIONS} /></td></tr></tbody></table>;
      break;
    case 'maturity':
      content = <table className={styles.matrix}><thead><tr><th>基础项</th><th>选择</th></tr></thead><tbody>{MATURITY_FIELDS.map(([key, label]) => <tr key={key}><td>{label}</td><td><OptionPills value={formData[key]} onChange={(value) => updateField(key, value)} options={CONSEQUENCE_LEVEL_OPTIONS} /></td></tr>)}</tbody></table>;
      break;
    case 'constraints':
      content = <div className={styles.stack}><div className={styles.formLine}><input value={formData.maintenanceWindow} onChange={(event) => updateField('maintenanceWindow', event.target.value)} placeholder="常规维护窗口" /><input value={formData.upgradeWindow} onChange={(event) => updateField('upgradeWindow', event.target.value)} placeholder="改造窗口" /></div><table className={styles.matrix}><thead><tr><th>约束项</th><th>选择</th></tr></thead><tbody><tr><td>责任归属</td><td><OptionPills value={formData.remoteOperationsOwnership} onChange={(value) => updateField('remoteOperationsOwnership', value)} options={REMOTE_OWNERSHIP_OPTIONS} /></td></tr><tr><td>验收偏好</td><td><OptionPills value={formData.acceptancePreference} onChange={(value) => updateField('acceptancePreference', value)} options={ACCEPTANCE_PREFERENCE_OPTIONS} /></td></tr></tbody></table></div>;
      break;
    case 'assets':
      content = <div className={styles.assetMatrix}>{ASSETS.map((asset) => <button key={asset.id} type="button" className={`${styles.assetCell} ${formData.criticalAssets.includes(asset.id) ? styles.assetActive : ''}`} onClick={() => toggleAsset(asset.id)}>{asset.name}</button>)}</div>;
      break;
    default:
      content = <input value={formData.projectName} onChange={(event) => updateField('projectName', event.target.value)} placeholder="例如：某化工厂 OT 安全规划项目" />;
  }

  return (
    <ProjectStageShell stageNumber="01" title="需求" projectName={state.projectMeta?.projectName || formData.projectName} outputLabel={`步骤 ${currentStep + 1}/${STEPS.length} · ${step.title}`}>
      <div className={styles.stepTabs}>{STEPS.map((item, index) => <button key={item.id} type="button" className={`${styles.stepTab} ${index === currentStep ? styles.stepTabActive : ''}`} onClick={() => setCurrentStep(index)}>{String(index + 1).padStart(2, '0')} {item.title}</button>)}</div>
      <div className={styles.panel}>{content}</div>
      <div className={styles.actions}>
        <Button variant="ghost" size="medium" onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))} disabled={currentStep === 0}>上一步</Button>
        {currentStep === STEPS.length - 1 ? <Button variant="primary" size="medium" onClick={handleComplete}>生成需求结果</Button> : <Button variant="primary" size="medium" onClick={() => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))}>下一步</Button>}
      </div>
    </ProjectStageShell>
  );
}
