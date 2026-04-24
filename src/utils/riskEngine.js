// 风险评估引擎
import { RISK_MAPPING, OWNER_TO_FR, FR_CATEGORIES, SECURITY_LEVELS, SL_RECOMMENDATION } from '../data/rules';

/**
 * 计算总体风险等级
 * @param {Object} assessment - 业主评估数据
 * @returns {Object} 风险评估结果
 */
export function calculateRiskLevel(assessment) {
  let totalScore = 0;
  let maxScore = 0;
  const factorScores = {};

  // 计算各维度得分
  const factors = ['downtimeTolerance', 'dataSensitivity', 'remoteAccessNeed', 'thirdPartyAccess'];

  factors.forEach(factor => {
    const value = assessment[factor];
    if (value && RISK_MAPPING[factor] && RISK_MAPPING[factor][value]) {
      const mapping = RISK_MAPPING[factor][value];
      factorScores[factor] = {
        value,
        weight: mapping.weight,
        level: mapping.level
      };
      totalScore += mapping.weight;
      maxScore += 3; // 最大权重为3
    }
  });

  // 计算总体风险等级
  const riskPercentage = maxScore > 0 ? totalScore / maxScore : 0;
  let riskLevel = 'low';
  let riskLabel = '低风险';

  if (riskPercentage >= 0.6) {
    riskLevel = 'high';
    riskLabel = '高风险';
  } else if (riskPercentage >= 0.3) {
    riskLevel = 'medium';
    riskLabel = '中风险';
  }

  return {
    score: totalScore,
    maxScore,
    percentage: Math.round(riskPercentage * 100),
    level: riskLevel,
    label: riskLabel,
    factorScores
  };
}

/**
 * 推荐安全等级
 * @param {string} riskLevel - 风险等级
 * @returns {Array} 推荐的安全等级列表
 */
export function recommendSecurityLevel(riskLevel) {
  const config = SL_RECOMMENDATION[`${riskLevel}Risk`] || SL_RECOMMENDATION.lowRisk;
  return config.recommended.map(level => ({
    level,
    ...SECURITY_LEVELS[`SL${level}`]
  }));
}

/**
 * 映射业务需求到FR维度
 * @param {Object} assessment - 业主评估数据
 * @returns {Array} 相关的FR维度列表
 */
export function mapToFRDimensions(assessment) {
  const frSet = new Set();

  Object.keys(OWNER_TO_FR).forEach(key => {
    const value = assessment[key];
    if (value && OWNER_TO_FR[key][value]) {
      OWNER_TO_FR[key][value].forEach(fr => frSet.add(fr));
    }
  });

  return Array.from(frSet).map(fr => ({
    code: fr,
    ...FR_CATEGORIES[fr]
  }));
}

/**
 * 生成风险画像
 * @param {Object} assessment - 业主评估数据
 * @returns {Object} 完整的风险画像
 */
export function generateRiskProfile(assessment) {
  const riskLevel = calculateRiskLevel(assessment);
  const frDimensions = mapToFRDimensions(assessment);
  const recommendedSL = recommendSecurityLevel(riskLevel.level);

  // 生成保护重点
  const protectionFocus = [];
  if (assessment.downtimeTolerance === 'critical' || assessment.downtimeTolerance === 'high') {
    protectionFocus.push('系统可用性 - 防止生产中断');
  }
  if (assessment.dataSensitivity === 'confidential' || assessment.dataSensitivity === 'top-secret') {
    protectionFocus.push('数据机密性 - 防止信息泄露');
  }
  if (assessment.remoteAccessNeed === 'extensive') {
    protectionFocus.push('远程访问安全 - 防止未授权访问');
  }
  if (assessment.thirdPartyAccess === 'regular') {
    protectionFocus.push('第三方接入管理 - 限制外部风险');
  }

  // 生成风险雷达图数据
  const radarData = [
    { dimension: '可用性', value: assessment.downtimeTolerance === 'critical' ? 100 : assessment.downtimeTolerance === 'high' ? 75 : assessment.downtimeTolerance === 'medium' ? 50 : 25 },
    { dimension: '机密性', value: assessment.dataSensitivity === 'top-secret' ? 100 : assessment.dataSensitivity === 'confidential' ? 75 : assessment.dataSensitivity === 'internal' ? 50 : 25 },
    { dimension: '远程访问', value: assessment.remoteAccessNeed === 'extensive' ? 100 : assessment.remoteAccessNeed === 'limited' ? 50 : 0 },
    { dimension: '第三方接入', value: assessment.thirdPartyAccess === 'regular' ? 100 : assessment.thirdPartyAccess === 'occasional' ? 50 : 0 },
    { dimension: '完整性', value: 60 + Math.random() * 40 } // 示例值
  ];

  return {
    riskLevel,
    frDimensions,
    recommendedSL,
    protectionFocus,
    radarData,
    summary: generateSummary(assessment, riskLevel, frDimensions)
  };
}

/**
 * 生成风险摘要
 */
function generateSummary(assessment, riskLevel, frDimensions) {
  const industry = assessment.industry || '工业';
  const riskLabel = riskLevel.label;

  const frNames = frDimensions.map(fr => fr.name).join('、');

  return {
    title: `${industry}安全风险评估报告`,
    description: `基于您的业务需求分析，系统识别为${riskLabel}级别。重点关注的安全维度包括：${frNames || '基础安全'}。建议达到安全等级SL${riskLevel.level >= 2 ? riskLevel.level : 2}或以上。`,
    keyRisks: [
      {
        id: 1,
        risk: '生产中断风险',
        level: assessment.downtimeTolerance === 'critical' || assessment.downtimeTolerance === 'high' ? 'high' : 'medium',
        description: '停机容忍度' + (assessment.downtimeTolerance === 'critical' ? '极低' : '较低')
      },
      {
        id: 2,
        risk: '数据泄露风险',
        level: assessment.dataSensitivity === 'confidential' || assessment.dataSensitivity === 'top-secret' ? 'high' : 'medium',
        description: '数据敏感度为' + (assessment.dataSensitivity === 'top-secret' ? '绝密' : assessment.dataSensitivity === 'confidential' ? '机密' : '一般')
      },
      {
        id: 3,
        risk: '未授权访问风险',
        level: assessment.remoteAccessNeed === 'extensive' ? 'high' : 'medium',
        description: '远程访问需求' + (assessment.remoteAccessNeed === 'extensive' ? '广泛' : '有限')
      }
    ].filter(r => r.level !== 'medium')
  };
}
