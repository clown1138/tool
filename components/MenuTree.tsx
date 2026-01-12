import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/MenuTree.module.css';

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
    useEffect(() => {
        menuData.forEach(item => {
            if (item.children) {
                const hasActiveChild = item.children.some(child => child.path === currentPath);
                if (hasActiveChild) {
                    setOpenItemId(item.id); 
                }
            }
        });
    }, [currentPath, menuData]);
    const isCurrent = (path: string) => currentPath === path;

    return (
        <nav className={styles.menuNav}>
            <button className={styles.closeBtn} onClick={toggleSidebar}>✕</button>

            <ul className={styles.level1}>
                {menuData.map(item => {
                    const hasChildren = !!item.children && item.children.length > 0;
                    
                    const handleToggle = (e: React.MouseEvent) => {
                        e.preventDefault();
                        setOpenItemId(openItemId === item.id ? null : item.id);
                    };

                    return (
                        <li key={item.id} className={styles.level1Item}>
                            <div className={styles.level1Link}> 
                                <span>{item.icon}</span>
                                <Link 
                                    href={item.path} 
                                    className={`${styles.level1Text} ${isCurrent(item.path) ? styles.activeText : ''}`}
                                    onClick={(e) => {
                                        if (hasChildren) {
                                            e.preventDefault();
                                            handleToggle(e);
                                        } else {
                                            toggleSidebar();
                                        }
                                    }}
                                >
                                    {item.name}
                                </Link>

                                {hasChildren && (
                                    <span onClick={handleToggle} className={styles.toggleIcon}>
                                        {openItemId === item.id ? '▲' : '▼'}
                                    </span>
                                )}
                            </div>

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