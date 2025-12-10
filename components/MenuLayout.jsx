// components/Layout.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import MenuTree from './MenuTree';
import menuData from '../data/menuData.json';
import styles from '../styles/Layout.module.css';

const MenuLayout = ({ children }) => {
    const pathname = usePathname();
    const isHomePage = pathname === '/';
    
    // 側邊欄狀態：在分頁時預設為開啟 (桌面)
    const [isSidebarOpen, setIsSidebarOpen] = useState(!isHomePage);
    
    // 偵測是否為手機模式 (RWD)
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => window.innerWidth <= 768;
        const mobileStatus = checkMobile();
        setIsMobile(mobileStatus);
        
        // 在桌面模式下，根據是否為首頁設定初始狀態
        if (!mobileStatus) {
            setIsSidebarOpen(!isHomePage);
        } else {
            // 手機模式預設收合
            setIsSidebarOpen(false);
        }

        const handleResize = () => {
            const newMobileStatus = checkMobile();
            setIsMobile(newMobileStatus);
            // 當從手機切換到桌面時，恢復分頁開啟狀態
            if (!newMobileStatus && !isHomePage) {
                setIsSidebarOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isHomePage]);
    
    const toggleSidebar = () => {
        // 在手機模式下，點擊按鈕直接切換狀態
        if (isMobile || !isHomePage) {
            setIsSidebarOpen(prev => !prev);
        }
    };

    // 根據狀態和模式應用 CSS 類別
    const layoutClass = isHomePage 
        ? styles.homeLayout 
        : `${styles.pageLayout} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`;
        
    const contentClass = isHomePage 
        ? styles.homeContent 
        : styles.pageContent;

    return (
        <div className={layoutClass}>
            
            {/* 側邊欄 (只有在分頁或手機展開時顯示) */}
            {(isSidebarOpen || !isHomePage) && (
                <div className={`${styles.sidebar} ${isSidebarOpen ? styles.open : styles.closed}`}>
                    <MenuTree 
                        menuData={menuData} 
                        currentPath={pathname} 
                        // 手機版點擊連結會觸發收合
                        toggleSidebar={isMobile ? toggleSidebar : () => {}} 
                    />
                </div>
            )}
            
            {/* 頂部導航/切換按鈕 */}
            <header className={styles.header}>
                {/* 1. 電腦版分頁時：左側隱藏按鈕 */}
                {/* 2. 手機版分頁時：單一 ICON 展開按鈕 */}
                {/* 3. 手機/桌面首頁時：不顯示按鈕 (或顯示回首頁按鈕) */}
                
                {!isHomePage && (
                    <button 
                        onClick={toggleSidebar} 
                        className={styles.sidebarToggleBtn}
                    >
                        {isSidebarOpen ? '❮' : '☰'} 
                    </button>
                )}
                <div className={styles.title}>NEXT.js 應用</div>
            </header>

            {/* 主要內容區域 */}
            <main className={contentClass}>
                {children}
            </main>
        </div>
    );
};

export default MenuLayout;