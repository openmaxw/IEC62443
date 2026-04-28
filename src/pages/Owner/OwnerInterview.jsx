import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, ProgressBar, Badge } from '../../components/Common';
import { INDUSTRIES } from '../../data/industries';
import { useProject } from '../../hooks/useProject';
import { generateRiskProfile } from '../../utils/riskEngine';
import {
  CONSEQUENCE_LEVEL_OPTIONS,
  REMOTE_ACCESS_OPTIONS,
  THIRD_PARTY_ACCESS_OPTIONS,
  ACCEPTANCE_PREFERENCE_OPTIONS,
  REMOTE_OWNERSHIP_OPTIONS
} from '../../data/enums';
import styles from './OwnerInterview.module.css';

const STEPS = [
  { id: 'industry', title: '行业类型', description: '识别项目所处行业和业务背景' },
  { id: 'impacts', title: '业务后果', description: '识别安全事件的主要后果类型' },
  { id: 'exposure', title: '暴露面', description: '识别远程运维与第三方接入情况' },
  { id: 'maturity', title: '现状成熟度', description: '识别现有安全控制基础' },
  { id: 'constraints', title: '约束条件', description: '识别运维和验收偏好' },
  { id: 'assets', title: '关键资产', description: '识别重点保护对象' },
  { id: 'projectName', title: '项目信息', description: '确认项目名称并生成结果' }
];

const IMPACT_FIELDS = [
  { key: 'safetyImpact', label: '人身安全后果' },
  { key: 'environmentalImpact', label: '环境后果' },
  { key: 'productionImpact', label: '产能影响' },
  { key: 'qualityImpact', label: '质量影响' },
  { key: 'financialImpact', label: '财务影响' },
  { key: 'complianceImpact', label: '合规影响' },
  { key: 'brandImpact', label: '品牌影响' }
];

const ASSETS = [
  { id: 'plc', name: 'PLC 控制器', context: '控制生产动作和工艺执行' },
  { id: 'scada', name: 'SCADA / 监控系统', context: '负责监控、采集与可视化' },
  { id: 'engineering', name: '工程师站', context: '进行下载、配置和调试' },
  { id: 'historian', name: '历史数据库', context: '记录生产数据和关键事件' },
  { id: 'network', name: '工业网络设备', context: '交换机、防火墙、边界设备' },
  { id: 'safety', name: '安全系统', context: 'SIS、紧急停车等安全功能系统' },
  { id: 'remote-gateway', name: '远程接入网关', context: '承载远程运维和第三方访问' },
  { id: 'server', name: '工业服务器', context: '运行工业应用与管理平台' }
];

export function OwnerInterview() {
  const navigate = useNavigate();
  const { actions } = useProject();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    projectName: '',
    industry: '',
    safetyImpact: '',
    environmentalImpact: '',
    productionImpact: '',
    qualityImpact: '',
    financialImpact: '',
    complianceImpact: '',
    brandImpact: '',
    remoteAccessNeed: '',
    thirdPartyAccess: '',
    networkSegmentationMaturity: '',
    identityMaturity: '',
    loggingMaturity: '',
    patchMaturity: '',
    maintenanceWindow: '',
    upgradeWindow: '',
    remoteOperationsOwnership: 'shared',
    acceptancePreference: 'security-first',
    criticalAssets: []
  });

  const currentStepInfo = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field, item) => {
    setFormData((prev) => {
      const source = prev[field];
      return source.includes(item)
        ? { ...prev, [field]: source.filter((entry) => entry !== item) }
        : { ...prev, [field]: [...source, item] };
    });
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    actions.setProjectMeta({ projectName: formData.projectName, status: 'owner-completed' });
    actions.setOwnerAssessment(formData);
    actions.setProjectName(formData.projectName);
    actions.setRiskProfile(generateRiskProfile(formData));
    navigate('/owner/result');
  };

  const renderLevelSelector = (field) => (
    <div className={styles.optionList}>
      {CONSEQUENCE_LEVEL_OPTIONS.map((option) => (
        <Card
          key={option.value}
          className={styles.optionCard}
          variant={formData[field] === option.value ? 'accent' : 'default'}
          onClick={() => updateFormData(field, option.value)}
        >
          <div className={styles.optionHeader}>
            <h4>{option.label}</h4>
            <Badge variant={option.badge}>{option.label}</Badge>
          </div>
          <p>{option.description}</p>
        </Card>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStepInfo.id) {
      case 'industry':
        return (
          <div className={styles.optionGrid}>
            {INDUSTRIES.map((industry) => (
              <Card
                key={industry.id}
                className={styles.optionCard}
                variant={formData.industry === industry.id ? 'accent' : 'default'}
                onClick={() => updateFormData('industry', industry.id)}
              >
                <h4>{industry.name}</h4>
                <p>{industry.description}</p>
              </Card>
            ))}
          </div>
        );

      case 'impacts':
        return (
          <div className={styles.stepContent}>
            {IMPACT_FIELDS.map((field) => (
              <div key={field.key} className={styles.sectionBlock}>
                <h4>{field.label}</h4>
                {renderLevelSelector(field.key)}
              </div>
            ))}
          </div>
        );

      case 'exposure':
        return (
          <div className={styles.stepContent}>
            <div className={styles.sectionBlock}>
              <h4>远程运维需求</h4>
              <div className={styles.optionList}>
                {REMOTE_ACCESS_OPTIONS.map((option) => (
                  <Card
                    key={option.value}
                    className={styles.optionCard}
                    variant={formData.remoteAccessNeed === option.value ? 'accent' : 'default'}
                    onClick={() => updateFormData('remoteAccessNeed', option.value)}
                  >
                    <h4>{option.label}</h4>
                    <p>{option.description}</p>
                  </Card>
                ))}
              </div>
            </div>
            <div className={styles.sectionBlock}>
              <h4>第三方接入频率</h4>
              <div className={styles.optionList}>
                {THIRD_PARTY_ACCESS_OPTIONS.map((option) => (
                  <Card
                    key={option.value}
                    className={styles.optionCard}
                    variant={formData.thirdPartyAccess === option.value ? 'accent' : 'default'}
                    onClick={() => updateFormData('thirdPartyAccess', option.value)}
                  >
                    <h4>{option.label}</h4>
                    <p>{option.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 'maturity':
        return (
          <div className={styles.stepContent}>
            {[
              ['networkSegmentationMaturity', '网络隔离成熟度'],
              ['identityMaturity', '账号与身份管理成熟度'],
              ['loggingMaturity', '日志审计成熟度'],
              ['patchMaturity', '补丁与维护成熟度']
            ].map(([key, label]) => (
              <div key={key} className={styles.sectionBlock}>
                <h4>{label}</h4>
                {renderLevelSelector(key)}
              </div>
            ))}
          </div>
        );

      case 'constraints':
        return (
          <div className={styles.stepContent}>
            <div className={styles.sectionBlock}>
              <h4>常规维护窗口</h4>
              <input
                className={styles.projectInput}
                type="text"
                placeholder="例如：每周日 02:00-06:00"
                value={formData.maintenanceWindow}
                onChange={(event) => updateFormData('maintenanceWindow', event.target.value)}
              />
            </div>
            <div className={styles.sectionBlock}>
              <h4>系统改造窗口</h4>
              <input
                className={styles.projectInput}
                type="text"
                placeholder="例如：仅年度停产期可实施"
                value={formData.upgradeWindow}
                onChange={(event) => updateFormData('upgradeWindow', event.target.value)}
              />
            </div>
            <div className={styles.sectionBlock}>
              <h4>远程运维责任归属</h4>
              <div className={styles.optionList}>
                {REMOTE_OWNERSHIP_OPTIONS.map((option) => (
                  <Card
                    key={option.value}
                    className={styles.optionCard}
                    variant={formData.remoteOperationsOwnership === option.value ? 'accent' : 'default'}
                    onClick={() => updateFormData('remoteOperationsOwnership', option.value)}
                  >
                    <h4>{option.label}</h4>
                    <p>{option.description}</p>
                  </Card>
                ))}
              </div>
            </div>
            <div className={styles.sectionBlock}>
              <h4>验收偏好</h4>
              <div className={styles.optionList}>
                {ACCEPTANCE_PREFERENCE_OPTIONS.map((option) => (
                  <Card
                    key={option.value}
                    className={styles.optionCard}
                    variant={formData.acceptancePreference === option.value ? 'accent' : 'default'}
                    onClick={() => updateFormData('acceptancePreference', option.value)}
                  >
                    <h4>{option.label}</h4>
                    <p>{option.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 'assets':
        return (
          <div className={styles.assetSelection}>
            <p className={styles.hint}>选择重点保护的关键资产（可多选）</p>
            <div className={styles.assetGrid}>
              {ASSETS.map((asset) => (
                <Card
                  key={asset.id}
                  className={styles.assetCard}
                  variant={formData.criticalAssets.includes(asset.id) ? 'accent' : 'default'}
                  onClick={() => toggleArrayItem('criticalAssets', asset.id)}
                >
                  <span className={styles.assetName}>{asset.name}</span>
                  <span className={styles.assetContext}>{asset.context}</span>
                  {formData.criticalAssets.includes(asset.id) && (
                    <span className={styles.checkmark}>✓</span>
                  )}
                </Card>
              ))}
            </div>
          </div>
        );

      case 'projectName':
        return (
          <div className={styles.stepContent}>
            <div className={styles.sectionBlock}>
              <h4>项目名称</h4>
              <input
                className={styles.projectInput}
                type="text"
                placeholder="例如：某化工厂 OT 安全规划项目"
                value={formData.projectName}
                onChange={(event) => updateFormData('projectName', event.target.value)}
              />
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
        <Badge variant="primary">业主路径</Badge>
        <h1>{currentStepInfo.title}</h1>
        <p>{currentStepInfo.description}</p>
        <ProgressBar value={progress} variant="accent" size="large" />
      </div>

      <Card className={styles.contentCard}>
        {renderStepContent()}
      </Card>

      <div className={styles.actions}>
        <Button variant="ghost" onClick={handleBack} disabled={currentStep === 0}>
          上一步
        </Button>
        {currentStep === STEPS.length - 1 ? (
          <Button variant="primary" onClick={handleComplete}>
            生成风险翻译结果
          </Button>
        ) : (
          <Button variant="primary" onClick={handleNext}>
            下一步
          </Button>
        )}
      </div>
    </div>
  );
}
