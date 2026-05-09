import { NotePanel, StatusSummaryPanel } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
import { useOwnerPath, useIntegratorPath, useVendorPath } from '../../hooks/useProject';
import { getTranslationCenterViewModel } from '../../domain/viewModels/workspaceTranslationViewModels';
import styles from './TranslationCenter.module.css';

export function TranslationCenter() {
  const { projectMeta, assessment, riskProfile } = useOwnerPath();
  const { plan } = useIntegratorPath();
  const { capabilities, matchResults } = useVendorPath();
  const viewModel = getTranslationCenterViewModel({ projectMeta, assessment, riskProfile, plan, capabilities, matchResults });

  return (
    <ProjectStageShell stageNumber="06" title="翻译中心" projectName={viewModel.projectName} outputLabel="业务输入 → 风险 → 设计 → 能力 / 差距" statusText={viewModel.summary.gapCount ? '当前仍有差距待解释与闭环' : '主链追溯已基本连通'} guidance={{ summary: '您可在本页查看业务输入、风险关注、设计要求与能力差距之间的对应关系。' }} statusPanel={<StatusSummaryPanel label={viewModel.summary.gapCount ? '当前追溯重点' : '当前追溯状态'} value={viewModel.summary.gapCount ? `仍有 ${viewModel.summary.gapCount} 项差距待闭环` : '当前追溯链已具备对齐基础'} note={viewModel.summary.gapCount ? '建议重点核对差距项为何产生、由谁负责、如何闭环。' : '可用于跨角色复核业务输入与设计、能力声明之间的映射关系。'} pills={[`设计需求 ${viewModel.summary.requirementCount}`, `差距项 ${viewModel.summary.gapCount}`]} />}>
      <div className={styles.page}>
        <div className={styles.headerRow}><strong>{viewModel.projectName || '翻译中心'}</strong><span>{viewModel.projectDescription}</span></div>
        <section className={styles.traceSection}><h3>一、业主业务输入</h3><div className={styles.cardGrid}><div className={styles.card}><strong>关键资产</strong><p>{viewModel.owner.criticalAssets}</p></div><div className={styles.card}><strong>关键系统/角色</strong><p>{viewModel.owner.keySystems}</p></div><div className={styles.card}><strong>外部连接</strong><p>{viewModel.owner.externalConnections}</p></div><div className={styles.card}><strong>连续性要求</strong><p>{viewModel.owner.continuityRequirements}</p></div></div></section>
        <section className={styles.traceSection}><h3>二、风险与要求翻译</h3><div className={styles.cardGrid}><div className={styles.card}><strong>风险关注</strong><p>{viewModel.risk.concerns}</p></div><div className={styles.card}><strong>FR 重点</strong><p>{viewModel.risk.frFocus}</p></div><div className={styles.card}><strong>目标等级候选</strong><p>{viewModel.risk.targetLevels}</p></div><div className={styles.card}><strong>业主要求</strong><p>{viewModel.risk.ownerRequirements}</p></div></div></section>
        <section className={styles.traceSection}><h3>三、集成设计响应</h3><div className={styles.cardGrid}><div className={styles.card}><strong>Zone / Conduit</strong><p>{viewModel.design.zoneConduitSummary}</p></div><div className={styles.card}><strong>通信设计</strong><p>{viewModel.design.communicationSummary}</p></div><div className={styles.card}><strong>设计依据</strong><p>{viewModel.design.designBasis}</p></div><div className={styles.card}><strong>组件能力需求</strong><p>{viewModel.design.capabilityLabels}</p></div></div></section>
        <section className={styles.traceSection}><h3>四、能力与差距状态</h3><div className={styles.cardGrid}><div className={styles.card}><strong>设备产品</strong><p>{viewModel.capability.productName}</p></div><div className={styles.card}><strong>声明项数</strong><p>{viewModel.capability.claimCount}</p></div><div className={styles.card}><strong>差距项数</strong><p>{viewModel.capability.gapCount}</p></div><div className={styles.card}><strong>待闭环能力项</strong><p>{viewModel.capability.gapLabels}</p></div></div></section>
        <NotePanel title="追溯说明" notes={["如需查看详细填写内容或补充信息，请返回对应阶段页面处理。"]} />
      </div>
    </ProjectStageShell>
  );
}
