import { Link } from 'react-router-dom';
import { Button, NotePanel, SectionBlock, StatusSummaryPanel, SummaryStatGrid } from '../../components/Common';
import { ProjectStageShell } from '../../components/ProjectFlow';
import { useVendorPath } from '../../hooks/useProject';
import { getVendorResultViewModel } from '../../domain/viewModels/dashboardVendorViewModels';
import styles from './VendorResult.module.css';

export function VendorResult() {
  const vendorPath = useVendorPath();
  const viewModel = getVendorResultViewModel(vendorPath);

  if (!viewModel.hasCapability) {
    return <ProjectStageShell stageNumber="03" title="能力结果" projectName={viewModel.projectName} outputLabel="设备声明摘要"><div className={styles.empty}><Link to="/vendor"><Button variant="primary">前往能力声明</Button></Link></div></ProjectStageShell>;
  }

  return (
    <ProjectStageShell stageNumber="03" title="能力结果" projectName={viewModel.projectName} outputLabel="设备声明摘要" statusText={viewModel.statusSummary.headline} guidance={{ summary: '您可在本页查看设备能力满足情况、依赖条件与限制说明。' }} statusPanel={<StatusSummaryPanel label={viewModel.statusSummary.title} value={viewModel.statusSummary.headline} note={viewModel.statusSummary.detail} pills={viewModel.statusSummary.pills} />}>
      <div className={styles.hero}><div><span className={styles.eyebrow}>设备声明摘要</span><h2>{viewModel.latest.productMeta?.productName || '未命名产品'}</h2><p>{viewModel.latest.productMeta?.deploymentScope || '未填写部署范围'} / SL-{viewModel.latest.productMeta?.securityLevel || 2}</p></div><Link to="/selection"><Button variant="primary" size="small">进入差距分析</Button></Link></div>
      <SectionBlock title="要求满足度"><SummaryStatGrid items={[{ label: '满足', value: viewModel.groups.fulfilled.length }, { label: '部分满足', value: viewModel.groups.partial.length }, { label: '不满足', value: viewModel.groups.missing.length }, { label: '需外部补偿', value: viewModel.groups.external.length }]} /></SectionBlock>
      <SectionBlock title="声明限制与依赖"><SummaryStatGrid columns={2} compact items={[{ label: '统一依赖', value: viewModel.latest.dependencies || '未填写' }, { label: '统一限制', value: viewModel.latest.limitations || '未填写' }]} /></SectionBlock>
      <NotePanel title="结果说明" notes={["该页用于把声明结果压缩为可沟通摘要；真正的项目级处置在闭环页中完成。"]} />
    </ProjectStageShell>
  );
}
