// 匹配引擎 - 设备能力与需求匹配算法
import { CAPABILITY_OPTIONS, FR_CATEGORIES } from '../data/capabilities';

/**
 * 计算匹配度
 * @param {Array} requiredCapabilities - 需求能力列表
 * @param {Array} providedCapabilities - 设备提供的能力列表
 * @returns {Object} 匹配结果
 */
export function calculateMatchScore(requiredCapabilities, providedCapabilities) {
  let totalWeight = 0;
  let matchedWeight = 0;
  let partialWeight = 0;
  const details = [];

  requiredCapabilities.forEach(req => {
    const provided = providedCapabilities.find(p => p.id === req.id);
    const weight = req.weight || 1;

    totalWeight += weight * 2; // 满分是 weight * 2

    if (provided) {
      if (provided.maturity >= (req.minMaturity || 2)) {
        matchedWeight += weight * 2;
        details.push({
          capabilityId: req.id,
          label: req.label,
          status: 'full',
          providedMaturity: provided.maturity,
          requiredMaturity: req.minMaturity || 2
        });
      } else {
        partialWeight += weight;
        details.push({
          capabilityId: req.id,
          label: req.label,
          status: 'partial',
          providedMaturity: provided.maturity,
          requiredMaturity: req.minMaturity || 2
        });
      }
    } else {
      details.push({
        capabilityId: req.id,
        label: req.label,
        status: 'missing',
        providedMaturity: 0,
        requiredMaturity: req.minMaturity || 2
      });
    }
  });

  const maxScore = totalWeight;
  const score = matchedWeight + partialWeight;
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  return {
    score,
    maxScore,
    percentage,
    matchedCount: details.filter(d => d.status === 'full').length,
    partialCount: details.filter(d => d.status === 'partial').length,
    missingCount: details.filter(d => d.status === 'missing').length,
    details
  };
}

/**
 * 生成设备能力需求列表
 * @param {Array} frDimensions - FR维度列表
 * @param {number} targetSL - 目标安全等级
 * @returns {Array} 能力需求列表
 */
export function generateCapabilityRequirements(frDimensions, targetSL) {
  const requirements = [];
  const maturityMap = { 1: 1, 2: 2, 3: 3, 4: 4 };

  frDimensions.forEach(fr => {
    const categoryKey = Object.keys(CAPABILITY_OPTIONS).find(
      key => CAPABILITY_OPTIONS[key].some(opt => opt.fr === fr.code)
    );

    if (categoryKey) {
      CAPABILITY_OPTIONS[categoryKey]
        .filter(opt => opt.fr === fr.code)
        .forEach(opt => {
          requirements.push({
            ...opt,
            minMaturity: maturityMap[targetSL] || 2,
            priority: targetSL >= 3 ? 'high' : 'medium'
          });
        });
    }
  });

  return requirements;
}

/**
 * 执行需求匹配
 * @param {Object} integratorPlan - 集成商规划
 * @param {Array} vendorCapabilities - 设备商能力列表
 * @returns {Object} 匹配结果
 */
export function performMatching(integratorPlan, vendorCapabilities) {
  const results = vendorCapabilities.map(vendor => {
    const allRequirements = [];

    // 收集所有FR维度的需求
    integratorPlan.requiredFR.forEach(fr => {
      const requirements = generateCapabilityRequirements([fr], integratorPlan.targetSL);
      allRequirements.push(...requirements);
    });

    // 去重
    const uniqueRequirements = allRequirements.reduce((acc, req) => {
      const existing = acc.find(a => a.id === req.id);
      if (!existing) acc.push(req);
      return acc;
    }, []);

    // 计算匹配
    const matchResult = calculateMatchScore(uniqueRequirements, vendor.capabilities);

    // 计算FR覆盖度
    const frCoverage = {};
    integratorPlan.requiredFR.forEach(fr => {
      const frReqs = uniqueRequirements.filter(r => r.fr === fr.code);
      const frMatched = matchResult.details.filter(
        d => frReqs.some(r => r.id === d.capabilityId) && d.status !== 'missing'
      ).length;
      frCoverage[fr.code] = {
        total: frReqs.length,
        matched: frMatched,
        percentage: frReqs.length > 0 ? Math.round((frMatched / frReqs.length) * 100) : 0
      };
    });

    return {
      vendorId: vendor.id,
      vendorName: vendor.productName,
      matchResult,
      frCoverage,
      recommendation: getRecommendation(matchResult.percentage)
    };
  });

  // 按匹配度排序
  results.sort((a, b) => b.matchResult.percentage - a.matchResult.percentage);

  return {
    results,
    summary: {
      total: vendorCapabilities.length,
      fullyMatched: results.filter(r => r.matchResult.percentage >= 90).length,
      partiallyMatched: results.filter(r => r.matchResult.percentage >= 50 && r.matchResult.percentage < 90).length,
      insufficient: results.filter(r => r.matchResult.percentage < 50).length
    }
  };
}

/**
 * 获取推荐结果
 */
function getRecommendation(percentage) {
  if (percentage >= 90) {
    return {
      level: 'excellent',
      label: '强烈推荐',
      description: '完全满足项目需求，建议优先选型'
    };
  } else if (percentage >= 70) {
    return {
      level: 'good',
      label: '推荐',
      description: '基本满足需求，可作为备选方案'
    };
  } else if (percentage >= 50) {
    return {
      level: 'warning',
      label: '注意',
      description: '部分满足需求，需评估差距项'
    };
  } else {
    return {
      level: 'danger',
      label: '不推荐',
      description: '无法满足项目基本需求'
    };
  }
}

/**
 * 生成差距分析
 * @param {Object} matchResult - 匹配结果
 * @returns {Object} 差距分析
 */
export function analyzeGaps(matchResult) {
  const fullMatch = matchResult.details.filter(d => d.status === 'full');
  const partialMatch = matchResult.details.filter(d => d.status === 'partial');
  const missing = matchResult.details.filter(d => d.status === 'missing');

  return {
    fullMatch,
    partialMatch,
    missing,
    criticalGaps: missing.filter(d => {
      const req = CAPABILITY_OPTIONS[Object.keys(CAPABILITY_OPTIONS).find(
        key => CAPABILITY_OPTIONS[key].some(opt => opt.id === d.capabilityId)
      )]?.find(opt => opt.id === d.capabilityId);
      return req && req.fr === 'FR1';
    }),
    improvementSuggestions: partialMatch.map(d => ({
      capabilityId: d.capabilityId,
      label: d.label,
      currentLevel: d.providedMaturity,
      recommendedLevel: d.requiredMaturity,
      suggestion: `建议提升${d.label}能力至${['基础', '标准', '高级', '卓越'][d.requiredMaturity - 1]}级别`
    }))
  };
}
