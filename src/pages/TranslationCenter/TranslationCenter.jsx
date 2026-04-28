import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card, ViewModeTabs } from '../../components/Common';
import { ThreeColumnLayout } from '../../components/Layout';
import { useIntegratorPath, useOwnerPath, useVendorPath } from '../../hooks/useProject';
import styles from './TranslationCenter.module.css';

function LeftSummary({ assessment, riskProfile, plan, viewMode }) {
  return (
    <div className={styles.panelSection}>
      <div>
        <div className={styles.panelTitle}>输入与约束摘要</div>
        <div className={styles.panelHint}>汇总业主输入、项目约束与当前规划状态。</div>
      </div>
      <div className={styles.itemList}>
        <div className={styles.itemCard}>
          <strong>项目名称</strong>
          <p>{assessment?.projectName || '未命名项目'}</p>
        </div>
        <div className={styles.itemCard}>
          <strong>风险关注</strong>
          <p>{(riskProfile?.riskConcerns || []).map((item) => item.title).slice(0, viewMode === 'basic' ? 2 : 3).join('、') || '暂无'}</p>
        </div>
        <div className={styles.itemCard}>
          <strong>项目约束</strong>
          <p>维护窗口：{assessment?.maintenanceWindow || '未填写'}</p>
          <p>改造窗口：{assessment?.upgradeWindow || '未填写'}</p>
          {viewMode !== 'basic' && <p>远程运维责任：{assessment?.remoteOperationsOwnership || '未填写'}</p>}
        </div>
        <div className={styles.itemCard}>
          <strong>规划现状</strong>
          <p>Zone：{plan?.zones?.length || 0} / 通信流：{plan?.communicationFlows?.length || 0}</p>
        </div>
      </div>
    </div>
  );
}

function TranslationTrace({ riskProfile, plan, viewMode }) {
  const traces = riskProfile?.explanations || [];

  return (
    <div className={styles.mainColumn}>
      <div className={styles.pageHeader}>
        <h1>翻译中心</h1>
        <p>把角色输入翻译为风险关注、FR、系统控制与设备能力要求，并提供可追溯依据。</p>
        <div className={styles.itemMeta}>
          <Link to="/dashboard">返回项目工作台</Link>
          <Link to="/report">查看交付中心</Link>
        </div>
      </div>

      <Card>
        <div className={styles.panelTitle}>解释层级</div>
        <div className={styles.panelHint}>当前页面支持小白 / 进阶 / 专业三层解释深度切换。</div>
      </Card>

      <Card>
        <div className={styles.panelTitle}>系统翻译链与映射依据</div>
        <div className={styles.panelHint}>解释顺序固定为：输入条件 → 风险关注 → 对应 FR → 对应系统控制 → 对应设备能力。</div>
      </Card>

      <div className={styles.traceList}>
        {traces.length === 0 ? (
          <div className={styles.emptyCard}>暂无翻译链，请先完成业主路径。</div>
        ) : traces.map((item, index) => (
          <div key={`${item.controlObjective}-${index}`} className={styles.traceCard}>
            <strong>{item.controlObjective}</strong>
            <p>输入条件：{(item.inputConditions || []).join('；') || '无'}</p>
            <p>风险关注：{(item.riskConcerns || []).join('、') || '无'}</p>
            {viewMode !== 'basic' && <p>对应 FR：{(item.fr || []).join('、') || '无'}</p>}
            {viewMode !== 'basic' && <p>对应系统控制：{(item.systemControls || []).join('、') || '无'}</p>}
            {viewMode === 'professional' && <p>对应设备能力：{(item.capabilityNeeds || []).join('、') || '无'}</p>}
          </div>
        ))}
      </div>

      {plan?.communicationMatrix && (
        <Card>
          <div className={styles.panelTitle}>通信矩阵状态</div>
          <p>{plan.communicationMatrix.complete ? '通信矩阵已完整生成，可继续核对边界控制与设备声明。' : '通信矩阵尚未完整生成，目前仅能显示缺失提示。'}</p>
        </Card>
      )}
    </div>
  );
}

function RightResults({ riskProfile, plan, capabilities, matchResults, viewMode }) {
  const latestCapability = capabilities?.[capabilities.length - 1];
  const primary = matchResults?.results?.[0];

  return (
    <div className={styles.panelSection}>
      <div>
        <div className={styles.panelTitle}>建议结果与交接物</div>
        <div className={styles.panelHint}>右栏聚焦结论、建议与当前可交付内容。</div>
      </div>
      <div className={styles.resultList}>
        <div className={styles.resultCard}>
          <strong>建议目标等级</strong>
          <p>{riskProfile?.summary?.recommendedTarget || '暂无'}</p>
        </div>
        <div className={styles.resultCard}>
          <strong>系统控制建议</strong>
          <div className={styles.itemMeta}>
            {(riskProfile?.controlObjectives || []).map((item) => <Badge key={item.id} variant="primary">{item.title}</Badge>)}
          </div>
        </div>
        {viewMode !== 'basic' && (
          <div className={styles.resultCard}>
            <strong>设备能力需求</strong>
            <p>{(plan?.capabilityRequirements || []).slice(0, 5).map((item) => item.capabilityId).join('、') || '暂无'}</p>
          </div>
        )}
        <div className={styles.resultCard}>
          <strong>最新交接物</strong>
          <p>{latestCapability?.productMeta?.productName ? `设备商能力说明：${latestCapability.productMeta.productName}` : '尚未形成设备商交接物'}</p>
          <p>{primary ? `当前匹配结论：${primary.recommendations.label}` : '尚未形成选型匹配结论'}</p>
          {viewMode === 'professional' && primary && <p>匹配分数：{primary.overallScore}%</p>}
        </div>
      </div>
    </div>
  );
}

export function TranslationCenter() {
  const { assessment, riskProfile } = useOwnerPath();
  const { plan } = useIntegratorPath();
  const { capabilities, matchResults } = useVendorPath();
  const [viewMode, setViewMode] = useState('basic');

  return (
    <ThreeColumnLayout
      leftWidth="280px"
      rightWidth="320px"
      leftSidebar={<LeftSummary assessment={assessment} riskProfile={riskProfile} plan={plan} viewMode={viewMode} />}
      mainContent={(
        <div className={styles.mainColumn}>
          <Card>
            <div className={styles.panelTitle}>解释层级</div>
            <ViewModeTabs value={viewMode} onChange={setViewMode} />
          </Card>
          <TranslationTrace riskProfile={riskProfile} plan={plan} viewMode={viewMode} />
        </div>
      )}
      rightPanel={<RightResults riskProfile={riskProfile} plan={plan} capabilities={capabilities} matchResults={matchResults} viewMode={viewMode} />}
    />
  );
}
