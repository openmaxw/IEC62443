import { Link } from 'react-router-dom';
import { Card, Button, Badge } from '../../components/Common';
import { useIntegratorPath, useOwnerPath, useProject, useVendorPath } from '../../hooks/useProject';
import styles from './Dashboard.module.css';

function getStepStatus(done) {
  return done ? { label: '已完成', variant: 'success' } : { label: '待完成', variant: 'warning' };
}

export function Dashboard() {
  const { state } = useProject();
  const { projectMeta, assessment, riskProfile } = useOwnerPath();
  const { plan } = useIntegratorPath();
  const { capabilities, matchResults } = useVendorPath();

  const ownerDone = Boolean(assessment && riskProfile);
  const integratorDone = Boolean(plan);
  const vendorDone = Boolean(capabilities?.length);
  const selectionDone = Boolean(matchResults?.results?.length);

  const steps = [
    { id: 'owner', title: '业主路径', done: ownerDone, link: ownerDone ? '/owner/result' : '/owner' },
    { id: 'integrator', title: '集成商路径', done: integratorDone, link: integratorDone ? '/integrator/result' : '/integrator' },
    { id: 'vendor', title: '设备商路径', done: vendorDone, link: vendorDone ? '/vendor/result' : '/vendor' },
    { id: 'selection', title: '选型匹配', done: selectionDone, link: '/selection' }
  ];

  const missingInputs = [
    !ownerDone ? '缺少业主风险访谈与风险翻译结果' : null,
    !integratorDone ? '缺少集成商 Zone/Conduit 与通信矩阵规划' : null,
    !vendorDone ? '缺少设备商能力声明与证据边界' : null,
    !selectionDone ? '缺少最终选型匹配结果' : null
  ].filter(Boolean);

  const nextAction = !ownerDone
    ? { label: '继续业主路径', link: '/owner' }
    : !integratorDone
      ? { label: '继续集成商路径', link: '/integrator' }
      : !vendorDone
        ? { label: '继续设备商路径', link: '/vendor' }
        : { label: '查看选型匹配', link: '/selection' };

  const latestDeliverables = [
    ownerDone ? '业主交接物' : null,
    integratorDone ? '系统规划结果' : null,
    vendorDone ? '设备能力声明结果' : null,
    selectionDone ? '选型匹配结果' : null
  ].filter(Boolean);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>项目工作台</h1>
          <p className={styles.subtitle}>{projectMeta?.projectName || '未命名项目'} · 当前状态：{state.projectMeta?.status || 'draft'}</p>
        </div>
        <div className={styles.actions}>
          <Link to={nextAction.link}><Button variant="primary">{nextAction.label}</Button></Link>
          <Link to="/report"><Button variant="secondary">查看交付中心</Button></Link>
        </div>
      </div>

      <div className={styles.grid}>
        <Card>
          <h3>环节完成状态</h3>
          <div className={styles.statusList}>
            {steps.map((step) => {
              const status = getStepStatus(step.done);
              return (
                <div key={step.id} className={styles.statusItem}>
                  <div>
                    <strong>{step.title}</strong>
                    <div className={styles.helper}>点击可继续查看或补充该环节</div>
                  </div>
                  <div className={styles.actions}>
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <Link to={step.link}><Button variant="ghost" size="small">进入</Button></Link>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3>缺失输入</h3>
          <div className={styles.todoList}>
            {missingInputs.length === 0 ? (
              <div className={styles.todoItem}><span>当前关键输入已补齐，可继续查看交付物或选型匹配。</span></div>
            ) : missingInputs.map((item) => (
              <div key={item} className={styles.todoItem}><span>{item}</span></div>
            ))}
          </div>
        </Card>
      </div>

      <div className={styles.grid}>
        <Card>
          <h3>下一步建议</h3>
          <div className={styles.todoList}>
            <div className={styles.todoItem}><span>{nextAction.label}</span></div>
            {ownerDone && !integratorDone && <div className={styles.todoItem}><span>先补齐通信流与边界约束，再生成系统规划结果。</span></div>}
            {integratorDone && !vendorDone && <div className={styles.todoItem}><span>根据能力需求矩阵填写设备商声明、依赖条件与证据类型。</span></div>}
            {vendorDone && !selectionDone && <div className={styles.todoItem}><span>进入选型匹配，核对五档状态与差距说明。</span></div>}
          </div>
        </Card>

        <Card>
          <h3>最新交接物</h3>
          <div className={styles.deliverableList}>
            {latestDeliverables.length === 0 ? (
              <div className={styles.deliverableItem}><span>暂无交接物，请先完成至少一个角色路径。</span></div>
            ) : latestDeliverables.map((item) => (
              <div key={item} className={styles.deliverableItem}><span>{item}</span></div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
