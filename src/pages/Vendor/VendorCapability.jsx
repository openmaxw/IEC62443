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

export function VendorCapability() {
  const navigate = useNavigate();
  const { state, actions } = useProject();
  const { plan } = useIntegratorPath();
  const [filter, setFilter] = useState('required');
  const [formData, setFormData] = useState({ productMeta: { productName: '', productType: '', securityLevel: 2, deploymentScope: '' }, capabilityClaims: [], dependencies: '', limitations: '' });
  const selectedClaims = useMemo(() => new Map(formData.capabilityClaims.map((item) => [item.capabilityId, item])), [formData.capabilityClaims]);
  const requirementIds = useMemo(() => new Set((plan?.capabilityRequirements || []).map((item) => item.capabilityId)), [plan]);
  const visibleCapabilities = useMemo(() => FLAT_CAPABILITIES.filter((item) => filter === 'required' ? requirementIds.has(item.id) : true), [filter, requirementIds]);
  const updateClaim = (capabilityId, patch) => setFormData((prev) => { const existing = prev.capabilityClaims.find((item) => item.capabilityId === capabilityId); const base = existing || { capabilityId, satisfaction: 'native', evidenceType: '厂家声明', claimScope: '' }; const nextClaim = { ...base, ...patch }; const others = prev.capabilityClaims.filter((item) => item.capabilityId !== capabilityId); return { ...prev, capabilityClaims: [...others, nextClaim] }; });
  const removeClaim = (capabilityId) => setFormData((prev) => ({ ...prev, capabilityClaims: prev.capabilityClaims.filter((item) => item.capabilityId !== capabilityId) }));
  const handleComplete = () => { actions.addVendorCapability({ id: `vendor-${Date.now()}`, ...formData }); actions.setProjectMeta({ status: 'vendor-completed' }); navigate('/vendor/result'); };

  return (
    <ProjectStageShell stageNumber="03" title="能力" projectName={state.projectMeta?.projectName} outputLabel={`需求项 ${(plan?.capabilityRequirements || []).length} / 已声明 ${formData.capabilityClaims.length}`} nextAction={{ to: '/selection', label: '下一步：差距' }} toolbar={<><Button variant={filter === 'required' ? 'primary' : 'secondary'} size="small" onClick={() => setFilter('required')}>项目需求</Button><Button variant={filter === 'all' ? 'primary' : 'secondary'} size="small" onClick={() => setFilter('all')}>全部</Button></>}>
      <section className={styles.workspace}>
        <div className={styles.topForm}>
          <input value={formData.productMeta.productName} onChange={(event) => setFormData((prev) => ({ ...prev, productMeta: { ...prev.productMeta, productName: event.target.value } }))} placeholder="产品名称" />
          <select value={formData.productMeta.productType} onChange={(event) => setFormData((prev) => ({ ...prev, productMeta: { ...prev.productMeta, productType: event.target.value } }))}><option value="">产品类型</option>{PRODUCT_TYPES.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}</select>
          <select value={formData.productMeta.securityLevel} onChange={(event) => setFormData((prev) => ({ ...prev, productMeta: { ...prev.productMeta, securityLevel: Number(event.target.value) } }))}>{[1,2,3,4].map((level) => <option key={level} value={level}>SL-{level}</option>)}</select>
          <input value={formData.productMeta.deploymentScope} onChange={(event) => setFormData((prev) => ({ ...prev, productMeta: { ...prev.productMeta, deploymentScope: event.target.value } }))} placeholder="部署范围" />
        </div>

        <table className={styles.table}>
          <thead><tr><th>能力项</th><th>类别</th><th>需求</th><th>满足</th><th>证据</th><th>边界</th><th>操作</th></tr></thead>
          <tbody>
            {visibleCapabilities.map((capability) => {
              const claim = selectedClaims.get(capability.id);
              const required = requirementIds.has(capability.id);
              return (
                <tr key={capability.id} className={required ? styles.requiredRow : ''}>
                  <td>{capability.label}</td>
                  <td>{CAPABILITY_CATEGORIES[capability.category]?.name}</td>
                  <td>{required ? '是' : '-'}</td>
                  <td><select value={claim?.satisfaction || 'native'} onChange={(event) => updateClaim(capability.id, { satisfaction: event.target.value })}>{MATCH_STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></td>
                  <td><select value={claim?.evidenceType || '厂家声明'} onChange={(event) => updateClaim(capability.id, { evidenceType: event.target.value })}>{EVIDENCE_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}</select></td>
                  <td><input value={claim?.claimScope || ''} onChange={(event) => updateClaim(capability.id, { claimScope: event.target.value })} placeholder="适用边界" /></td>
                  <td>{claim ? <Button variant="ghost" size="small" onClick={() => removeClaim(capability.id)}>移除</Button> : <Button variant="secondary" size="small" onClick={() => updateClaim(capability.id, {})}>声明</Button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className={styles.bottomBar}>
          <textarea value={formData.dependencies} onChange={(event) => setFormData((prev) => ({ ...prev, dependencies: event.target.value }))} placeholder="统一依赖" />
          <textarea value={formData.limitations} onChange={(event) => setFormData((prev) => ({ ...prev, limitations: event.target.value }))} placeholder="已知限制" />
          <div className={styles.submitWrap}><Button variant="primary" size="medium" onClick={handleComplete}>生成能力结果</Button></div>
        </div>
      </section>
    </ProjectStageShell>
  );
}
