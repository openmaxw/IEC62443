import { Link } from 'react-router-dom';
import { Card, Button, Badge } from '../../components/Common';
import { useIntegratorPath } from '../../hooks/useProject';
import { ZONE_TEMPLATES, CONDUIT_TEMPLATES } from '../../data/zones';
import styles from './IntegratorResult.module.css';

export function IntegratorResult() {
  const { plan } = useIntegratorPath();

  if (!plan) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p>暂无规划数据，请先完成系统规划。</p>
          <Link to="/integrator">
            <Button variant="primary">去规划</Button>
          </Link>
        </div>
      </div>
    );
  }

  const zoneDetails = plan.zones.map(z => ZONE_TEMPLATES.find(zt => zt.id === z)).filter(Boolean);
  const conduitDetails = plan.conduits.map(c => CONDUIT_TEMPLATES.find(ct => ct.id === c)).filter(Boolean);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>系统规划报告</h1>
        <p className={styles.subtitle}>分区规划与安全规则设计方案</p>
      </div>

      {/* Summary */}
      <Card className={styles.summaryCard} variant="accent">
        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <div className={styles.summaryValue}>SL {plan.targetSL}</div>
            <div className={styles.summaryLabel}>目标安全等级</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryValue}>{plan.zones.length}</div>
            <div className={styles.summaryLabel}>安全区域</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryValue}>{plan.conduits.length}</div>
            <div className={styles.summaryLabel}>通信管道</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryValue}>{plan.assets.length}</div>
            <div className={styles.summaryLabel}>保护资产</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryValue}>{plan.communicationFlows.length}</div>
            <div className={styles.summaryLabel}>数据流</div>
          </div>
        </div>
      </Card>

      {/* Zone Plan Visualization */}
      <Card className={styles.zoneCard}>
        <h3>分区架构图</h3>
        <div className={styles.zoneDiagram}>
          {zoneDetails.map((zone, idx) => (
            <div key={zone.id} className={styles.zoneNode}>
              <div
                className={styles.zoneBox}
                style={{
                  borderColor: getSLColor(zone.securityLevel),
                  background: `rgba(${getSLRGB(zone.securityLevel)}, 0.1)`
                }}
              >
                <div className={styles.zoneSL}>SL{zone.securityLevel}</div>
                <div className={styles.zoneName}>{zone.name}</div>
                <div className={styles.zoneAssets}>
                  {zone.assets.slice(0, 2).join(', ')}
                  {zone.assets.length > 2 && '...'}
                </div>
              </div>
              {idx < zoneDetails.length - 1 && (
                <div className={styles.zoneArrow}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Zone Details */}
      <Card className={styles.detailCard}>
        <h3>区域详细配置</h3>
        <div className={styles.detailGrid}>
          {zoneDetails.map(zone => (
            <div key={zone.id} className={styles.detailItem}>
              <div className={styles.detailHeader}>
                <Badge variant={getSLBadgeVariant(zone.securityLevel)}>
                  SL{zone.securityLevel}
                </Badge>
                <h4>{zone.name}</h4>
              </div>
              <p className={styles.detailDesc}>{zone.description}</p>
              <div className={styles.detailAssets}>
                <strong>典型资产：</strong>
                {zone.assets.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Conduit Details */}
      <Card className={styles.detailCard}>
        <h3>通信管道配置</h3>
        <div className={styles.conduitList}>
          {conduitDetails.map(conduit => (
            <div key={conduit.id} className={styles.conduitItem}>
              <div className={styles.conduitHeader}>
                <h4>{conduit.name}</h4>
                <Badge variant="info">{conduit.type}</Badge>
              </div>
              <p className={styles.conduitDesc}>{conduit.description}</p>
              <div className={styles.conduitBandwidth}>
                典型带宽: {conduit.typicalBandwidth}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Communication Flows */}
      {plan.communicationFlows.length > 0 && (
        <Card className={styles.flowCard}>
          <h3>通信矩阵</h3>
          <table className={styles.flowTable}>
            <thead>
              <tr>
                <th>源区域</th>
                <th>目标区域</th>
                <th>协议</th>
                <th>安全要求</th>
              </tr>
            </thead>
            <tbody>
              {plan.communicationFlows.map((flow, idx) => (
                <tr key={idx}>
                  <td>{getZoneName(flow.source)}</td>
                  <td>{getZoneName(flow.target)}</td>
                  <td><Badge variant="primary">{flow.protocol}</Badge></td>
                  <td>
                    <span className={styles.securityReq}>
                      {getSecurityReq(flow.protocol)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Capability Requirements */}
      <Card className={styles.capabilityCard}>
        <h3>设备能力需求</h3>
        <div className={styles.capabilityList}>
          {plan.requiredFR.map(fr => (
            <div key={fr} className={styles.capabilityItem}>
              <Badge variant="primary">{fr}</Badge>
              <div className={styles.capabilityDesc}>
                <strong>{getFRName(fr)}</strong>
                <p>{getFRDescription(fr)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Security Rules */}
      <Card className={styles.rulesCard}>
        <h3>系统安全规则</h3>
        <div className={styles.rulesList}>
          {[
            { fr: 'FR1', title: '标识与认证控制', rule: '所有远程访问必须使用多因素认证。建立会话超时和终止机制。' },
            { fr: 'FR2', title: '使用控制', rule: '基于角色分配访问权限。遵循最小权限原则。' },
            { fr: 'FR3', title: '完整性保护', rule: '启用配置变更审计。实施固件完整性验证。' },
            { fr: 'FR5', title: '限制数据流', rule: `部署${plan.zones.length}个安全区域的边界防护。` },
            { fr: 'FR6', title: '事件响应', rule: '配置集中日志收集和安全事件告警。' }
          ].map((item, idx) => (
            <div key={idx} className={styles.ruleItem}>
              <Badge variant="accent">{item.fr}</Badge>
              <div className={styles.ruleContent}>
                <strong>{item.title}</strong>
                <p>{item.rule}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className={styles.actions}>
        <Link to="/integrator">
          <Button variant="ghost">重新规划</Button>
        </Link>
        <Link to="/vendor">
          <Button variant="primary">录入设备能力</Button>
        </Link>
      </div>
    </div>
  );
}

function getSLColor(level) {
  switch (level) {
    case 4: return 'var(--color-danger)';
    case 3: return 'var(--color-warning)';
    case 2: return 'var(--color-info)';
    default: return 'var(--color-success)';
  }
}

function getSLRGB(level) {
  switch (level) {
    case 4: return '255, 23, 68';
    case 3: return '255, 214, 0';
    case 2: return '0, 176, 255';
    default: return '0, 200, 83';
  }
}

function getSLBadgeVariant(level) {
  switch (level) {
    case 4: return 'danger';
    case 3: return 'warning';
    case 2: return 'info';
    default: return 'success';
  }
}

function getZoneName(zoneId) {
  const zone = ZONE_TEMPLATES.find(z => z.id === zoneId);
  return zone?.name || zoneId;
}

function getSecurityReq(protocol) {
  const reqs = {
    'Modbus TCP': '需要TLS或IPsec保护',
    'OPC UA': '建议使用UA Security',
    'EtherNet/IP': '建议启用CIP Security',
    'DNP3': '建议使用DNP3 Secure Authentication'
  };
  return reqs[protocol] || '建议加密传输';
}

function getFRName(fr) {
  const names = {
    FR1: '标识与认证控制',
    FR2: '使用控制',
    FR3: '完整性',
    FR4: '数据机密性',
    FR5: '限制数据流',
    FR6: '事件响应',
    FR7: '可用性',
    FR8: '资源可用性'
  };
  return names[fr] || fr;
}

function getFRDescription(fr) {
  const descs = {
    FR1: '对人员和设备进行唯一标识和身份验证',
    FR2: '控制对系统和数据的访问权限',
    FR3: '保护系统和数据免受未经授权的修改',
    FR4: '保护敏感数据不被未经授权的访问',
    FR5: '限制不同区域之间的数据流动',
    FR6: '对安全事件进行检测、报告和响应',
    FR7: '确保系统在需要时可用',
    FR8: '确保计算和网络资源充足'
  };
  return descs[fr] || '';
}
