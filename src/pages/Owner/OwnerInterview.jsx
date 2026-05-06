import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
import { useProject } from '../../hooks/useProject';
import { generateRiskProfile } from '../../utils/riskEngine';
import { ACCEPTANCE_PREFERENCE_OPTIONS, REMOTE_OWNERSHIP_OPTIONS } from '../../data/enums';
import { INDUSTRIES } from '../../data/industries';
import styles from './OwnerInterview.module.css';

const IMPACT_LEVEL_SCORE = { low: 1, medium: 2, high: 3 };

const STEPS = [
  { id: 'industry', title: '项目场景' },
  { id: 'impacts', title: '业务后果' },
  { id: 'exposure', title: '暴露面' },
  { id: 'maturity', title: '现状基础' },
  { id: 'constraints', title: '约束条件' },
  { id: 'assets', title: '关键对象' },
  { id: 'summary', title: '需求汇总' }
];

function ImpactRadarChart({ fields, values }) {
  const size = 320;
  const center = size / 2;
  const maxRadius = 96;
  const levels = 3;

  const points = fields.map((field, index) => {
    const angle = (-Math.PI / 2) + ((Math.PI * 2) / fields.length) * index;
    const score = IMPACT_LEVEL_SCORE[values[field.key]] || 0;
    const radius = (score / levels) * maxRadius;
    const labelRadius = maxRadius + 42;
    const rawLabelX = center + Math.cos(angle) * labelRadius;
    const rawLabelY = center + Math.sin(angle) * labelRadius;
    const labelX = Math.max(34, Math.min(size - 34, rawLabelX));
    const labelY = Math.max(22, Math.min(size - 22, rawLabelY));
    const textAnchor = rawLabelX < center - 10 ? 'end' : rawLabelX > center + 10 ? 'start' : 'middle';

    return {
      ...field,
      score,
      angle,
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
      axisX: center + Math.cos(angle) * maxRadius,
      axisY: center + Math.sin(angle) * maxRadius,
      labelX,
      labelY,
      textAnchor
    };
  });

  const polygon = points.map((point) => `${point.x},${point.y}`).join(' ');
  const rings = Array.from({ length: levels }, (_, index) => {
    const radius = ((index + 1) / levels) * maxRadius;
    return points.map((point) => `${center + Math.cos(point.angle) * radius},${center + Math.sin(point.angle) * radius}`).join(' ');
  });

  return (
    <div className={styles.radarCard}>
      <div className={styles.radarHeader}>
        <div>
          <strong>安全需求关注画像</strong>
          <span>基于业务后果维度自动生成，用于快速识别当前项目的安全需求侧重点。</span>
        </div>
      </div>
      <div className={styles.radarLayout}>
        <svg viewBox={`0 0 ${size} ${size}`} className={styles.radarSvg} role="img" aria-label="安全需求关注画像雷达图">
          {rings.map((ring, index) => <polygon key={index} points={ring} className={styles.radarRing} />)}
          {points.map((point) => <line key={point.key} x1={center} y1={center} x2={point.axisX} y2={point.axisY} className={styles.radarAxis} />)}
          <polygon points={polygon} className={styles.radarArea} />
          {points.map((point) => <circle key={`${point.key}-dot`} cx={point.x} cy={point.y} r="4" className={styles.radarDot} />)}
          {points.map((point) => (
            <text
              key={`${point.key}-label`}
              x={point.labelX}
              y={point.labelY}
              textAnchor={point.textAnchor}
              dominantBaseline="middle"
              className={styles.radarLabel}
            >
              {point.label}
            </text>
          ))}
        </svg>

        <div className={styles.radarLegend}>
          {points.map((point) => (
            <div key={point.key} className={styles.radarLegendItem}>
              <strong>{point.label}</strong>
              <span>{resolveLevel(values[point.key])}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const IMPACT_FIELDS = [
  { key: 'safetyImpact', label: '人身安全', hint: '关注异常情况下对人员伤害、误操作和现场安全事件的影响。', levels: { low: '局部影响，可通过现场处置避免人员伤害。', medium: '存在人员受伤风险，需要专项控制和干预。', high: '可能导致严重伤害或重大安全事故。' } },
  { key: 'environmentalImpact', label: '环境影响', hint: '关注异常情况下对排放、泄漏、污染和环境事件的影响。', levels: { low: '影响局限，可在现场快速控制和恢复。', medium: '可能造成明显环境事件，需要外部协同处理。', high: '可能引发重大污染、泄漏或长期环境影响。' } },
  { key: 'productionImpact', label: '产能连续性', hint: '关注异常情况下对生产节拍、关键工序和连续运行的影响。', levels: { low: '局部波动，对整体产能影响有限。', medium: '会造成明显降产或阶段性中断。', high: '可能导致关键产线停产或长时间中断。' } },
  { key: 'qualityImpact', label: '质量一致性', hint: '关注异常情况下对产品质量、批次稳定性和工艺参数的影响。', levels: { low: '对质量影响有限，通常可通过复检或调整恢复。', medium: '会造成批次波动、返工或部分报废。', high: '可能导致大批量报废或关键质量失控。' } },
  { key: 'financialImpact', label: '财务损失', hint: '关注异常情况下带来的停机损失、恢复成本、赔付或额外支出。', levels: { low: '经济损失可控，通常在日常处置范围内。', medium: '会形成明显损失，需要专项预算或补救措施。', high: '可能带来重大经济损失或长期财务影响。' } },
  { key: 'complianceImpact', label: '监管合规', hint: '关注异常情况下对监管要求、审计结论和合规义务的影响。', levels: { low: '影响有限，可通过整改闭环解决。', medium: '可能触发审计问题、整改要求或合同约束。', high: '可能导致重大违规、处罚或许可风险。' } },
  { key: 'brandImpact', label: '品牌声誉', hint: '关注异常情况下对客户信任、市场形象和公众舆论的影响。', levels: { low: '影响局部，通常不会造成持续性声誉损伤。', medium: '会造成明显客户疑虑或外部负面反馈。', high: '可能引发重大舆情、客户流失或长期信任受损。' } }
];

const EXPOSURE_FIELDS = [
  { key: 'remoteAccessNeed', label: '远程运维', hint: '判断项目是否存在跨区域、跨组织或长期保留的远程诊断、维护与支持场景。', options: [ { value: 'none', label: '无远程运维', description: '维护和诊断主要依赖现场人员，不保留常态远程访问路径。' }, { value: 'limited', label: '有限远程运维', description: '仅在特定故障、调试或支持场景下临时远程接入。' }, { value: 'extensive', label: '广泛远程运维', description: '远程访问较常见，涉及日常监控、维护或远程支持。' } ] },
  { key: 'thirdPartyAccess', label: '第三方接入', hint: '判断设备商、集成商、运维服务商等外部单位是否需要接入项目系统。', options: [ { value: 'none', label: '无第三方接入', description: '系统访问主要由业主内部团队承担，不涉及外部单位接入。' }, { value: 'occasional', label: '偶尔接入', description: '仅在项目交付、故障处理或专项支持时由第三方接入。' }, { value: 'regular', label: '频繁接入', description: '第三方接入较常见，涉及持续维护、驻场支持或远程服务。' } ] }
];

const MATURITY_FIELDS = [
  { key: 'networkSegmentationMaturity', label: '网络隔离', hint: '判断现有工业网络是否已按区域、边界和访问路径进行基本隔离。', levels: { low: '网络边界不清，生产、管理或远程访问之间缺少有效隔离。', medium: '已存在部分区域划分和边界控制，但仍有例外链路或临时放通。', high: '已形成较清晰的分区分域和访问控制机制，边界管理相对完善。' } },
  { key: 'identityMaturity', label: '身份管理', hint: '判断账号、权限、共享口令和身份责任是否已得到基本控制。', levels: { low: '共享账号较多，权限边界不清，身份管理依赖人工约定。', medium: '关键账号已有区分和管理，但审批、回收或审计仍不完整。', high: '账号分级、权限控制和身份责任较清晰，管理机制相对稳定。' } },
  { key: 'loggingMaturity', label: '日志审计', hint: '判断关键操作、登录行为和事件追溯是否具备基本记录与查看能力。', levels: { low: '日志留存有限，出现问题时较难还原过程。', medium: '关键系统已有日志，但覆盖范围、留存周期或分析能力不足。', high: '关键行为具备较稳定的留痕与审计基础，支持追溯和复盘。' } },
  { key: 'patchMaturity', label: '补丁维护', hint: '判断系统更新、补丁评估和版本维护是否具备基本流程。', levels: { low: '补丁更新依赖临时安排，缺少稳定评估和发布机制。', medium: '关键设备有补丁维护安排，但节奏、窗口或兼容性管理不稳定。', high: '已形成相对明确的补丁评估、测试和发布维护机制。' } }
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

function OptionCards({ value, onChange, options }) {
  return <div className={styles.optionHints}>{options.map((option) => <button key={option.value} type="button" className={`${styles.optionHint} ${value === option.value ? styles.optionHintActive : ''}`} onClick={() => onChange(option.value)}><strong>{option.label}</strong><span>{option.description}</span></button>)}</div>;
}
function LevelCards({ field, value, onChange }) {
  return <div className={styles.optionHints}>{Object.entries(field.levels).map(([level, text]) => <button key={level} type="button" className={`${styles.optionHint} ${value === level ? styles.optionHintActive : ''}`} onClick={() => onChange(level)}><strong>{level === 'low' ? '低' : level === 'medium' ? '中' : '高'}</strong><span>{text}</span></button>)}</div>;
}
function resolveLevel(value) { return value === 'low' ? '低' : value === 'medium' ? '中' : value === 'high' ? '高' : '未填写'; }

export function OwnerInterview() {
  const navigate = useNavigate();
  const { state, actions } = useProject();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(() => state.ownerProfile?.draft || {
    projectName: state.projectMeta?.projectName || '',
    industry: state.projectMeta?.industry || '',
    safetyImpact: '', environmentalImpact: '', productionImpact: '', qualityImpact: '', financialImpact: '', complianceImpact: '', brandImpact: '',
    remoteAccessNeed: '', thirdPartyAccess: '',
    networkSegmentationMaturity: '', identityMaturity: '', loggingMaturity: '', patchMaturity: '',
    maintenanceWindow: '', upgradeWindow: '', remoteOperationsOwnership: 'shared', acceptancePreference: 'security-first', criticalAssets: []
  });

  const step = STEPS[currentStep];
  const updateField = (field, value) => setFormData((prev) => { const next = { ...prev, [field]: value }; actions.setOwnerDraft(next); return next; });
  const toggleAsset = (item) => setFormData((prev) => { const next = { ...prev, criticalAssets: prev.criticalAssets.includes(item) ? prev.criticalAssets.filter((entry) => entry !== item) : [...prev.criticalAssets, item] }; actions.setOwnerDraft(next); return next; });

  const selectedIndustry = INDUSTRIES.find((item) => item.id === (state.projectMeta?.industry || formData.industry));
  const acceptanceOption = ACCEPTANCE_PREFERENCE_OPTIONS.find((item) => item.value === formData.acceptancePreference);
  const ownershipOption = REMOTE_OWNERSHIP_OPTIONS.find((item) => item.value === formData.remoteOperationsOwnership);

  const handleFinalizeSummary = () => {
    const projectName = formData.projectName || state.projectMeta?.projectName || `${formData.industry || '工业项目'} IEC 62443 需求访谈`;
    const nextForm = { ...formData, projectName, industry: formData.industry || state.projectMeta?.industry || '' };
    actions.setProjectMeta({ projectName, industry: nextForm.industry, status: 'owner-completed' });
    actions.setOwnerAssessment(nextForm);
    actions.setProjectName(projectName);
    actions.setRiskProfile(generateRiskProfile(nextForm));
    navigate('/integrator');
  };

  const handleExport = () => window.print();

  let content = null;
  switch (step.id) {
    case 'industry':
      content = <div className={styles.infoTable}><div><span>项目名称</span><strong>{state.projectMeta?.projectName || '未填写'}</strong></div><div><span>行业</span><strong>{selectedIndustry?.name || '未填写'}</strong></div><div><span>业主单位</span><strong>{state.projectMeta?.organizationName || '未填写'}</strong></div><div><span>站点</span><strong>{state.projectMeta?.siteName || '未填写'}</strong></div></div>;
      break;
    case 'impacts':
      content = <table className={styles.matrix}><thead><tr><th>后果项</th><th>选择</th></tr></thead><tbody>{IMPACT_FIELDS.map((field) => <tr key={field.key}><td><div className={styles.fieldInfo}><strong>{field.label}</strong><span>{field.hint}</span></div></td><td><LevelCards field={field} value={formData[field.key]} onChange={(value) => updateField(field.key, value)} /></td></tr>)}</tbody></table>;
      break;
    case 'exposure':
      content = <table className={styles.matrix}><thead><tr><th>项目项</th><th>选择</th></tr></thead><tbody>{EXPOSURE_FIELDS.map((field) => <tr key={field.key}><td><div className={styles.fieldInfo}><strong>{field.label}</strong><span>{field.hint}</span></div></td><td><OptionCards value={formData[field.key]} onChange={(value) => updateField(field.key, value)} options={field.options} /></td></tr>)}</tbody></table>;
      break;
    case 'maturity':
      content = <table className={styles.matrix}><thead><tr><th>基础项</th><th>选择</th></tr></thead><tbody>{MATURITY_FIELDS.map((field) => <tr key={field.key}><td><div className={styles.fieldInfo}><strong>{field.label}</strong><span>{field.hint}</span></div></td><td><LevelCards field={field} value={formData[field.key]} onChange={(value) => updateField(field.key, value)} /></td></tr>)}</tbody></table>;
      break;
    case 'constraints':
      content = <div className={styles.stack}><div className={styles.formLine}><input value={formData.maintenanceWindow} onChange={(event) => updateField('maintenanceWindow', event.target.value)} placeholder="常规维护窗口" /><input value={formData.upgradeWindow} onChange={(event) => updateField('upgradeWindow', event.target.value)} placeholder="改造窗口" /></div><table className={styles.matrix}><thead><tr><th>约束项</th><th>选择</th></tr></thead><tbody><tr><td><div className={styles.fieldInfo}><strong>责任归属</strong><span>判断远程运维账号、审批、执行和审计主要由哪一方承担。</span></div></td><td><OptionCards value={formData.remoteOperationsOwnership} onChange={(value) => updateField('remoteOperationsOwnership', value)} options={REMOTE_OWNERSHIP_OPTIONS} /></td></tr><tr><td><div className={styles.fieldInfo}><strong>验收偏好</strong><span>判断项目当前更偏向功能上线、安全控制还是运维可操作性的验收侧重点。</span></div></td><td><OptionCards value={formData.acceptancePreference} onChange={(value) => updateField('acceptancePreference', value)} options={ACCEPTANCE_PREFERENCE_OPTIONS} /></td></tr></tbody></table></div>;
      break;
    case 'assets':
      content = <div className={styles.stack}><div className={styles.guideText}>请选择本项目中最关键、最需要优先纳入安全设计与保护范围的对象。</div><div className={styles.assetMatrix}>{ASSETS.map((asset) => <button key={asset.id} type="button" className={`${styles.assetCell} ${formData.criticalAssets.includes(asset.id) ? styles.assetActive : ''}`} onClick={() => toggleAsset(asset.id)}>{asset.name}</button>)}</div></div>;
      break;
    default:
      content = (
        <article className={styles.documentPage}>
          <header className={styles.documentHeader}>
            <span>IEC 62443 需求访谈摘要</span>
            <h2>{formData.projectName || state.projectMeta?.projectName || '未命名项目'}</h2>
            <p>本摘要基于业主访谈输入自动整理生成，可用于项目留档、内部确认以及向集成商传递设计输入。</p>
          </header>

          <section className={styles.documentSection}>
            <h3>一、项目概况</h3>
            <div className={styles.documentGrid}>
              <div><span>项目名称</span><strong>{formData.projectName || state.projectMeta?.projectName || '未填写'}</strong></div>
              <div><span>行业场景</span><strong>{selectedIndustry?.name || '未填写'}</strong></div>
              <div><span>业主单位</span><strong>{state.projectMeta?.organizationName || '未填写'}</strong></div>
              <div><span>项目站点</span><strong>{state.projectMeta?.siteName || '未填写'}</strong></div>
              <div><span>项目类型</span><strong>{state.projectMeta?.scenarioType || '未填写'}</strong></div>
              <div><span>项目目标</span><strong>{state.projectMeta?.projectObjective || '未填写'}</strong></div>
            </div>
          </section>

          <section className={styles.documentSection}>
            <ImpactRadarChart fields={IMPACT_FIELDS} values={formData} />
          </section>

          <section className={styles.documentSection}>
            <h3>二、业务后果判断</h3>
            <div className={styles.documentList}>
              {IMPACT_FIELDS.map((field) => {
                const currentLevel = formData[field.key];
                const currentText = currentLevel ? field.levels[currentLevel] : '未填写';
                return <div key={field.key} className={styles.documentEntry}><div className={styles.documentEntryHead}><strong>{field.label}</strong><span>{resolveLevel(currentLevel)}</span></div><p>{currentText}</p></div>;
              })}
            </div>
          </section>

          <section className={styles.documentSection}>
            <h3>三、暴露面与运维方式</h3>
            <div className={styles.documentList}>
              {EXPOSURE_FIELDS.map((field) => {
                const currentOption = field.options.find((item) => item.value === formData[field.key]);
                return <div key={field.key} className={styles.documentEntry}><div className={styles.documentEntryHead}><strong>{field.label}</strong><span>{currentOption?.label || '未填写'}</span></div><p>{currentOption?.description || '未填写'}</p></div>;
              })}
              <div className={styles.documentEntry}><div className={styles.documentEntryHead}><strong>责任归属</strong><span>{ownershipOption?.label || '未填写'}</span></div><p>{ownershipOption?.description || '未填写'}</p></div>
            </div>
          </section>

          <section className={styles.documentSection}>
            <h3>四、现状基础</h3>
            <div className={styles.documentList}>
              {MATURITY_FIELDS.map((field) => {
                const currentLevel = formData[field.key];
                const currentText = currentLevel ? field.levels[currentLevel] : '未填写';
                return <div key={field.key} className={styles.documentEntry}><div className={styles.documentEntryHead}><strong>{field.label}</strong><span>{resolveLevel(currentLevel)}</span></div><p>{currentText}</p></div>;
              })}
            </div>
          </section>

          <section className={styles.documentSection}>
            <h3>五、关键约束</h3>
            <div className={styles.documentList}>
              <div className={styles.documentEntry}><div className={styles.documentEntryHead}><strong>常规维护窗口</strong><span>{formData.maintenanceWindow || '未填写'}</span></div><p>用于判断项目日常维护和变更实施可安排的正常时间窗口。</p></div>
              <div className={styles.documentEntry}><div className={styles.documentEntryHead}><strong>改造窗口</strong><span>{formData.upgradeWindow || '未填写'}</span></div><p>用于判断系统升级、切换或改造工作可接受的施工与停机安排。</p></div>
              <div className={styles.documentEntry}><div className={styles.documentEntryHead}><strong>验收偏好</strong><span>{acceptanceOption?.label || '未填写'}</span></div><p>{acceptanceOption?.description || '未填写'}</p></div>
            </div>
          </section>

          <section className={styles.documentSection}>
            <h3>六、关键对象</h3>
            <div className={styles.assetSummary}>{formData.criticalAssets.length ? formData.criticalAssets.map((item) => <span key={item} className={styles.assetTag}>{ASSETS.find((asset) => asset.id === item)?.name || item}</span>) : <span className={styles.emptyText}>未选择</span>}</div>
          </section>
        </article>
      );
  }

  const isSummaryStep = currentStep === STEPS.length - 1;

  return (
    <ProjectStageShell
      stageNumber="01"
      title="需求"
      projectName={state.projectMeta?.projectName || formData.projectName}
      outputLabel={`步骤 ${currentStep + 1}/${STEPS.length} · ${step.title}`}
      guidance={{ summary: '本页用于整理项目需求、风险关注点与约束条件，形成后续设计阶段的输入依据。', role: '业主 / 需求提出方', usage: '按步骤完成填写，并在需求汇总页确认后进入设计阶段' }}
    >
      <div className={styles.stepTabs}>{STEPS.map((item, index) => <button key={item.id} type="button" className={`${styles.stepTab} ${index === currentStep ? styles.stepTabActive : ''}`} onClick={() => setCurrentStep(index)}>{String(index + 1).padStart(2, '0')} {item.title}</button>)}</div>
      <div className={`${styles.panel} ${isSummaryStep ? styles.documentPanel : ''}`}>{content}</div>
      <div className={styles.actions}>
        {currentStep === 0 ? <Link to="/project"><Button variant="ghost" size="medium">上一步</Button></Link> : <Button variant="ghost" size="medium" onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}>上一步</Button>}
        {isSummaryStep ? <div className={styles.summaryActions}><Button variant="secondary" size="medium" onClick={handleExport}>保存/导出</Button><Button variant="primary" size="medium" onClick={handleFinalizeSummary}>进入设计</Button></div> : <Button variant="primary" size="medium" onClick={() => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))}>下一步</Button>}
      </div>
    </ProjectStageShell>
  );
}
