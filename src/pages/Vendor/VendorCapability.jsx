import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
import { useIntegratorPath, useProject } from '../../hooks/useProject';
import { CAPABILITY_OPTIONS, PRODUCT_TYPES, CAPABILITY_CATEGORIES, getCapabilityDisplay } from '../../data/capabilities';
import styles from './VendorCapability.module.css';

const EVIDENCE_OPTIONS = ['厂家声明', '测试报告', '第三方评估', '认证材料', '项目案例'];
const SATISFACTION_OPTIONS = [{ value: 'fulfilled', label: '满足' }, { value: 'partial', label: '部分满足' }, { value: 'missing', label: '不满足' }, { value: 'external', label: '需外部补偿' }, { value: 'na', label: '不适用' }];
const FLAT_CAPABILITIES = Object.entries(CAPABILITY_OPTIONS).flatMap(([category, options]) => options.map((option) => ({ ...option, category })));
const PRODUCT_TYPE_HINTS = { plc: ['auth', 'access', 'integrity'], scada: ['auth', 'access', 'logging', 'audit'], hmi: ['auth', 'access', 'logging'], firewall: ['access', 'encryption', 'logging', 'audit'], switch: ['access', 'logging'], ids: ['logging', 'audit', 'integrity'], endpoint: ['auth', 'access', 'integrity', 'logging', 'audit'], gateway: ['auth', 'access', 'encryption', 'logging'], sensor: ['integrity'], sis: ['auth', 'access', 'integrity', 'logging'] };
const STEPS = [
  { id: 'product', title: '产品信息' },
  { id: 'claims', title: '能力声明' },
  { id: 'scope', title: '边界与依赖' },
  { id: 'evidence', title: '证据与限制' },
  { id: 'summary', title: '声明汇总' }
];

function resolveApplicability(productType, category) {
  if (!productType) return { label: '待选择产品类型', tone: 'neutral' };
  const suggested = PRODUCT_TYPE_HINTS[productType] || [];
  if (suggested.includes(category)) return { label: '更适用', tone: 'fit' };
  return { label: '可补充评估', tone: 'neutral' };
}

function FieldHint({ text }) {
  return <div className={styles.metaText}>{text}</div>;
}

export function VendorCapability() {
  const navigate = useNavigate();
  const { state, actions } = useProject();
  const { plan } = useIntegratorPath();
  const [filter, setFilter] = useState('required');
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(() => state.vendorCatalog?.draft || { productMeta: { productName: '', productType: '', securityLevel: 2, deploymentScope: '' }, capabilityClaims: [], dependencies: '', limitations: '' });
  const selectedClaims = useMemo(() => new Map(formData.capabilityClaims.map((item) => [item.capabilityId, item])), [formData.capabilityClaims]);
  const requirementRows = useMemo(() => plan?.capabilityRequirements || [], [plan]);
  const requirementIds = useMemo(() => new Set(requirementRows.map((item) => item.capabilityId)), [requirementRows]);
  const visibleCapabilities = useMemo(() => FLAT_CAPABILITIES.filter((item) => filter === 'required' ? requirementIds.has(item.id) : true), [filter, requirementIds]);
  const selectedProductType = PRODUCT_TYPES.find((type) => type.id === formData.productMeta.productType);
  const claimedRequiredCount = requirementRows.filter((item) => selectedClaims.has(item.capabilityId)).length;
  const isSummaryStep = currentStep === STEPS.length - 1;
  const step = STEPS[currentStep];

  useEffect(() => {
    actions.setVendorDraft(formData);
  }, [formData]);

  const updateProductMeta = (field, value) => setFormData((prev) => ({ ...prev, productMeta: { ...prev.productMeta, [field]: value } }));

  const updateClaim = (capabilityId, patch) => setFormData((prev) => {
    const existing = prev.capabilityClaims.find((item) => item.capabilityId === capabilityId);
    const base = existing || { capabilityId, satisfaction: 'fulfilled', implementationType: 'product', evidenceType: '厂家声明', claimScope: '', dependencyNote: '', limitationNote: '' };
    const nextClaim = { ...base, ...patch };
    return { ...prev, capabilityClaims: [...prev.capabilityClaims.filter((item) => item.capabilityId !== capabilityId), nextClaim] };
  });

  const removeClaim = (capabilityId) => setFormData((prev) => ({ ...prev, capabilityClaims: prev.capabilityClaims.filter((item) => item.capabilityId !== capabilityId) }));

  const handleComplete = () => {
    actions.addVendorCapability({ id: `vendor-${Date.now()}`, ...formData, requirementCoverage: requirementRows.length });
    actions.setProjectMeta({ status: 'vendor-completed' });
    navigate('/vendor/result');
  };

  let content = null;

  switch (step.id) {
    case 'product':
      content = <div className={styles.workspace}><div className={styles.topForm}><div className={styles.inputBlock}><label>产品名称</label><input value={formData.productMeta.productName} onChange={(event) => updateProductMeta('productName', event.target.value)} placeholder="MOXA EDR-G9010" /></div><div className={styles.inputBlock}><label>产品类型</label><select value={formData.productMeta.productType} onChange={(event) => updateProductMeta('productType', event.target.value)}><option value="">产品类型</option>{PRODUCT_TYPES.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}</select></div><div className={styles.inputBlock}><label>目标安全等级</label><select value={formData.productMeta.securityLevel} onChange={(event) => updateProductMeta('securityLevel', Number(event.target.value))}>{[1, 2, 3, 4].map((level) => <option key={level} value={level}>SL-{level}</option>)}</select></div><div className={styles.inputBlock}><label>部署范围</label><input value={formData.productMeta.deploymentScope} onChange={(event) => updateProductMeta('deploymentScope', event.target.value)} placeholder="制造区 DMZ 远程维护边界" /></div></div><div className={styles.modeHint}>当前项目共有 {requirementRows.length} 条重点能力要求，建议先填写边界设备基本信息，再逐步完成能力声明与证据补充。</div><div className={styles.productHint}>{selectedProductType ? `当前选择：${selectedProductType.name}` : '请选择产品类型，系统会给出更适用的能力提示。'}</div></div>;
      break;
    case 'claims':
      content = <div className={styles.workspace}><div className={styles.toolbarRow}><Button variant={filter === 'required' ? 'primary' : 'secondary'} size="small" onClick={() => setFilter('required')}>项目要求</Button><Button variant={filter === 'all' ? 'primary' : 'secondary'} size="small" onClick={() => setFilter('all')}>产品全量能力</Button></div><table className={styles.table}><thead><tr><th>项目要求</th><th>来源</th><th>适用提示</th><th>满足度</th><th>实现方式</th><th>操作</th></tr></thead><tbody>{visibleCapabilities.length === 0 ? <tr><td colSpan="6">暂无数据</td></tr> : visibleCapabilities.map((capability) => { const claim = selectedClaims.get(capability.id); const applicability = resolveApplicability(formData.productMeta.productType, capability.category); const requirement = requirementRows.find((item) => item.capabilityId === capability.id); return <tr key={capability.id} className={requirementIds.has(capability.id) ? styles.requiredRow : ''}><td><strong>{getCapabilityDisplay(capability.id).label}</strong><div className={styles.capabilityMeta}><span className={styles.standardTag}>{getCapabilityDisplay(capability.id).frText}</span><span className={styles.standardTag}>{getCapabilityDisplay(capability.id).srText}</span></div><div className={styles.metaText}>{getCapabilityDisplay(capability.id).description}</div></td><td>{requirement ? <div><div>{requirement.controlObjective}</div><div className={styles.metaText}>{requirement.implementationHint}</div></div> : '产品补充项'}</td><td><span className={`${styles.appTag} ${applicability.tone === 'fit' ? styles.appTagFit : styles.appTagNeutral}`}>{applicability.label}</span><div className={styles.metaText}>{CAPABILITY_CATEGORIES[capability.category]?.name || capability.category}</div></td><td><select value={claim?.satisfaction || 'fulfilled'} onChange={(event) => updateClaim(capability.id, { satisfaction: event.target.value })}>{SATISFACTION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></td><td><select value={claim?.implementationType || 'product'} onChange={(event) => updateClaim(capability.id, { implementationType: event.target.value })}><option value="product">由产品实现</option><option value="external">由外围系统实现</option><option value="shared">产品+系统共同实现</option></select></td><td><Button variant="ghost" size="small" onClick={() => removeClaim(capability.id)}>清除</Button></td></tr>; })}</tbody></table></div>;
      break;
    case 'scope':
      content = <div className={styles.workspace}><div className={styles.modeHint}>补充每项能力的适用边界、外部依赖和使用约束，便于后续做闭环与交付说明。</div><table className={styles.table}><thead><tr><th>能力项</th><th>边界范围</th><th>依赖说明</th><th>限制说明</th></tr></thead><tbody>{formData.capabilityClaims.length === 0 ? <tr><td colSpan="4">请先在上一步至少声明一项能力</td></tr> : formData.capabilityClaims.map((claim) => <tr key={claim.capabilityId}><td><strong>{getCapabilityDisplay(claim.capabilityId).label}</strong></td><td><input value={claim.claimScope || ''} onChange={(event) => updateClaim(claim.capabilityId, { claimScope: event.target.value })} placeholder="仅适用于本机管理与远程接入登录" /></td><td><input value={claim.dependencyNote || ''} onChange={(event) => updateClaim(claim.capabilityId, { dependencyNote: event.target.value })} placeholder="需对接集中身份管理或日志平台" /></td><td><input value={claim.limitationNote || ''} onChange={(event) => updateClaim(claim.capabilityId, { limitationNote: event.target.value })} placeholder="细粒度授权需额外模块或特定版本支持" /></td></tr>)}</tbody></table><div className={styles.bottomBar}><div className={styles.inputBlock}><label>统一依赖</label><textarea value={formData.dependencies} onChange={(event) => setFormData((prev) => ({ ...prev, dependencies: event.target.value }))} placeholder="集中身份管理、日志平台、证书体系和边界防护设备" /></div><div className={styles.inputBlock}><label>统一限制</label><textarea value={formData.limitations} onChange={(event) => setFormData((prev) => ({ ...prev, limitations: event.target.value }))} placeholder="部分高级授权能力需授权开启，旧版本不支持完整审计功能" /></div></div></div>;
      break;
    case 'evidence':
      content = <div className={styles.workspace}><div className={styles.modeHint}>为已声明能力选择证据类型，便于形成类似 MOXA EDR-G9010 边界设备的可追踪能力声明依据。</div><table className={styles.table}><thead><tr><th>能力项</th><th>满足度</th><th>证据类型</th><th>实现方式</th></tr></thead><tbody>{formData.capabilityClaims.length === 0 ? <tr><td colSpan="4">请先在前面步骤声明能力</td></tr> : formData.capabilityClaims.map((claim) => <tr key={claim.capabilityId}><td><strong>{getCapabilityDisplay(claim.capabilityId).label}</strong></td><td>{SATISFACTION_OPTIONS.find((option) => option.value === claim.satisfaction)?.label || claim.satisfaction}</td><td><select value={claim.evidenceType || '厂家声明'} onChange={(event) => updateClaim(claim.capabilityId, { evidenceType: event.target.value })}>{EVIDENCE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></td><td><select value={claim.implementationType || 'product'} onChange={(event) => updateClaim(claim.capabilityId, { implementationType: event.target.value })}><option value="product">由产品实现</option><option value="external">由外围系统实现</option><option value="shared">产品+系统共同实现</option></select></td></tr>)}</tbody></table></div>;
      break;
    default:
      content = <div className={styles.page}><div className={styles.summaryGrid}><div><span>产品名称</span><strong>{formData.productMeta.productName || '未填写'}</strong></div><div><span>产品类型</span><strong>{selectedProductType?.name || '未填写'}</strong></div><div><span>目标安全等级</span><strong>SL-{formData.productMeta.securityLevel || 2}</strong></div><div><span>部署范围</span><strong>{formData.productMeta.deploymentScope || '未填写'}</strong></div><div><span>项目要求覆盖</span><strong>{claimedRequiredCount} / {requirementRows.length}</strong></div><div><span>已声明能力</span><strong>{formData.capabilityClaims.length}</strong></div></div><div className={styles.summaryGrid}><div><span>统一依赖</span><strong>{formData.dependencies || '未填写'}</strong></div><div><span>统一限制</span><strong>{formData.limitations || '未填写'}</strong></div></div><div className={styles.modeHint}>确认上述信息后即可生成设备能力结果页，并进入闭环。</div></div>;
  }

  return (
    <ProjectStageShell stageNumber="03" title="能力" projectName={state.projectMeta?.projectName} outputLabel={`步骤 ${currentStep + 1}/${STEPS.length} · ${step.title}`} prevAction={{ to: '/integrator/result', label: '上一步' }}>
      <section className={styles.workspace}>
        <div className={styles.stepTabs}>{STEPS.map((item, index) => <button key={item.id} type="button" className={`${styles.stepTab} ${index === currentStep ? styles.stepTabActive : ''}`} onClick={() => setCurrentStep(index)}>{String(index + 1).padStart(2, '0')} {item.title}</button>)}</div>
        <div className={styles.panel}>{content}</div>
        <div className={styles.navBar}>
          {currentStep === 0 ? <Button variant="ghost" size="medium" onClick={() => navigate('/integrator/result')}>返回设计结果</Button> : <Button variant="ghost" size="medium" onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}>上一步</Button>}
          {isSummaryStep ? <Button variant="primary" size="medium" onClick={handleComplete}>生成能力结果</Button> : <Button variant="primary" size="medium" onClick={() => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))}>下一步</Button>}
        </div>
      </section>
    </ProjectStageShell>
  );
}
