import { Link } from 'react-router-dom';
import { Card, Button } from '../../components/Common';
import { useProject } from '../../hooks/useProject';
import styles from './Home.module.css';

export function Home() {
  const { state } = useProject();
  const hasProject = Boolean(
    state.projectMeta?.projectName ||
    state.ownerProfile?.assessment ||
    state.integratorDesign?.plan ||
    state.vendorCatalog?.capabilities?.length
  );

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.heroIcon}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
          </svg>
        </div>
        <h1 className={styles.title}>IEC 62443</h1>
        <p className={styles.subtitle}>安全网络规划与选型辅助系统</p>
        <p className={styles.description}>
          面向 IEC 62443 初学者的智能规划平台<br/>
          让业主、集成商、设备商轻松完成需求翻译、规则映射与设备选型
        </p>
        {hasProject && (
          <Link to="/dashboard" className={styles.roleLink}>
            <Button variant="secondary" size="large">继续当前项目</Button>
          </Link>
        )}
      </div>

      <div className={styles.roleCards}>
        <Card className={styles.roleCard} variant="default">
          <div className={styles.roleIcon} data-role="owner">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <h3 className={styles.roleTitle}>业主 / 资产所有者</h3>
          <p className={styles.roleDesc}>
            明确业务风险与安全目标<br/>
            生成对集成商的需求说明
          </p>
          <Link to="/owner" className={styles.roleLink}>
            <Button variant="primary" size="large">
              开始评估
            </Button>
          </Link>
        </Card>

        <Card className={styles.roleCard} variant="default">
          <div className={styles.roleIcon} data-role="integrator">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
            </svg>
          </div>
          <h3 className={styles.roleTitle}>集成商 / 方案设计方</h3>
          <p className={styles.roleDesc}>
            制定分区分域方案<br/>
            生成设备能力需求清单
          </p>
          <Link to="/integrator" className={styles.roleLink}>
            <Button variant="secondary" size="large">
              开始规划
            </Button>
          </Link>
        </Card>

        <Card className={styles.roleCard} variant="default">
          <div className={styles.roleIcon} data-role="vendor">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
            </svg>
          </div>
          <h3 className={styles.roleTitle}>设备商 / 产品供应商</h3>
          <p className={styles.roleDesc}>
            建立产品能力画像<br/>
            生成项目匹配分析
          </p>
          <Link to="/vendor" className={styles.roleLink}>
            <Button variant="ghost" size="large">
              录入能力
            </Button>
          </Link>
        </Card>
      </div>

      <div className={styles.flowSection}>
        <h2 className={styles.flowTitle}>三方协作流程</h2>
        <div className={styles.flowChart}>
          <div className={styles.flowStep}>
            <div className={styles.flowNumber}>1</div>
            <div className={styles.flowContent}>
              <h4>业主定目标</h4>
              <p>明确业务风险与安全目标</p>
            </div>
          </div>
          <div className={styles.flowArrow}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
            </svg>
          </div>
          <div className={styles.flowStep}>
            <div className={styles.flowNumber}>2</div>
            <div className={styles.flowContent}>
              <h4>集成商搭系统</h4>
              <p>分区分域与规则设计</p>
            </div>
          </div>
          <div className={styles.flowArrow}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
            </svg>
          </div>
          <div className={styles.flowStep}>
            <div className={styles.flowNumber}>3</div>
            <div className={styles.flowContent}>
              <h4>设备商供能力</h4>
              <p>产品能力与证据输入</p>
            </div>
          </div>
          <div className={styles.flowArrow}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
            </svg>
          </div>
          <div className={styles.flowStep}>
            <div className={styles.flowNumber}>4</div>
            <div className={styles.flowContent}>
              <h4>系统做翻译</h4>
              <p>需求匹配与选型建议</p>
            </div>
          </div>
          <div className={styles.flowArrow}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
            </svg>
          </div>
          <div className={styles.flowStep}>
            <div className={styles.flowNumber}>5</div>
            <div className={styles.flowContent}>
              <h4>项目可验收</h4>
              <p>方案输出与运维基线</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.quickLinks}>
        <Link to="/selection" className={styles.quickLink}>
          <span>选型匹配中心</span>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
          </svg>
        </Link>
        <Link to="/report" className={styles.quickLink}>
          <span>报告中心</span>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
          </svg>
        </Link>
        <Link to="/learning" className={styles.quickLink}>
          <span>学习模式</span>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
          </svg>
        </Link>
      </div>
    </div>
  );
}
