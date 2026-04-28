import { CONDUIT_TEMPLATES, ZONE_TEMPLATES } from '../data/zones';

function getZoneName(zoneId) {
  return ZONE_TEMPLATES.find((item) => item.id === zoneId)?.name || zoneId;
}

function getProtocolTemplate(protocolName) {
  return CONDUIT_TEMPLATES.find((item) => item.protocols?.includes(protocolName));
}

export function hasCompleteCommunicationMatrix(plan) {
  const flows = plan?.communicationFlows || [];
  return flows.length > 0 && flows.every((flow) => (
    flow.source && flow.target && flow.protocol && flow.direction && flow.businessReason
  ));
}

export function buildCommunicationMatrix(plan) {
  const flows = plan?.communicationFlows || [];
  const complete = hasCompleteCommunicationMatrix(plan);

  if (!complete) {
    return {
      complete: false,
      missingFields: ['source', 'target', 'protocol', 'direction', 'businessReason'],
      rows: []
    };
  }

  return {
    complete: true,
    missingFields: [],
    rows: flows.map((flow, index) => ({
      id: `${flow.source}-${flow.target}-${index}`,
      source: flow.source,
      sourceName: getZoneName(flow.source),
      target: flow.target,
      targetName: getZoneName(flow.target),
      protocol: flow.protocol,
      direction: flow.direction,
      businessReason: flow.businessReason,
      boundaryHint: getProtocolTemplate(flow.protocol)?.securityMeasures || []
    }))
  };
}

export function buildCapabilityRequirementMatrix(riskProfile, targetSL, communicationMatrix) {
  const explanations = riskProfile?.explanations || [];
  const rows = [];
  const seen = new Set();

  explanations.forEach((item) => {
    (item.capabilityNeeds || []).forEach((capabilityId) => {
      const key = `${item.controlObjective}-${capabilityId}-${targetSL}`;
      if (seen.has(key)) return;
      seen.add(key);

      rows.push({
        id: key,
        controlObjective: item.controlObjective,
        capabilityId,
        sourceFR: item.fr || [],
        targetSL,
        requirementLevel: targetSL >= 3 ? 'high' : 'medium',
        implementationHint: communicationMatrix.complete
          ? '结合通信矩阵、边界控制和设备声明进行核对。'
          : '需先补齐通信流后再确认边界侧能力要求。',
        traceability: {
          inputConditions: item.inputConditions || [],
          riskConcerns: item.riskConcerns || []
        }
      });
    });
  });

  return {
    complete: communicationMatrix.complete,
    rows
  };
}

export function buildBoundaryControls(plan) {
  return (plan?.conduits || []).flatMap((conduitId) => {
    const conduit = CONDUIT_TEMPLATES.find((item) => item.id === conduitId);
    return conduit ? conduit.securityMeasures.map((measure) => ({ conduitId, measure })) : [];
  });
}

export function buildSystemRules(plan, riskProfile, communicationMatrix) {
  const rules = [];

  if (communicationMatrix.complete) {
    rules.push('所有跨区通信都应具备明确业务理由、方向限制和最小开放范围。');
  } else {
    rules.push('当前通信流信息不完整，暂不能形成完整通信矩阵，应先补齐源/目的/协议/方向/业务理由。');
  }

  if ((riskProfile?.riskConcerns || []).some((item) => item.id === 'remoteAccess')) {
    rules.push('远程访问路径应通过受控入口接入，并建立身份鉴别、审批与留痕。');
  }

  if ((riskProfile?.frFocus || []).some((item) => item.code === 'FR6')) {
    rules.push('关键边界、关键账号和关键变更应纳入日志与审计范围。');
  }

  if ((riskProfile?.frFocus || []).some((item) => item.code === 'FR7')) {
    rules.push('对高连续性资产应定义恢复优先级、备份与应急处置要求。');
  }

  return rules;
}
