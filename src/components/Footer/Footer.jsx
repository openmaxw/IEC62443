import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.shell}>
        <p className={styles.meta}>本项目内容仅用于研究、学习与方案讨论参考。</p>
        <p className={styles.meta}>未经授权，请勿复制、转载、传播或用于商业用途。</p>
        <p className={styles.meta}>交流合作请<a className={styles.link} href="mailto:max.wang@moxa.com">联系作者</a> · © Max Wang</p>
      </div>
    </footer>
  );
}
