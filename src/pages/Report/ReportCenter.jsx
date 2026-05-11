import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, DataTable, NotePanel, SectionBlock, StatusSummaryPanel, SummaryStatGrid } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
import { useProject, useOwnerPath, useIntegratorPath, useVendorPath } from '../../hooks/useProject';
import { getReportCenterViewModel } from '../../domain/viewModels/selectionReportViewModels';
import { copyMarkdownToClipboard, exportReportAsMarkdown } from '../../utils/reportGenerator';
import styles from './ReportCenter.module.css';

export function ReportCenter() {
  const { state, actions } = useProject();
  const { projectMeta, riskProfile } = useOwnerPath();
  const { plan } = useIntegratorPath();
  const { capabilities, matchResults, gapClosureItems } = useVendorPath();
  const viewModel = getReportCenterViewModel({ projectMeta, riskProfile, plan, capabilities, matchResults, gapClosureItems });
  const [exportStatus, setExportStatus] = useState('');
  const [markdownPreview, setMarkdownPreview] = useState('');
  const [markdownFilename, setMarkdownFilename] = useState('');
  const handleExportMarkdown = async () => {
    const result = exportReportAsMarkdown(viewModel.reportPayload);
    setMarkdownPreview(result.markdown);
    setMarkdownFilename(result.filename);
    actions.setReports([
      ...(state.deliverables?.reports || []),
      {
        id: `markdown-${Date.now()}`,
        type: 'markdown',
        title: 'Markdown 交付摘要',
        filename: result.filename,
        generatedAt: new Date().toISOString()
      }
    ]);
    const copied = await copyMarkdownToClipboard(result.markdown);
    setExportStatus(copied ? `已生成 Markdown，并复制到剪贴板。建议保存为：${result.filename}` : `已生成 Markdown，请从下方文本框复制并保存为：${result.filename}`);
  };

  return (
    <ProjectStageShell
      stageNumber="05"
      title="交付中心"
      projectName={viewModel.projectName}
      outputLabel={`闭环项 ${viewModel.gapClosureItems.length} / 高严重度 ${viewModel.highRiskCount}`}
      statusText={viewModel.statusSummary.headline}
      statusPanel={<StatusSummaryPanel label={viewModel.statusSummary.title} value={viewModel.statusSummary.headline} note={viewModel.statusSummary.detail} pills={viewModel.statusSummary.pills} />}
      prevAction={{ to: '/selection', label: '上一步' }}
      guidance={{ summary: '交付中心用于汇总阶段输出与闭环状态。' }}
    >
      {({ statusBar }) => (
        <section className={styles.page}>
        <section className={styles.deliveryHero}>
          <div>
            <span>当前产出</span>
            <strong>{viewModel.gapClosureReady ? '可导出阶段性交付摘要' : '仍需补齐闭环信息'}</strong>
            <p>Markdown 交付摘要会汇总项目、风险、设计、能力声明、差距闭环、IEC 映射和免责声明。</p>
          </div>
          <div className={styles.exportActions}><Button variant="primary" size="small" onClick={handleExportMarkdown}>生成 Markdown 交付摘要</Button>{exportStatus ? <span>{exportStatus}</span> : null}</div>
        </section>

        {markdownPreview ? <SectionBlock title={`Markdown 内容预览：${markdownFilename}`}><textarea className={styles.markdownPreview} value={markdownPreview} readOnly onFocus={(event) => event.target.select()} /></SectionBlock> : null}

        <SectionBlock title="交付项">
          <DataTable><thead><tr><th>交付项</th><th>状态</th><th>说明</th><th>入口</th></tr></thead><tbody>{viewModel.items.map((item) => <tr key={item.title}><td>{item.title}</td><td>{item.ready ? '已具备' : '待补齐'}</td><td>{item.desc}</td><td>{item.ready ? <Link to={item.route} className={styles.link}>查看</Link> : '—'}</td></tr>)}</tbody></DataTable>
        </SectionBlock>

        <SectionBlock title="闭环项">
          <SummaryStatGrid items={[{ label: '待闭环差距', value: viewModel.gapRows.length }, { label: '已保存闭环项', value: viewModel.gapClosureItems.length }, { label: '高严重度', value: viewModel.highRiskCount }, { label: '依赖外部补偿', value: viewModel.externalCount }]} />
          {viewModel.gapClosureItems.length ? <div className={styles.list}>{viewModel.gapClosureItems.map((item) => <article key={item.id} className={styles.item}><strong>{item.display.label}</strong><div className={styles.capabilityMeta}><span className={styles.standardTag}>{item.display.frText}</span><span className={styles.standardTag}>{item.display.srText}</span></div><span>{item.owner || '责任方未填写'}</span><p><strong>补偿措施：</strong>{item.mitigation || '未填写'}</p><p><strong>验收影响：</strong>{item.acceptanceImpact || '未填写'}</p><p><strong>残余风险：</strong>{item.residualRisk || '未填写'}</p></article>)}</div> : <div className={styles.empty}>当前还没有已保存的闭环决策，请先前往闭环页完成保存。</div>}
        </SectionBlock>

        <SectionBlock title="IEC 62443 映射依据">
          <DataTable><thead><tr><th>能力项</th><th>Part</th><th>FR / SR</th><th>条款摘要</th><th>系统解释</th><th>当前限制</th></tr></thead><tbody>{viewModel.mappingRows.length ? viewModel.mappingRows.map((item) => <tr key={item.requirement.id || item.requirement.capabilityId}><td>{item.display.label}</td><td>{item.mapping.part}</td><td>{item.mapping.fr} / {item.mapping.sr}</td><td>{item.mapping.requirementSummary}</td><td>{item.mapping.systemInterpretation}</td><td>{item.mapping.limitation}</td></tr>) : <tr><td colSpan="6">当前还没有可展示的能力映射，请先完成集成设计能力需求。</td></tr>}</tbody></DataTable>
        </SectionBlock>
        {statusBar}
        <NotePanel title="交付说明" notes={["如有内容仍待补充，请返回对应阶段页面完善后再查看交付汇总。"]} />
      </section>
      )}
    </ProjectStageShell>
  );
}
