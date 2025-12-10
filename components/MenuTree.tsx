// components/MenuTree.tsx (修正後的邏輯)
import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/MenuTree.module.css';

// 假設的類型定義
interface MenuItem {
    id: number;
    name: string;
    path: string;
    icon?: string;
    children?: MenuItem[];
}

interface MenuTreeProps {
    menuData: MenuItem[];
    currentPath: string;
    toggleSidebar: () => void;
}

const MenuTree: React.FC<MenuTreeProps> = ({ menuData, currentPath, toggleSidebar }) => {
    const [openItemId, setOpenItemId] = useState<number | null>(null);

    const isCurrent = (path: string) => currentPath === path;

    return (
        <nav className={styles.menuNav}>
            <button className={styles.closeBtn} onClick={toggleSidebar}>✕</button>

            <ul className={styles.level1}>
                {menuData.map(item => {
                    const hasChildren = !!item.children && item.children.length > 0;
                    
                    // 展開/收合的函式
                    const handleToggle = (e: React.MouseEvent) => {
                        e.preventDefault(); // 阻止任何父層或 Link 的默認行為
                        setOpenItemId(openItemId === item.id ? null : item.id);
                    };

                    return (
                        <li key={item.id} className={styles.level1Item}>
                            <div className={styles.level1Link}> 
                                <span>{item.icon}</span>
                                
                                {/* 核心修正：
                                    如果 hasChildren: Link 點擊僅執行 toggleSidebar，並阻止導航。
                                    如果沒有子項目: Link 點擊執行 toggleSidebar 並允許導航。
                                */}
                                <Link 
                                    href={item.path} 
                                    className={`${styles.level1Text} ${isCurrent(item.path) ? styles.activeText : ''}`}
                                    // 點擊 Link 時執行的函式
                                    onClick={(e) => {
                                        if (hasChildren) {
                                            // 有子項目時：阻止導航，只執行展開/收合
                                            e.preventDefault();
                                            handleToggle(e);
                                        } else {
                                            // 無子項目時：允許導航，但執行手機側邊欄收合
                                            toggleSidebar();
                                        }
                                    }}
                                >
                                    {item.name}
                                </Link>

                                {/* 展開箭頭/圖標的點擊區 */}
                                {hasChildren && (
                                    <span onClick={handleToggle} className={styles.toggleIcon}>
                                        {openItemId === item.id ? '▲' : '▼'}
                                    </span>
                                )}
                            </div>

                            {/* 第二層選單 (僅在有子項目時渲染) */}
                            {hasChildren && (
                                <ul className={`${styles.level2} ${openItemId === item.id ? styles.open : ''}`}>
                                    {item.children!.map(child => (
                                        <li key={child.id}>
                                            <Link 
                                                href={child.path} 
                                                className={`${styles.level2Link} ${isCurrent(child.path) ? styles.active : ''}`}
                                                onClick={toggleSidebar}
                                            >
                                                {child.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default MenuTree;