import { Link } from 'react-router-dom';
import { Button, DataTable, NotePanel, SectionBlock, StatusSummaryPanel } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
import { useIntegratorPath, useOwnerPath } from '../../hooks/useProject';
import { getIntegratorResultViewModel, resolveMatchLabel } from '../../domain/viewModels/resultViewModels';
import styles from './IntegratorResult.module.css';

export function IntegratorResult() {
  const integratorPath = useIntegratorPath();
  const { assessment } = useOwnerPath();
  const viewModel = getIntegratorResultViewModel({ ...integratorPath, assessment });

  if (!viewModel.hasPlan) {
    return (
      <ProjectStageShell stageNumber="02" title="设计结果" projectName={viewModel.projectName} outputLabel="设计结论与依据">
        <div className={styles.empty}><Link to="/integrator"><Button variant="primary">前往集成设计</Button></Link></div>
      </ProjectStageShell>
    );
  }

  return (
    <ProjectStageShell stageNumber="02" title="设计结果" projectName={viewModel.projectName} outputLabel="设计结论与依据" statusText={viewModel.statusSummary.headline} guidance={{ summary: '您可在本页查看系统规划结论、能力需求与需求—设计对应关系。' }} statusPanel={<StatusSummaryPanel label={viewModel.statusSummary.title} value={viewModel.statusSummary.headline} note={viewModel.statusSummary.detail} pills={viewModel.statusSummary.pills} />}>
      <div className={styles.hero}>
        <div>
          <span className={styles.kicker}>设计输出</span>
          <h2>推荐目标 SL-{viewModel.targetSL}</h2>
          <p></p>
        </div>
        <div className={styles.summaryChips}>
          <span className={styles.chip}>Zone {viewModel.summary.zoneCount}</span>
          <span className={styles.chip}>流 {viewModel.summary.flowCount}</span>
          <span className={styles.chip}>能力 {viewModel.summary.capabilityCount}</span>
        </div>
        <Link to="/vendor"><Button variant="primary" size="small">进入能力</Button></Link>
      </div>

      <SectionBlock title="设计依据摘要">
        <div className={styles.summaryGrid}>
          <div><span>关键系统/角色</span><strong>{viewModel.designBasisSummary?.keySystems || '未填写'}</strong></div>
          <div><span>外部连接方式</span><strong>{viewModel.designBasisSummary?.externalConnections || '未填写'}</strong></div>
          <div><span>维护接入方式</span><strong>{viewModel.designBasisSummary?.maintenanceAccessPath || '未填写'}</strong></div>
          <div><span>初始网络边界</span><strong>{viewModel.designBasisSummary?.initialBoundaryNotes || '未填写'}</strong></div>
          <div><span>工艺连续性要求</span><strong>{viewModel.designBasisSummary?.continuityRequirements || '未填写'}</strong></div>
          <div><span>总体设计依据</span><strong>{viewModel.designBasisSummary?.designBasis || '未填写'}</strong></div>
        </div>
      </SectionBlock>

      <SectionBlock title="资产归组与 Zone 说明">
        <div className={styles.noteList}>
          {viewModel.assets.length ? viewModel.assets.map((asset) => (
            <div key={asset.id} className={styles.noteCard}>
              <strong>{asset.name}</strong>
              <span>{asset.zone} / {asset.role}</span>
              <p>{asset.groupingReason || '未填写归组原因'}</p>
            </div>
          )) : <div className={styles.emptyCell}>暂无资产归组信息。</div>}
        </div>
      </SectionBlock>

      <SectionBlock title="通信矩阵与边界控制">
        <DataTable className={styles.compareTable}>
          <thead>
            <tr>
              <th>源区 → 目标区</th>
              <th>协议 / 方向</th>
              <th>业务理由</th>
              <th>必要性 / 边界控制</th>
            </tr>
          </thead>
          <tbody>
            {viewModel.communicationFlows.length ? viewModel.communicationFlows.map((flow) => (
              <tr key={flow.id}>
                <td>{flow.source} → {flow.target}</td>
                <td>{flow.protocol} / {flow.direction || '未填写'}</td>
                <td>{flow.businessReason}</td>
                <td>{[flow.necessity, flow.boundaryControl].filter(Boolean).join('；') || '未填写'}</td>
              </tr>
            )) : <tr><td colSpan="4" className={styles.emptyCell}>暂无通信流数据。</td></tr>}
          </tbody>
        </DataTable>
      </SectionBlock>

      <SectionBlock title="组件能力需求清单">
        <div className={styles.requirementList}>
          {viewModel.capabilityRequirements.length ? viewModel.capabilityRequirements.map((item) => (
            <div key={item.id} className={styles.requirementItem}>
              <strong>{item.display.label}</strong>
              <div className={styles.capabilityMeta}><span className={styles.standardTag}>{item.display.frText}</span><span className={styles.standardTag}>{item.display.srText}</span></div><span>{item.controlObjective}</span>
              <p>{item.implementationHint}</p>
            </div>
          )) : <div className={styles.emptyCell}>暂无组件能力需求。</div>}
        </div>
      </SectionBlock>

      <SectionBlock title="需求—设计匹配表">
        <DataTable className={styles.compareTable}>
          <thead>
            <tr>
              <th>业主需求</th>
              <th>集成商对应设计</th>
              <th>匹配程度</th>
            </tr>
          </thead>
          <tbody>
            {viewModel.matchRows.length ? viewModel.matchRows.map((row) => (
              <tr key={row.id}>
                <td>{row.ownerNeed}</td>
                <td>{row.designResponse}</td>
                <td>
                  <span className={`${styles.matchBadge} ${styles[`match-${row.matchLevel}`]}`}>
                    {resolveMatchLabel(row.matchLevel)}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" className={styles.emptyCell}>暂无可用匹配数据，请先完成需求汇总与设计输入。</td>
              </tr>
            )}
          </tbody>
        </DataTable>
      </SectionBlock>
      <NotePanel title="结果说明" notes={["如需补充设计依据、通信边界或资产归组信息，请返回集成设计页面完善后再查看本页。"]} />
    </ProjectStageShell>
  );
}
