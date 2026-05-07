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
function resolveApplicability(productType, category) { if (!productType) return { label: '待选择产品类型', tone: 'neutral' }; const suggested = PRODUCT_TYPE_HINTS[productType] || []; if (suggested.includes(category)) return { label: '更适用', tone: 'fit' }; return { label: '可补充评估', tone: 'neutral' }; }
function FieldHint({ text }) { return <div className={styles.metaText}>{text}</div>; }

export function VendorCapability() {
  const navigate = useNavigate();
  const { state, actions } = useProject();
  const { plan } = useIntegratorPath();
  const [filter, setFilter] = useState('required');
  const [formData, setFormData] = useState(() => state.vendorCatalog?.draft || { productMeta: { productName: '', productType: '', securityLevel: 2, deploymentScope: '' }, capabilityClaims: [], dependencies: '', limitations: '' });
  const selectedClaims = useMemo(() => new Map(formData.capabilityClaims.map((item) => [item.capabilityId, item])), [formData.capabilityClaims]);
  const requirementRows = useMemo(() => plan?.capabilityRequirements || [], [plan]);
  const requirementIds = useMemo(() => new Set(requirementRows.map((item) => item.capabilityId)), [requirementRows]);
  const visibleCapabilities = useMemo(() => FLAT_CAPABILITIES.filter((item) => filter === 'required' ? requirementIds.has(item.id) : true), [filter, requirementIds]);

  useEffect(() => {
    actions.setVendorDraft(formData);
  }, [formData]);

  const updateClaim = (capabilityId, patch) => setFormData((prev) => {
    const existing = prev.capabilityClaims.find((item) => item.capabilityId === capabilityId);
    const base = existing || { capabilityId, satisfaction: 'fulfilled', implementationType: 'product', evidenceType: '厂家声明', claimScope: '', dependencyNote: '', limitationNote: '' };
    const nextClaim = { ...base, ...patch };
    const others = prev.capabilityClaims.filter((item) => item.capabilityId !== capabilityId);
    const next = { ...prev, capabilityClaims: [...others, nextClaim] };
    return next;
  });

  const removeClaim = (capabilityId) => setFormData((prev) => {
    const next = { ...prev, capabilityClaims: prev.capabilityClaims.filter((item) => item.capabilityId !== capabilityId) };
    return next;
  });

  const handleComplete = () => {
    actions.addVendorCapability({ id: `vendor-${Date.now()}`, ...formData, requirementCoverage: requirementRows.length });
    actions.setProjectMeta({ status: 'vendor-completed' });
    navigate('/vendor/result');
  };

  return (
    <ProjectStageShell stageNumber="03" title="能力" projectName={state.projectMeta?.projectName} outputLabel={`需求项 ${(plan?.capabilityRequirements || []).length} / 已声明 ${formData.capabilityClaims.length}`} prevAction={{ to: '/integrator/result', label: '上一步' }} guidance={{ summary: '本页用于围绕项目要求逐条声明设备能力、边界和依赖，而不是仅维护产品画像。', role: '设备商 / 产品或技术支持人员', usage: '优先完成项目所需能力项，再补充证据、依赖条件与已知限制。' }} toolbar={<><Button variant={filter === 'required' ? 'primary' : 'secondary'} size="small" onClick={() => setFilter('required')}>项目要求</Button><Button variant={filter === 'all' ? 'primary' : 'secondary'} size="small" onClick={() => setFilter('all')}>产品全量能力</Button></>}>
      <section className={styles.workspace}>
        <div className={styles.modeHint}>默认显示“项目要求”，优先核对本项目真正需要的能力项；切换到“产品全量能力”可补充完整产品画像。</div>
        <div className={styles.topForm}>
          <input value={formData.productMeta.productName} onChange={(event) => setFormData((prev) => { const next = { ...prev, productMeta: { ...prev.productMeta, productName: event.target.value } }; return next; })} placeholder="示例：Demo Secure Gateway" />
          <select value={formData.productMeta.productType} onChange={(event) => setFormData((prev) => { const next = { ...prev, productMeta: { ...prev.productMeta, productType: event.target.value } }; return next; })}><option value="">产品类型</option>{PRODUCT_TYPES.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}</select>
          <select value={formData.productMeta.securityLevel} onChange={(event) => setFormData((prev) => { const next = { ...prev, productMeta: { ...prev.productMeta, securityLevel: Number(event.target.value) } }; return next; })}>{[1, 2, 3, 4].map((level) => <option key={level} value={level}>SL-{level}</option>)}</select>
          <div><FieldHint text="用于说明该产品在本项目中的部署位置或适用边界。" /><input value={formData.productMeta.deploymentScope} onChange={(event) => setFormData((prev) => { const next = { ...prev, productMeta: { ...prev.productMeta, deploymentScope: event.target.value } }; return next; })} placeholder="示例：DMZ 与远程维护边界" /></div>
        </div>

        <table className={styles.table}>
          <thead><tr><th>项目要求</th><th>来源</th><th>适用提示</th><th>满足度</th><th>实现方式</th><th>证据</th><th>边界/依赖/限制</th><th>操作</th></tr></thead>
          <tbody>{visibleCapabilities.length === 0 ? <tr><td colSpan="8">暂无数据</td></tr> : visibleCapabilities.map((capability) => {
            const claim = selectedClaims.get(capability.id);
            const applicability = resolveApplicability(formData.productMeta.productType, capability.category);
            const requirement = requirementRows.find((item) => item.capabilityId === capability.id);
            return <tr key={capability.id} className={requirementIds.has(capability.id) ? styles.requiredRow : ''}><td><strong>{getCapabilityDisplay(capability.id).label}</strong><div className={styles.capabilityMeta}><span className={styles.standardTag}>{getCapabilityDisplay(capability.id).frText}</span><span className={styles.standardTag}>{getCapabilityDisplay(capability.id).srText}</span></div><div className={styles.metaText}>{getCapabilityDisplay(capability.id).description}</div></td><td>{requirement ? <div><div>{requirement.controlObjective}</div><div className={styles.metaText}>{requirement.implementationHint}</div></div> : '产品补充项'}</td><td><span className={`${styles.appTag} ${applicability.tone === 'fit' ? styles.appTagFit : styles.appTagNeutral}`}>{applicability.label}</span><div className={styles.metaText}>{CAPABILITY_CATEGORIES[capability.category]?.name || capability.category}</div></td><td><select value={claim?.satisfaction || 'fulfilled'} onChange={(event) => updateClaim(capability.id, { satisfaction: event.target.value })}>{SATISFACTION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></td><td><select value={claim?.implementationType || 'product'} onChange={(event) => updateClaim(capability.id, { implementationType: event.target.value })}><option value="product">由产品实现</option><option value="external">由外围系统实现</option><option value="shared">产品+系统共同实现</option></select></td><td><select value={claim?.evidenceType || '厂家声明'} onChange={(event) => updateClaim(capability.id, { evidenceType: event.target.value })}>{EVIDENCE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></td><td><div className={styles.cellStack}><FieldHint text="适用边界用于说明该能力在哪些场景下有效；依赖条件和已知限制用于说明它不能单独假定为总是满足。" /><input value={claim?.claimScope || ''} onChange={(event) => updateClaim(capability.id, { claimScope: event.target.value })} placeholder="示例：仅适用于本机管理与远程接入登录" /><input value={claim?.dependencyNote || ''} onChange={(event) => updateClaim(capability.id, { dependencyNote: event.target.value })} placeholder="示例：需对接集中身份管理或日志平台" /><input value={claim?.limitationNote || ''} onChange={(event) => updateClaim(capability.id, { limitationNote: event.target.value })} placeholder="示例：细粒度授权需额外模块或特定版本支持" /></div></td><td><Button variant="ghost" size="small" onClick={() => removeClaim(capability.id)}>清除</Button></td></tr>;
          })}</tbody>
        </table>

        <div className={styles.bottomBar}>
          <div><FieldHint text="用于说明该产品在项目落地时统一依赖哪些外部系统、平台或基础设施。" /><textarea value={formData.dependencies} onChange={(event) => setFormData((prev) => { const next = { ...prev, dependencies: event.target.value }; return next; })} placeholder="示例：建议配合集中身份管理、日志平台、证书体系和边界防护设备" /></div>
          <div><FieldHint text="用于说明版本差异、授权条件、部署前提或已知不覆盖的能力范围。" /><textarea value={formData.limitations} onChange={(event) => setFormData((prev) => { const next = { ...prev, limitations: event.target.value }; return next; })} placeholder="示例：部分高级授权能力需授权开启，旧版本不支持完整审计功能" /></div>
          <div className={styles.submitWrap}><Button variant="primary" size="medium" onClick={handleComplete}>生成能力结果</Button></div>
        </div>
      </section>
    </ProjectStageShell>
  );
}
