// components/HomeMenu.tsx
import Link from 'next/link';
import React from 'react';
import styles from '../styles/HomeMenu.module.css';

// 假設的類型定義
interface MenuItem {
    id: number;
    name: string;
    path: string;
    icon?: string;
    children?: MenuItem[];
}

interface HomeMenuProps {
    menuData: MenuItem[];
}

const HomeMenu: React.FC<HomeMenuProps> = ({ menuData }) => {
  return (
    <div className={styles.homeMenuContainer}>
      <h1 className={styles.title}>Next.js </h1>
      <h1 className={styles.title}>應用展示</h1>
      <p className={styles.subtitle}>請選擇您要探索的分類：</p>

      <ul className={styles.level1List}>
        {menuData.map(item => (
          <li key={item.id} className={styles.level1Item}>
            
            {/* 第一層標題 */}
            <h2 className={styles.level1Title}>
              {item.icon} {item.name}
            </h2>
            
            {/* 第二層條列 */}
            {item.children && (
              <ul className={styles.level2List}>
                {item.children.map(child => (
                  <li key={child.id} className={styles.level2Item}>
                    <Link href={child.path} className={styles.level2Link}>
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HomeMenu;