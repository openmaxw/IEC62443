import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
import { useIntegratorPath, useProject } from '../../hooks/useProject';
import { CAPABILITY_OPTIONS, PRODUCT_TYPES, CAPABILITY_CATEGORIES } from '../../data/capabilities';
import { MATCH_STATUS_OPTIONS } from '../../data/matchStatuses';
import styles from './VendorCapability.module.css';

const EVIDENCE_OPTIONS = ['厂家声明', '测试报告', '第三方评估', '认证材料', '项目案例'];
const FLAT_CAPABILITIES = Object.entries(CAPABILITY_OPTIONS).flatMap(([category, options]) => options.map((option) => ({ ...option, category })));
const PRODUCT_TYPE_HINTS = {
  plc: ['auth', 'access', 'integrity'],
  scada: ['auth', 'access', 'logging', 'audit'],
  hmi: ['auth', 'access', 'logging'],
  firewall: ['access', 'encryption', 'logging', 'audit'],
  switch: ['access', 'logging'],
  ids: ['logging', 'audit', 'integrity'],
  endpoint: ['auth', 'access', 'integrity', 'logging', 'audit'],
  gateway: ['auth', 'access', 'encryption', 'logging'],
  sensor: ['integrity'],
  sis: ['auth', 'access', 'integrity', 'logging']
};

function resolveApplicability(productType, category) {
  if (!productType) return { label: '待选择产品类型', tone: 'neutral' };
  const suggested = PRODUCT_TYPE_HINTS[productType] || [];
  if (suggested.includes(category)) return { label: '更适用', tone: 'fit' };
  return { label: '可补充评估', tone: 'neutral' };
}

export function VendorCapability() {
  const navigate = useNavigate();
  const { state, actions } = useProject();
  const { plan } = useIntegratorPath();
  const [filter, setFilter] = useState('required');
  const [formData, setFormData] = useState(() => state.vendorCatalog?.draft || { productMeta: { productName: '', productType: '', securityLevel: 2, deploymentScope: '' }, capabilityClaims: [], dependencies: '', limitations: '' });
  const selectedClaims = useMemo(() => new Map(formData.capabilityClaims.map((item) => [item.capabilityId, item])), [formData.capabilityClaims]);
  const requirementIds = useMemo(() => new Set((plan?.capabilityRequirements || []).map((item) => item.capabilityId)), [plan]);
  const visibleCapabilities = useMemo(() => FLAT_CAPABILITIES.filter((item) => filter === 'required' ? requirementIds.has(item.id) : true), [filter, requirementIds]);
  const updateClaim = (capabilityId, patch) => setFormData((prev) => { const existing = prev.capabilityClaims.find((item) => item.capabilityId === capabilityId); const base = existing || { capabilityId, satisfaction: 'native', evidenceType: '厂家声明', claimScope: '' }; const nextClaim = { ...base, ...patch }; const others = prev.capabilityClaims.filter((item) => item.capabilityId !== capabilityId); const next = { ...prev, capabilityClaims: [...others, nextClaim] }; actions.setVendorDraft(next); return next; });
  const removeClaim = (capabilityId) => setFormData((prev) => { const next = { ...prev, capabilityClaims: prev.capabilityClaims.filter((item) => item.capabilityId !== capabilityId) }; actions.setVendorDraft(next); return next; });
  const handleComplete = () => { actions.addVendorCapability({ id: `vendor-${Date.now()}`, ...formData }); actions.setProjectMeta({ status: 'vendor-completed' }); navigate('/vendor/result'); };

  return (
    <ProjectStageShell
      stageNumber="03"
      title="能力"
      projectName={state.projectMeta?.projectName}
      outputLabel={`需求项 ${(plan?.capabilityRequirements || []).length} / 已声明 ${formData.capabilityClaims.length}`}
      prevAction={{ to: '/integrator', label: '上一步' }}
      guidance={{ summary: '本页用于声明产品能力、适配边界与证据方式，为后续差距分析提供输入。默认优先显示当前项目需要核对的能力项。', role: '设备商 / 产品或技术支持人员', usage: '先确认产品类型，再补充项目所需能力；如需查看完整画像，可切换到产品全量能力。' }}
      toolbar={<><Button variant={filter === 'required' ? 'primary' : 'secondary'} size="small" onClick={() => setFilter('required')}>项目所需</Button><Button variant={filter === 'all' ? 'primary' : 'secondary'} size="small" onClick={() => setFilter('all')}>产品全量能力</Button></>}
    >
      <section className={styles.workspace}>
        <div className={styles.modeHint}>默认显示“项目所需”，用于优先核对本项目真正需要的能力项；如需维护完整产品画像，可切换到“产品全量能力”。</div>

        <div className={styles.topForm}>
          <input value={formData.productMeta.productName} onChange={(event) => setFormData((prev) => { const next = { ...prev, productMeta: { ...prev.productMeta, productName: event.target.value } }; actions.setVendorDraft(next); return next; })} placeholder="产品名称" />
          <select value={formData.productMeta.productType} onChange={(event) => setFormData((prev) => { const next = { ...prev, productMeta: { ...prev.productMeta, productType: event.target.value } }; actions.setVendorDraft(next); return next; })}><option value="">产品类型</option>{PRODUCT_TYPES.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}</select>
          <select value={formData.productMeta.securityLevel} onChange={(event) => setFormData((prev) => { const next = { ...prev, productMeta: { ...prev.productMeta, securityLevel: Number(event.target.value) } }; actions.setVendorDraft(next); return next; })}>{[1,2,3,4].map((level) => <option key={level} value={level}>SL-{level}</option>)}</select>
          <input value={formData.productMeta.deploymentScope} onChange={(event) => setFormData((prev) => { const next = { ...prev, productMeta: { ...prev.productMeta, deploymentScope: event.target.value } }; actions.setVendorDraft(next); return next; })} placeholder="部署范围" />
        </div>

        <div className={styles.productHint}>IEC 62443 更强调能力要求与组件边界，而不是按 EDR 这类市场名称组织条目；这里的“产品类型”用于提示哪些能力更适合当前产品定位。</div>

        <table className={styles.table}>
          <thead><tr><th>能力项</th><th>类别</th><th>适用提示</th><th>需求</th><th>满足</th><th>证据</th><th>边界</th><th>操作</th></tr></thead>
          <tbody>
            {visibleCapabilities.length === 0 ? <tr><td colSpan="8">暂无数据</td></tr> : visibleCapabilities.map((capability) => {
              const claim = selectedClaims.get(capability.id);
              const applicability = resolveApplicability(formData.productMeta.productType, capability.category);
              return (
                <tr key={capability.id} className={requirementIds.has(capability.id) ? styles.requiredRow : ''}>
                  <td><strong>{capability.label}</strong><div className={styles.metaText}>{capability.id}</div></td>
                  <td>{CAPABILITY_CATEGORIES[capability.category]?.name || capability.category}</td>
                  <td><span className={`${styles.appTag} ${applicability.tone === 'fit' ? styles.appTagFit : styles.appTagNeutral}`}>{applicability.label}</span></td>
                  <td>{requirementIds.has(capability.id) ? '项目要求' : '可选补充'}</td>
                  <td><select value={claim?.satisfaction || 'native'} onChange={(event) => updateClaim(capability.id, { satisfaction: event.target.value })}>{MATCH_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></td>
                  <td><select value={claim?.evidenceType || '厂家声明'} onChange={(event) => updateClaim(capability.id, { evidenceType: event.target.value })}>{EVIDENCE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></td>
                  <td><input value={claim?.claimScope || ''} onChange={(event) => updateClaim(capability.id, { claimScope: event.target.value })} placeholder="适用边界 / 依赖条件" /></td>
                  <td><Button variant="ghost" size="small" onClick={() => removeClaim(capability.id)}>清除</Button></td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className={styles.bottomBar}>
          <textarea value={formData.dependencies} onChange={(event) => setFormData((prev) => { const next = { ...prev, dependencies: event.target.value }; actions.setVendorDraft(next); return next; })} placeholder="统一依赖" />
          <textarea value={formData.limitations} onChange={(event) => setFormData((prev) => { const next = { ...prev, limitations: event.target.value }; actions.setVendorDraft(next); return next; })} placeholder="已知限制" />
          <div className={styles.submitWrap}><Button variant="primary" size="medium" onClick={handleComplete}>生成能力结果</Button></div>
        </div>
      </section>
    </ProjectStageShell>
  );
}
