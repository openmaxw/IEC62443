import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.shell}>
        <p className={styles.meta}>本系统及相关源代码/文档公开展示，仅用于 IEC 62443 研究、演示、审阅与作品展示目的；不构成认证结论、合规结论或正式工程设计依据。</p>
        <p className={styles.meta}>除浏览和评估本公开演示外，未经版权持有人事先书面许可，不得使用、复制、修改、部署、分发、再许可、商业化本软件，或基于本软件创作衍生作品。</p>
        <p className={styles.meta}>© 2026 Max Wang. All rights reserved. 许可申请与交流合作请联系 <a className={styles.link} href="mailto:openmax@139.com">openmax@139.com</a>，并说明使用场景、组织信息与授权范围。</p>
      </div>
    </footer>
  );
}
