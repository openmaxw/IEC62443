import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.shell}>
        <p className={styles.title}>IEC 62443 工业网络安全方法研究与协同设计平台</p>
        <p className={styles.meta}>本平台内容仅供学习交流与方案研究参考，未经授权不得复制、抄袭、转载、传播或用于商业用途。</p>
        <p className={styles.meta}>交流合作请<a className={styles.link} href="mailto:max.wang@moxa.com">联系作者</a> · © Max Wang</p>
      </div>
    </footer>
  );
}
