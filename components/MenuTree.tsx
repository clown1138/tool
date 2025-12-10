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
                    
                    // 根據是否有子項目決定點擊行為
                    const clickHandler = hasChildren 
                        ? () => setOpenItemId(openItemId === item.id ? null : item.id) // 展開/收合
                        : toggleSidebar; // 如果沒有子項目，點擊後跳轉並收起側邊欄 (手機)

                    return (
                        <li key={item.id} className={styles.level1Item}>
                            {/* 1. 外部 Div 用於結構和樣式 */}
                            <div 
                                className={`${styles.level1Link} ${isCurrent(item.path) ? styles.active : ''}`}
                            >
                                <span>{item.icon}</span>
                                
                                {/* 2. Link 元件的放置：
                                   - 如果有子項目：Link 只包裹文字，點擊 Link 仍然跳轉，但主要 div 點擊不跳轉。
                                   - 如果沒有子項目：將 Link 包裹整個可點擊區域，並執行 clickHandler。
                                */}
                                {hasChildren ? (
                                    <>
                                        {/* A. 有子項目時：Link 只包裹文字，點擊 div 執行展開 */}
                                        <div 
                                            onClick={clickHandler} // 只負責展開/收合
                                            className={styles.level1TextWrapper} // 新增樣式類別，用於排版
                                        >
                                            <Link 
                                                href={item.path} 
                                                className={isCurrent(item.path) ? styles.activeText : ''}
                                                // 點擊 Link 也應收起側邊欄 (手機)
                                                onClick={toggleSidebar} 
                                            >
                                                {item.name}
                                            </Link>
                                        </div>
                                        {/* 展開箭頭 */}
                                        <span onClick={clickHandler} className={styles.toggleIcon}>
                                            {openItemId === item.id ? '▲' : '▼'}
                                        </span>
                                    </>
                                ) : (
                                    // B. 無子項目時：整個 Link 充當可點擊區域
                                    <Link 
                                        href={item.path} 
                                        className={`${styles.level1LinkOnly} ${isCurrent(item.path) ? styles.activeText : ''}`}
                                        onClick={clickHandler} // 執行跳轉並收合
                                    >
                                        {item.name}
                                    </Link>
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