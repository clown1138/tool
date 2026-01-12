"use client"; 
import React from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import styles from '../styles/HomeMenu.module.css';

interface MenuItem {
    id: number;
    name: string;
    path: string;
    icon?: string;
    roles?: string[]; 
    children?: MenuItem[];
}

interface HomeMenuProps {
    menuData: MenuItem[];
}

const HomeMenu: React.FC<HomeMenuProps> = ({ menuData }) => {
  const router = useRouter();
  
  const { role, isAuthenticated } = useSelector((state: any) => state.auth);

  const handleNavigation = (e: React.MouseEvent, item: MenuItem) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert('請先登入帳號後再進行操作');
      return;
    }

    if (item.roles && !item.roles.includes(role)) {
      alert(`您的權限為 [${role}]，不足以進入此頁面`);
      return;
    }

    router.push(item.path);
  };

  return (
    <div className={styles.homeMenuContainer}>
      <h1 className={styles.title}>Next.js 應用展示</h1>
      <p className={styles.subtitle}>請選擇您要探索的分類：</p>

      <ul className={styles.level1List}>
        {menuData.map(item => (
          <li key={item.id} className={styles.level1Item}>
            
            <h2 className={styles.level1Title}>
              {item.icon} {item.name}
            </h2>
            
            {item.children && (
              <ul className={styles.level2List}>
                {item.children.map(child => (
                  <li key={child.id} className={styles.level2Item}>
                    <button 
                      onClick={(e) => handleNavigation(e, child)} 
                      className={styles.level2Link}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        padding: 0,
                        font: 'inherit'
                      }}
                    >
                      {child.name}
                    </button>
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