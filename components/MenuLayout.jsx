// components/MenuLayout.jsx
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import MenuTree from './MenuTree'; 
import menuData from '../data/menuData.json'; // 確保路徑正確
import styles from '../styles/Layout.module.css'; // 確保路徑正確

const MenuLayout = ({ children }) => {
    const pathname = usePathname();
    const isHomePage = pathname === '/';
    
    // 狀態
    const [isMobile, setIsMobile] = useState(false);
    // 側邊欄狀態：在客戶端初始化時，我們會在 useEffect 中設置
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); 

    // RWD 檢測邏輯
    useEffect(() => {
        const checkMobile = () => window.innerWidth <= 768;
        
        const handleResize = () => {
            const mobileStatus = checkMobile();
            setIsMobile(mobileStatus);
            
            // 根據模式和首頁狀態設置初始/切換後的 sidebar 狀態
            if (mobileStatus) {
                // 手機：預設收合
                setIsSidebarOpen(false);
            } else {
                // 桌面：分頁時預設開啟，首頁預設關閉
                setIsSidebarOpen(!isHomePage);
            }
        };

        // 首次運行和窗口大小改變時執行
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isHomePage]); // 依賴 isHomePage，在導航到首頁/分頁時重新運行

    // 修正點 1 & 2 核心邏輯：切換側邊欄
    const toggleSidebar = useCallback(() => {
        // 只有在非首頁時才允許切換
        if (!isHomePage) {
            setIsSidebarOpen(prev => !prev);
        }
        // 注意：手機模式下，由於 isMobile 檢測，按鈕會出現，
        // 點擊後，上面的 if 條件(!isHomePage) 讓它正常切換。
        
    }, [isHomePage]);


    // 根據狀態和模式應用 CSS 類別
    const layoutClass = isHomePage 
        ? styles.homeLayout 
        : `${styles.pageLayout} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`;
        
    const contentClass = isHomePage 
        ? styles.homeContent 
        : styles.pageContent;

    return (
        <div className={layoutClass}>
            
            {/* 頂部 Header 和 Toggle 按鈕 */}
            <header className={styles.header}>
                {/* 只有在分頁時顯示開關按鈕 */}
                {!isHomePage && (
                    <button 
                        onClick={toggleSidebar} 
                        className={styles.sidebarToggleBtn}
                    >
                        {isSidebarOpen ? '❮' : '☰'} 
                    </button>
                )}
                <div className={styles.title}>MenuTree 應用</div>
            </header>

            {/* 側邊欄：
                桌面分頁時 (isSidebarOpen=true, false)
                手機分頁時 (isSidebarOpen=false) -> 點擊按鈕後變為 true
            */}
            
            {/* 修正點 3：側邊欄的條件渲染：
                桌面版：始終渲染，CSS 負責隱藏/展開。
                手機版：只在 isSidebarOpen 時渲染 (因為手機模式是彈出式抽屜)。
                
                這裡我們使用 isSidebarOpen 來控制彈出狀態。
            */}
            {(isSidebarOpen || !isMobile) && (
                <div 
                    className={`${styles.sidebar} ${isSidebarOpen ? styles.open : styles.closed}`}
                    // 手機模式下，當 sidebar 關閉時，不應佔用空間
                    style={isMobile && !isSidebarOpen ? { display: 'none' } : {}}
                >
                    <MenuTree 
                        menuData={menuData} 
                        currentPath={pathname} 
                        // 點擊菜單項目後，手機模式下收合側邊欄
                        toggleSidebar={isMobile ? toggleSidebar : () => {}} 
                    />
                </div>
            )}
            
            {/* 主要內容區域 */}
            <main className={contentClass}>
                {children}
            </main>
        </div>
    );
};

export default MenuLayout;