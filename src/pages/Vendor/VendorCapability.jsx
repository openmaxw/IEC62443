import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, ProgressBar } from '../../components/Common';
import { useProject } from '../../context/ProjectContext';
import { CAPABILITY_OPTIONS, PRODUCT_TYPES, CAPABILITY_MATURITY, CAPABILITY_CATEGORIES } from '../../data/capabilities';
import styles from './VendorCapability.module.css';

const STEPS = [
  { id: 'product', title: '产品信息', description: '填写产品基本信息' },
  { id: 'capabilities', title: '安全能力', description: '勾选产品具备的安全能力' },
  { id: 'maturity', title: '成熟度', description: '评估各项能力的成熟度等级' },
  { id: 'evidence', title: '证据材料', description: '上传或描述能力证据' }
];

export function VendorCapability() {
  const navigate = useNavigate();
  const { actions } = useProject();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    productName: '',
    productType: '',
    securityLevel: 1,
    capabilities: [],
    maturityScores: {},
    evidenceNotes: ''
  });

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    actions.addVendorCapability({
      id: `vendor-${Date.now()}`,
      ...formData
    });
    navigate('/vendor/result');
  };

  const toggleCapability = (capId) => {
    setFormData(prev => {
      const caps = prev.capabilities.includes(capId)
        ? prev.capabilities.filter(c => c !== capId)
        : [...prev.capabilities, capId];
      return { ...prev, capabilities: caps };
    });
  };

  const setMaturity = (capId, level) => {
    setFormData(prev => ({
      ...prev,
      maturityScores: { ...prev.maturityScores, [capId]: level }
    }));
  };

  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
      case 'product':
        return (
          <div className={styles.stepContent}>
            <div className={styles.formGroup}>
              <label className={styles.label}>产品名称</label>
              <input
                type="text"
                className={styles.input}
                placeholder="例如：SecurePLC 3000"
                value={formData.productName}
                onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>产品类型</label>
              <div className={styles.productTypeGrid}>
                {PRODUCT_TYPES.map(type => (
                  <Card
                    key={type.id}
                    className={styles.typeCard}
                    variant={formData.productType === type.id ? 'accent' : 'default'}
                    onClick={() => setFormData(prev => ({ ...prev, productType: type.id }))}
                  >
                    <span>{type.name}</span>
                  </Card>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>产品安全等级</label>
              <div className={styles.slSelector}>
                {[1, 2, 3, 4].map(sl => (
                  <button
                    key={sl}
                    className={`${styles.slButton} ${formData.securityLevel === sl ? styles.active : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, securityLevel: sl }))}
                  >
                    SL {sl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'capabilities':
        return (
          <div className={styles.stepContent}>
            <p className={styles.stepHint}>
              选择产品具备的安全能力（可多选）
            </p>
            {Object.entries(CAPABILITY_OPTIONS).map(([category, options]) => (
              <div key={category} className={styles.capabilityGroup}>
                <h4 className={styles.groupTitle}>
                  <Badge variant="primary">{CAPABILITY_CATEGORIES[category]?.name}</Badge>
                </h4>
                <div className={styles.capabilityGrid} role="group" aria-label={`${CAPABILITY_CATEGORIES[category]?.name}能力选项`}>
                  {options.map(opt => {
                    const isSelected = formData.capabilities.includes(opt.id);
                    return (
                      <div
                        key={opt.id}
                        className={`${styles.capabilityCard} ${isSelected ? styles.selected : ''}`}
                        role="checkbox"
                        aria-checked={isSelected}
                        aria-label={`${opt.label}，满足IEC 62443 ${opt.fr}要求`}
                        tabIndex={0}
                        onClick={() => toggleCapability(opt.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleCapability(opt.id);
                          }
                        }}
                      >
                        <div className={styles.capabilityHeader}>
                          <span className={styles.capabilityLabel}>{opt.label}</span>
                          <Badge variant="info" size="small" aria-hidden="true">{opt.fr}</Badge>
                        </div>
                        {isSelected && (
                          <span className={styles.checkmark} aria-hidden="true">✓</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );

      case 'maturity':
        return (
          <div className={styles.stepContent}>
            <p className={styles.stepHint}>
              评估已选安全能力的成熟度等级
            </p>
            <div className={styles.maturityList}>
              {formData.capabilities.map(capId => {
                const cap = Object.values(CAPABILITY_OPTIONS)
                  .flat()
                  .find(opt => opt.id === capId);

                return (
                  <Card key={capId} className={styles.maturityCard}>
                    <div className={styles.maturityHeader}>
                      <span className={styles.capabilityLabel}>{cap?.label}</span>
                      <Badge variant="info">{cap?.fr}</Badge>
                    </div>
                    <div className={styles.maturitySelector}>
                      {CAPABILITY_MATURITY.map(ml => (
                        <button
                          key={ml.level}
                          className={`${styles.maturityButton} ${formData.maturityScores[capId] === ml.level ? styles.active : ''}`}
                          onClick={() => setMaturity(capId, ml.level)}
                        >
                          <span className={styles.maturityLevel}>{ml.level}</span>
                          <span className={styles.maturityName}>{ml.name}</span>
                          <span className={styles.maturityDesc}>{ml.description}</span>
                        </button>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 'evidence':
        return (
          <div className={styles.stepContent}>
            <p className={styles.stepHint}>
              添加支持您产品安全能力的证据说明
            </p>
            <div className={styles.formGroup}>
              <label className={styles.label}>证据说明</label>
              <textarea
                className={styles.textarea}
                placeholder="描述产品已获得的认证、测试报告、技术文档等证据..."
                rows={6}
                value={formData.evidenceNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, evidenceNotes: e.target.value }))}
              />
            </div>

            <div className={styles.summarySection}>
              <h4>能力画像摘要</h4>
              <div className={styles.summaryTags}>
                {formData.capabilities.map(capId => {
                  const cap = Object.values(CAPABILITY_OPTIONS)
                    .flat()
                    .find(opt => opt.id === capId);
                  return (
                    <Badge key={capId} variant="primary">
                      {cap?.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (STEPS[currentStep].id) {
      case 'product':
        return !!formData.productName && !!formData.productType;
      case 'capabilities':
        return formData.capabilities.length > 0;
      case 'maturity':
        return formData.capabilities.every(capId => formData.maturityScores[capId]);
      case 'evidence':
        return true;
      default:
        return false;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>设备商能力建模</h1>
        <p className={styles.subtitle}>
          建立产品安全能力画像，生成项目匹配分析
        </p>
      </div>

      <div className={styles.progressSection}>
        <div className={styles.progressInfo}>
          <span>步骤 {currentStep + 1} / {STEPS.length}</span>
          <span className={styles.stepTitle}>{STEPS[currentStep].title}</span>
        </div>
        <ProgressBar value={progress} variant="primary" showLabel size="large" />
      </div>

      <Card className={styles.stepCard}>
        <div className={styles.stepHeader}>
          <h3>{STEPS[currentStep].title}</h3>
          <p>{STEPS[currentStep].description}</p>
        </div>
        <div className={styles.stepContent}>
          {renderStepContent()}
        </div>
      </Card>

      <div className={styles.navigation}>
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          上一步
        </Button>
        {currentStep < STEPS.length - 1 ? (
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            下一步
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleComplete}
            disabled={!canProceed()}
          >
            完成录入
          </Button>
        )}
      </div>
    </div>
  );
}
