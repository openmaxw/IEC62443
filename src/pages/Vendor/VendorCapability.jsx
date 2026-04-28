import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, ProgressBar } from '../../components/Common';
import { useProject } from '../../hooks/useProject';
import { CAPABILITY_OPTIONS, PRODUCT_TYPES, CAPABILITY_CATEGORIES } from '../../data/capabilities';
import { MATCH_STATUS_OPTIONS } from '../../data/matchStatuses';
import styles from './VendorCapability.module.css';

const STEPS = [
  { id: 'product', title: '产品信息', description: '填写产品基本信息和适用场景' },
  { id: 'claims', title: '能力声明', description: '声明产品具备的安全能力' },
  { id: 'evidence', title: '证据与边界', description: '说明证据类型、依赖条件和适用边界' }
];

const EVIDENCE_OPTIONS = ['厂家声明', '测试报告', '第三方评估', '认证材料', '项目案例'];

const FLAT_CAPABILITIES = Object.entries(CAPABILITY_OPTIONS).flatMap(([category, options]) => (
  options.map((option) => ({ ...option, category }))
));

export function VendorCapability() {
  const navigate = useNavigate();
  const { actions } = useProject();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    productMeta: {
      productName: '',
      productType: '',
      securityLevel: 2,
      useCases: '',
      deploymentScope: ''
    },
    capabilityClaims: [],
    evidence: [],
    dependencies: '',
    limitations: ''
  });

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const selectedClaims = useMemo(() => new Map(formData.capabilityClaims.map((item) => [item.capabilityId, item])), [formData.capabilityClaims]);

  const updateClaim = (capabilityId, patch) => {
    setFormData((prev) => {
      const existing = prev.capabilityClaims.find((item) => item.capabilityId === capabilityId);
      const base = existing || {
        capabilityId,
        satisfaction: 'native',
        securityLevel: prev.productMeta.securityLevel,
        evidenceType: '厂家声明',
        claimScope: '',
        riskNote: '',
        limitation: '',
        dependency: ''
      };

      const nextClaim = { ...base, ...patch };
      const others = prev.capabilityClaims.filter((item) => item.capabilityId !== capabilityId);
      return { ...prev, capabilityClaims: [...others, nextClaim] };
    });
  };

  const removeClaim = (capabilityId) => {
    setFormData((prev) => ({
      ...prev,
      capabilityClaims: prev.capabilityClaims.filter((item) => item.capabilityId !== capabilityId)
    }));
  };

  const handleComplete = () => {
    actions.addVendorCapability({
      id: `vendor-${Date.now()}`,
      ...formData
    });
    actions.setProjectMeta({ status: 'vendor-completed' });
    navigate('/vendor/result');
  };

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'product':
        return (
          <div className={styles.stepContent}>
            <div className={styles.formGroup}>
              <label className={styles.label}>产品名称</label>
              <input className={styles.input} value={formData.productMeta.productName} onChange={(event) => setFormData((prev) => ({ ...prev, productMeta: { ...prev.productMeta, productName: event.target.value } }))} placeholder="例如：Secure PLC Gateway" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>产品类型</label>
              <div className={styles.productTypeGrid}>
                {PRODUCT_TYPES.map((type) => (
                  <Card key={type.id} className={styles.typeCard} variant={formData.productMeta.productType === type.id ? 'accent' : 'default'} onClick={() => setFormData((prev) => ({ ...prev, productMeta: { ...prev.productMeta, productType: type.id } }))}>
                    <span>{type.name}</span>
                  </Card>
                ))}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>能力等级声明</label>
              <div className={styles.slSelector}>
                {[1, 2, 3, 4].map((level) => (
                  <button key={level} className={`${styles.slButton} ${formData.productMeta.securityLevel === level ? styles.active : ''}`} onClick={() => setFormData((prev) => ({ ...prev, productMeta: { ...prev.productMeta, securityLevel: level } }))}>
                    SL {level}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>适用场景</label>
              <textarea className={styles.textarea} value={formData.productMeta.useCases} onChange={(event) => setFormData((prev) => ({ ...prev, productMeta: { ...prev.productMeta, useCases: event.target.value } }))} placeholder="例如：适用于远程接入边界、工业 DMZ、控制器侧身份与日志强化场景" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>适用边界 / 部署范围</label>
              <textarea className={styles.textarea} value={formData.productMeta.deploymentScope} onChange={(event) => setFormData((prev) => ({ ...prev, productMeta: { ...prev.productMeta, deploymentScope: event.target.value } }))} placeholder="例如：适用于控制区边界、DMZ 网关、日志汇聚节点等" />
            </div>
          </div>
        );

      case 'claims':
        return (
          <div className={styles.stepContent}>
            {Object.entries(CAPABILITY_OPTIONS).map(([category, options]) => (
              <div key={category} className={styles.capabilityGroup}>
                <h4 className={styles.groupTitle}><Badge variant="primary">{CAPABILITY_CATEGORIES[category]?.name}</Badge></h4>
                <div className={styles.capabilityGrid}>
                  {options.map((option) => {
                    const selected = selectedClaims.has(option.id);
                    const claim = selectedClaims.get(option.id);
                    return (
                      <Card key={option.id} className={`${styles.capabilityCard} ${selected ? styles.selected : ''}`} variant={selected ? 'accent' : 'default'}>
                        <div className={styles.capabilityHeader}>
                          <strong>{option.label}</strong>
                          <Badge variant="info">{option.fr}</Badge>
                        </div>
                        <p>{option.sr?.join('、')}</p>
                        {!selected ? (
                          <Button variant="secondary" size="small" onClick={() => updateClaim(option.id, {})}>加入声明</Button>
                        ) : (
                          <div className={styles.formGroup}>
                            <select className={styles.input} value={claim.satisfaction} onChange={(event) => updateClaim(option.id, { satisfaction: event.target.value })}>
                              {MATCH_STATUS_OPTIONS.filter((item) => item.id !== 'missing').map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                            </select>
                            <select className={styles.input} value={claim.securityLevel} onChange={(event) => updateClaim(option.id, { securityLevel: Number(event.target.value) })}>
                              {[1, 2, 3, 4].map((level) => <option key={level} value={level}>SL {level}</option>)}
                            </select>
                            <Button variant="ghost" size="small" onClick={() => removeClaim(option.id)}>移除</Button>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );

      case 'evidence':
        return (
          <div className={styles.stepContent}>
            {formData.capabilityClaims.length === 0 ? (
              <p className={styles.stepHint}>请先在上一页至少声明一项能力。</p>
            ) : (
              formData.capabilityClaims.map((claim) => {
                const capability = FLAT_CAPABILITIES.find((item) => item.id === claim.capabilityId);
                return (
                  <Card key={claim.capabilityId} className={styles.capabilityCard} variant="default">
                    <div className={styles.capabilityHeader}>
                      <strong>{capability?.label || claim.capabilityId}</strong>
                      <Badge variant="warning">{claim.satisfaction}</Badge>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>证据类型</label>
                      <select className={styles.input} value={claim.evidenceType} onChange={(event) => updateClaim(claim.capabilityId, { evidenceType: event.target.value })}>
                        {EVIDENCE_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>依赖条件</label>
                      <input className={styles.input} value={claim.dependency} onChange={(event) => updateClaim(claim.capabilityId, { dependency: event.target.value })} placeholder="例如：需要外部 AAA / VPN / 日志平台支持" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>声明适用边界</label>
                      <input className={styles.input} value={claim.claimScope || ''} onChange={(event) => updateClaim(claim.capabilityId, { claimScope: event.target.value })} placeholder="例如：仅适用于边界网关模式" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>适用边界 / 限制</label>
                      <textarea className={styles.textarea} value={claim.limitation} onChange={(event) => updateClaim(claim.capabilityId, { limitation: event.target.value })} placeholder="例如：仅适用于开启证书管理时；仅在网关模式下支持" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>风险备注</label>
                      <textarea className={styles.textarea} value={claim.riskNote || ''} onChange={(event) => updateClaim(claim.capabilityId, { riskNote: event.target.value })} placeholder="例如：需结合外部审计平台，否则仅具备基础留痕能力" />
                    </div>
                  </Card>
                );
              })
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>统一依赖说明</label>
              <textarea className={styles.textarea} value={formData.dependencies} onChange={(event) => setFormData((prev) => ({ ...prev, dependencies: event.target.value }))} placeholder="例如：需要外部身份源、日志服务器、证书体系等" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>已知不适配边界</label>
              <textarea className={styles.textarea} value={formData.limitations} onChange={(event) => setFormData((prev) => ({ ...prev, limitations: event.target.value }))} placeholder="例如：不适用于无补丁窗口的老旧控制器；不适用于单向网络链路" />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Badge variant="success">设备商路径</Badge>
        <h1>{STEPS[currentStep].title}</h1>
        <p>{STEPS[currentStep].description}</p>
        <ProgressBar value={progress} variant="accent" size="large" />
      </div>

      <Card className={styles.contentCard}>{renderStep()}</Card>

      <div className={styles.actions}>
        <Button variant="ghost" onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))} disabled={currentStep === 0}>上一步</Button>
        {currentStep === STEPS.length - 1 ? (
          <Button variant="primary" onClick={handleComplete}>保存能力声明</Button>
        ) : (
          <Button variant="primary" onClick={() => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))}>下一步</Button>
        )}
      </div>
    </div>
  );
}
