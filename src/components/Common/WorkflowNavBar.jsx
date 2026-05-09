import { Button } from './Button';
import styles from './WorkflowNavBar.module.css';

export function WorkflowNavBar({ leftLabel = '上一步', rightLabel = '下一步', onLeftClick, onRightClick, leftDisabled = false, rightDisabled = false, leftVariant = 'ghost', rightVariant = 'primary' }) {
  return (
    <div className={styles.navBar}>
      <Button variant={leftVariant} size="medium" onClick={onLeftClick} disabled={leftDisabled}>{leftLabel}</Button>
      <Button variant={rightVariant} size="medium" onClick={onRightClick} disabled={rightDisabled}>{rightLabel}</Button>
    </div>
  );
}
