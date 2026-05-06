import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.shell}>
        <p className={styles.title}>IEC 62443 方法研究与协同流程探索项目</p>
        <p className={styles.meta}>仅供学习交流与方案研究参考 · 如需交流合作，请联系作者 · © Max Wang</p>
      </div>
    </footer>
  );
}
