import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, ProgressBar, Badge } from '../../components/Common';
import { INDUSTRIES } from '../../data/industries';
import { useProject } from '../../context/ProjectContext';
import { generateRiskProfile } from '../../utils/riskEngine';
import styles from './OwnerInterview.module.css';

const STEPS = [
  { id: 'industry', title: '行业类型', description: '您的企业属于哪个行业' },
  { id: 'downtime', title: '停机容忍度', description: '系统停机对业务的影响程度' },
  { id: 'remoteAccess', title: '远程维护', description: '是否需要远程访问工业系统' },
  { id: 'dataSensitivity', title: '数据敏感度', description: '工业数据的保密需求' },
  { id: 'thirdParty', title: '第三方接入', description: '第三方访问工业网络的频率' },
  { id: 'assets', title: '关键资产', description: '需要重点保护的关键资产' },
  { id: 'painPoints', title: '当前痛点', description: '现有网络安全方面的困扰' },
  { id: 'projectName', title: '项目信息', description: '为您的项目起个名字' }
];

const DOWNTIME_OPTIONS = [
  { value: 'critical', label: '零容忍', description: '任何停机都会造成重大损失', color: 'danger' },
  { value: 'high', label: '高度敏感', description: '停机超过几小时会造成重大影响', color: 'danger' },
  { value: 'medium', label: '一般容忍', description: '停机一天内可接受', color: 'warning' },
  { value: 'low', label: '可容忍', description: '较长时间停机影响有限', color: 'success' }
];

const REMOTE_ACCESS_OPTIONS = [
  { value: 'extensive', label: '广泛需求', description: '频繁需要远程访问和控制' },
  { value: 'limited', label: '有限需求', description: '偶尔需要远程监控或诊断' },
  { value: 'none', label: '无需求', description: '主要在现场操作' }
];

const DATA_SENSITIVITY_OPTIONS = [
  { value: 'top-secret', label: '绝密', description: '核心技术、配方等绝密信息' },
  { value: 'confidential', label: '机密', description: '重要生产数据需要保护' },
  { value: 'internal', label: '内部', description: '一般内部使用保密' },
  { value: 'public', label: '公开', description: '可对外公开的信息' }
];

const THIRD_PARTY_OPTIONS = [
  { value: 'regular', label: '频繁', description: '设备商、集成商频繁远程访问' },
  { value: 'occasional', label: '偶尔', description: '偶尔需要第三方技术支持' },
  { value: 'none', label: '无', description: '无第三方远程访问需求' }
];

export function OwnerInterview() {
  const navigate = useNavigate();
  const { actions } = useProject();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    industry: '',
    downtimeTolerance: '',
    remoteAccessNeed: '',
    dataSensitivity: '',
    thirdPartyAccess: '',
    criticalAssets: [],
    currentPainPoints: [],
    projectName: ''
  });

  const currentStepInfo = STEPS[currentStep];
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
    actions.setOwnerAssessment(formData);
    actions.setProjectName(formData.projectName);

    // 计算风险并直接设置到全局状态
    const profile = generateRiskProfile(formData);
    actions.setRiskProfile(profile);
    navigate('/owner/result');
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field, item) => {
    setFormData(prev => {
      const arr = prev[field];
      if (arr.includes(item)) {
        return { ...prev, [field]: arr.filter(i => i !== item) };
      } else {
        return { ...prev, [field]: [...arr, item] };
      }
    });
  };

  const renderStepContent = () => {
    switch (currentStepInfo.id) {
      case 'industry':
        return (
          <div className={styles.optionGrid}>
            {INDUSTRIES.map(ind => (
              <Card
                key={ind.id}
                className={styles.optionCard}
                variant={formData.industry === ind.id ? 'accent' : 'default'}
                onClick={() => updateFormData('industry', ind.id)}
              >
                <h4>{ind.name}</h4>
                <p>{ind.description}</p>
              </Card>
            ))}
          </div>
        );

      case 'downtime':
        return (
          <div className={styles.optionList}>
            {DOWNTIME_OPTIONS.map(opt => (
              <Card
                key={opt.value}
                className={styles.optionCard}
                variant={formData.downtimeTolerance === opt.value ? 'accent' : 'default'}
                onClick={() => updateFormData('downtimeTolerance', opt.value)}
              >
                <div className={styles.optionHeader}>
                  <Badge variant={opt.color}>{opt.label}</Badge>
                </div>
                <p>{opt.description}</p>
              </Card>
            ))}
          </div>
        );

      case 'remoteAccess':
        return (
          <div className={styles.optionList}>
            {REMOTE_ACCESS_OPTIONS.map(opt => (
              <Card
                key={opt.value}
                className={styles.optionCard}
                variant={formData.remoteAccessNeed === opt.value ? 'accent' : 'default'}
                onClick={() => updateFormData('remoteAccessNeed', opt.value)}
              >
                <h4>{opt.label}</h4>
                <p>{opt.description}</p>
              </Card>
            ))}
          </div>
        );

      case 'dataSensitivity':
        return (
          <div className={styles.optionList}>
            {DATA_SENSITIVITY_OPTIONS.map(opt => (
              <Card
                key={opt.value}
                className={styles.optionCard}
                variant={formData.dataSensitivity === opt.value ? 'accent' : 'default'}
                onClick={() => updateFormData('dataSensitivity', opt.value)}
              >
                <div className={styles.optionHeader}>
                  <Badge variant={opt.value === 'top-secret' || opt.value === 'confidential' ? 'danger' : 'default'}>
                    {opt.label}
                  </Badge>
                </div>
                <p>{opt.description}</p>
              </Card>
            ))}
          </div>
        );

      case 'thirdParty':
        return (
          <div className={styles.optionList}>
            {THIRD_PARTY_OPTIONS.map(opt => (
              <Card
                key={opt.value}
                className={styles.optionCard}
                variant={formData.thirdPartyAccess === opt.value ? 'accent' : 'default'}
                onClick={() => updateFormData('thirdPartyAccess', opt.value)}
              >
                <h4>{opt.label}</h4>
                <p>{opt.description}</p>
              </Card>
            ))}
          </div>
        );

      case 'assets':
        return (
          <div className={styles.assetSelection}>
            <p className={styles.hint}>选择需要重点保护的关键资产类别（可多选）</p>
            <div className={styles.assetGrid}>
              {[
                { id: 'plc', name: 'PLC控制器' },
                { id: 'scada', name: 'SCADA系统' },
                { id: 'hmi', name: 'HMI人机界面' },
                { id: 'network', name: '工业网络设备' },
                { id: 'server', name: '工业服务器' },
                { id: 'sensor', name: '传感器/执行器' },
                { id: 'sis', name: '安全仪表系统' },
                { id: 'database', name: '生产数据库' }
              ].map(asset => (
                <Card
                  key={asset.id}
                  className={styles.assetCard}
                  variant={formData.criticalAssets.includes(asset.id) ? 'accent' : 'default'}
                  onClick={() => toggleArrayItem('criticalAssets', asset.id)}
                >
                  <span className={styles.assetName}>{asset.name}</span>
                  {formData.criticalAssets.includes(asset.id) && (
                    <span className={styles.checkmark}>✓</span>
                  )}
                </Card>
              ))}
            </div>
          </div>
        );

      case 'painPoints':
        return (
          <div className={styles.assetSelection}>
            <p className={styles.hint}>选择当前面临的安全困扰（可多选）</p>
            <div className={styles.assetGrid}>
              {[
                { id: 'unauthorized', name: '未授权访问担忧' },
                { id: 'downtime', name: '生产中断风险' },
                { id: 'data_leak', name: '数据泄露风险' },
                { id: 'compliance', name: '合规要求不明确' },
                { id: 'third_party', name: '第三方接入管理困难' },
                { id: 'legacy', name: '老旧设备无法升级' },
                { id: 'visibility', name: '网络可见性不足' },
                { id: 'response', name: '事件响应能力弱' }
              ].map(pain => (
                <Card
                  key={pain.id}
                  className={styles.assetCard}
                  variant={formData.currentPainPoints.includes(pain.id) ? 'warning' : 'default'}
                  onClick={() => toggleArrayItem('currentPainPoints', pain.id)}
                >
                  <span className={styles.assetName}>{pain.name}</span>
                  {formData.currentPainPoints.includes(pain.id) && (
                    <span className={styles.checkmark}>✓</span>
                  )}
                </Card>
              ))}
            </div>
          </div>
        );

      case 'projectName':
        return (
          <div className={styles.projectNameInput}>
            <p className={styles.hint}>为您的安全规划项目起一个名称</p>
            <input
              type="text"
              className={styles.textInput}
              placeholder="例如：某化工厂安全升级项目"
              value={formData.projectName}
              onChange={(e) => updateFormData('projectName', e.target.value)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStepInfo.id) {
      case 'industry':
        return !!formData.industry;
      case 'downtime':
        return !!formData.downtimeTolerance;
      case 'remoteAccess':
        return !!formData.remoteAccessNeed;
      case 'dataSensitivity':
        return !!formData.dataSensitivity;
      case 'thirdParty':
        return !!formData.thirdPartyAccess;
      case 'assets':
        return formData.criticalAssets.length > 0;
      case 'painPoints':
        return true; // 可选
      case 'projectName':
        return !!formData.projectName.trim();
      default:
        return false;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>业主安全需求评估</h1>
        <p className={styles.subtitle}>回答以下问题，系统将自动生成风险画像和安全建议</p>
      </div>

      <div className={styles.progressSection}>
        <div className={styles.progressInfo}>
          <span>步骤 {currentStep + 1} / {STEPS.length}</span>
          <span className={styles.stepTitle}>{currentStepInfo.title}</span>
        </div>
        <ProgressBar value={progress} variant="primary" showLabel size="large" />
      </div>

      <Card className={styles.stepCard}>
        <div className={styles.stepHeader}>
          <h3>{currentStepInfo.title}</h3>
          <p>{currentStepInfo.description}</p>
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
            完成评估
          </Button>
        )}
      </div>
    </div>
  );
}
