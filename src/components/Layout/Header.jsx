import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

export function Header() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <svg className={styles.logoIcon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
        </svg>
        <div className={styles.logoText}>
          <span className={styles.logoTitle}>IEC 62443</span>
          <span className={styles.logoSubtitle}>安全网络规划辅助系统</span>
        </div>
      </div>

      <nav className={styles.nav}>
        <Link to="/" className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}>
          首页
        </Link>
        <Link to="/dashboard" className={`${styles.navLink} ${isActive('/dashboard') ? styles.active : ''}`}>
          工作台
        </Link>
        <Link to="/translation-center" className={`${styles.navLink} ${isActive('/translation-center') ? styles.active : ''}`}>
          翻译中心
        </Link>
        <Link to="/learning" className={`${styles.navLink} ${isActive('/learning') ? styles.active : ''}`}>
          学习模式
        </Link>
      </nav>
    </header>
  );
}
