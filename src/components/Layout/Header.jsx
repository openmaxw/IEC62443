import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

const NAV_ITEMS = [
  { to: '/', label: '项目', hint: '基础信息' },
  { to: '/owner', label: '需求', hint: '业主访谈' },
  { to: '/integrator', label: '设计', hint: '集成商设计' },
  { to: '/vendor', label: '能力', hint: '设备商声明' },
  { to: '/selection', label: '差距', hint: '匹配结果' }
];

const SUPPORT_ITEMS = [
  { to: '/translation-center', label: '翻译' },
  { to: '/report', label: '交付' },
  { to: '/learning', label: '学习' }
];

export function Header() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <header className={styles.header}>
      <div className={styles.shell}>
        <Link to="/" className={styles.brand}>
          <div className={styles.brandMark}>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Zm0 4.06 5 2.17v3.94c0 3.56-2.12 6.97-5 8.37-2.88-1.4-5-4.81-5-8.37V7.23l5-2.17Z" />
            </svg>
          </div>
          <div className={styles.brandText}>
            <strong>IEC 62443 协同工作台</strong>
            <span>让三方在同一项目语境下协同推进</span>
          </div>
        </Link>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <Link key={item.to} to={item.to} className={`${styles.navLink} ${isActive(item.to) ? styles.active : ''}`}>
              <span>{item.label}</span>
              <small>{item.hint}</small>
            </Link>
          ))}
        </nav>

        <div className={styles.supportNav}>
          {SUPPORT_ITEMS.map((item) => (
            <Link key={item.to} to={item.to} className={`${styles.supportLink} ${isActive(item.to) ? styles.activeSupport : ''}`}>{item.label}</Link>
          ))}
        </div>
      </div>
    </header>
  );
}
