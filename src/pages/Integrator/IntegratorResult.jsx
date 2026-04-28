import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, ViewModeTabs } from '../../components/Common';
import { useIntegratorPath } from '../../hooks/useProject';
import { ZONE_TEMPLATES, CONDUIT_TEMPLATES } from '../../data/zones';
import { buildCommunicationMatrix } from '../../utils/planningEngine';
import styles from './IntegratorResult.module.css';

export function IntegratorResult() {
  const { projectMeta, riskProfile, plan } = useIntegratorPath();
  const [viewMode, setViewMode] = useState('basic');

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

  const zoneDetails = plan.zones.map((zoneId) => ZONE_TEMPLATES.find((item) => item.id === zoneId)).filter(Boolean);
  const conduitDetails = plan.conduits.map((conduitId) => CONDUIT_TEMPLATES.find((item) => item.id === conduitId)).filter(Boolean);
  const communicationMatrix = plan.communicationMatrix || buildCommunicationMatrix(plan);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>系统规划结果</h1>
        <p className={styles.subtitle}>{projectMeta?.projectName || '未命名项目'} 的 Zone / Conduit 与控制建议</p>
      </div>

      <Card className={styles.rulesCard}>
        <h3>解释层级</h3>
        <ViewModeTabs value={viewMode} onChange={setViewMode} />
      </Card>

      <Card className={styles.summaryCard} variant="accent">
        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <div className={styles.summaryValue}>SL {plan.targetSL}</div>
            <div className={styles.summaryLabel}>建议目标等级</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryValue}>{plan.zones.length}</div>
            <div className={styles.summaryLabel}>Zone 数量</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryValue}>{plan.communicationFlows.length}</div>
            <div className={styles.summaryLabel}>通信流</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryValue}>{plan.capabilityRequirements.length}</div>
            <div className={styles.summaryLabel}>能力需求项</div>
          </div>
        </div>
      </Card>

      <Card className={styles.detailCard}>
        <h3>区域规划</h3>
        <div className={styles.detailGrid}>
          {zoneDetails.map((zone) => (
            <div key={zone.id} className={styles.detailItem}>
              <div className={styles.detailHeader}>
                <Badge variant="info">SL{zone.securityLevel}</Badge>
                <h4>{zone.name}</h4>
              </div>
              <p className={styles.detailDesc}>{zone.description}</p>
              <div className={styles.detailAssets}><strong>边界控制：</strong>{zone.boundaryControls.join('、')}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className={styles.detailCard}>
        <h3>管道与边界控制</h3>
        <div className={styles.conduitList}>
          {conduitDetails.map((conduit) => (
            <div key={conduit.id} className={styles.conduitItem}>
              <div className={styles.conduitHeader}>
                <h4>{conduit.name}</h4>
                <Badge variant="warning">SL{conduit.maxSL}</Badge>
              </div>
              <p className={styles.conduitDesc}>{conduit.description}</p>
              <div className={styles.conduitBandwidth}>安全措施：{conduit.securityMeasures.join('、')}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className={styles.flowCard}>
        <h3>通信矩阵</h3>
        {!communicationMatrix.complete ? (
          <p className={styles.conduitDesc}>当前通信流信息不完整，系统仅输出缺失提示，暂不生成完整通信矩阵。</p>
        ) : (
          <table className={styles.flowTable}>
            <thead>
              <tr>
                <th>源区域</th>
                <th>目标区域</th>
                <th>协议</th>
                <th>方向</th>
                <th>业务理由</th>
              </tr>
            </thead>
            <tbody>
              {communicationMatrix.rows.map((flow) => (
                <tr key={flow.id}>
                  <td>{flow.sourceName}</td>
                  <td>{flow.targetName}</td>
                  <td><Badge variant="primary">{flow.protocol}</Badge></td>
                  <td>{flow.direction === 'uni' ? '单向' : '双向'}</td>
                  <td>{flow.businessReason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card className={styles.capabilityCard}>
        <h3>设备能力需求矩阵</h3>
        <div className={styles.capabilityList}>
          {plan.capabilityRequirements.map((item) => (
            <div key={`${item.capabilityId}-${item.controlObjective}`} className={styles.capabilityItem}>
              <Badge variant="primary">{item.capabilityId}</Badge>
              <div className={styles.capabilityDesc}>
                <strong>{item.controlObjective}</strong>
                {viewMode !== 'basic' && <p>来源 FR：{item.sourceFR.join('、')} | 目标等级：SL{item.targetSL}</p>}
                {viewMode === 'professional' && <p>{item.implementationHint || '结合设备声明、边界控制和通信矩阵核对。'}</p>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className={styles.rulesCard}>
        <h3>系统规则建议</h3>
        <div className={styles.rulesList}>
          {plan.systemRules.map((rule, index) => (
            <div key={`${rule}-${index}`} className={styles.ruleItem}>
              <Badge variant="accent">规则</Badge>
              <div className={styles.ruleContent}><p>{rule}</p></div>
            </div>
          ))}
        </div>
      </Card>

      <Card className={styles.rulesCard}>
        <h3>规划依据</h3>
        <div className={styles.rulesList}>
          {(riskProfile?.explanations || []).map((item, index) => (
            <div key={`${item.controlObjective}-${index}`} className={styles.ruleItem}>
              <Badge variant="info">依据</Badge>
              <div className={styles.ruleContent}>
                <strong>{item.controlObjective}</strong>
                <p>输入条件：{item.inputConditions.join('；') || '无'}</p>
                <p>风险关注：{item.riskConcerns.join('、') || '无'}</p>
                {viewMode !== 'basic' && <p>对应 FR：{item.fr.join('、') || '无'}</p>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {plan.residualRisks.length > 0 && (
        <Card className={styles.rulesCard}>
          <h3>风险保留项</h3>
          <div className={styles.rulesList}>
            {plan.residualRisks.map((item, index) => (
              <div key={`${item}-${index}`} className={styles.ruleItem}>
                <Badge variant="warning">待补充</Badge>
                <div className={styles.ruleContent}><p>{item}</p></div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className={styles.rulesCard}>
        <h3>免责声明</h3>
        <p>{riskProfile?.disclaimer}</p>
      </Card>

      <div className={styles.actions}>
        <Link to="/translation-center">
          <Button variant="ghost">查看翻译中心</Button>
        </Link>
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
