"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux'; // ⬅️ 新增
import Cookies from 'js-cookie'; // ⬅️ 新增
import { loginSuccess, logout } from '@/lib/features/authSlice'; // ⬅️ 新增

import MenuTree from './MenuTree'; 
import menuData from '../data/menuData.json'; 
import styles from '../styles/Layout.module.css'; 
import LoginModal from './LoginModal';

const MenuLayout = ({ children }) => {
    const [showLogin, setShowLogin] = useState(false);
    const pathname = usePathname();
    const isHomePage = pathname === '/';
    
    const dispatch = useDispatch();
    const { role, isAuthenticated, user } = useSelector((state) => state.auth);

    useEffect(() => {
        const savedRole = Cookies.get('user-role');
        const savedToken = Cookies.get('auth-token');

        if (!isAuthenticated && savedRole && savedToken) {
            dispatch(loginSuccess({
                role: savedRole,
                name: savedRole === 'admin' ? '最高權限' : (savedRole === 'editor' ? '次級權限' : '一般用戶'),
            }));
        }
    }, [isAuthenticated, dispatch]);

    const filteredMenuData = useMemo(() => {
        const filterNode = (nodes) => {
            return nodes
                .filter(node => !node.roles || node.roles.includes(role))
                .map(node => {
                    if (node.children) {
                        return { ...node, children: filterNode(node.children) };
                    }
                    return node;
                })
                .filter(node => node.path !== "#" || (node.children && node.children.length > 0));
        };
        return filterNode(menuData);
    }, [role]);

    const [isMobile, setIsMobile] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); 

    useEffect(() => {
        const checkMobile = () => window.innerWidth <= 768;
        const handleResize = () => {
            const mobileStatus = checkMobile();
            setIsMobile(mobileStatus);
            if (mobileStatus) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(!isHomePage);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isHomePage]);

    const toggleSidebar = useCallback(() => {
        if (!isHomePage) {
            setIsSidebarOpen(prev => !prev);
        }
    }, [isHomePage]);

    const handleLogout = () => {
        Cookies.remove('auth-token');
        Cookies.remove('user-role');
        dispatch(logout());
        window.location.href = '/'; 
    };

    const layoutClass = isHomePage 
        ? styles.homeLayout 
        : `${styles.pageLayout} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`;
        
    const contentClass = isHomePage 
        ? styles.homeContent 
        : styles.pageContent;

    return (
        <div className={layoutClass}>
            {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

            <header className={styles.header}>

                {!isHomePage && (
                    <button onClick={toggleSidebar} className={styles.sidebarToggleBtn}>
                        {isSidebarOpen ? '❮' : '☰'} 
                    </button>
                )}
                <div className={styles.title}>MenuTree 應用</div>

                <div className={styles.authContainer}>
                    {isAuthenticated ? (
                        <div className={styles.userSection}>
                            <span className={styles.userName}>{user?.name}</span>
                            <button className={styles.loginBtn} onClick={handleLogout}>
                                登出
                            </button>
                        </div>
                    ) : (
                        <button className={styles.loginBtn} onClick={() => setShowLogin(true)}>
                            登入
                        </button>
                    )}
                </div>
            </header>

            {!isHomePage && (isSidebarOpen || !isMobile) && (
                <div 
                    className={`${styles.sidebar} ${isSidebarOpen ? styles.open : styles.closed}`}
                    style={isMobile && !isSidebarOpen ? { display: 'none' } : {}}
                >
                    <MenuTree 
                        menuData={filteredMenuData} 
                        currentPath={pathname} 
                        toggleSidebar={isMobile ? toggleSidebar : () => {}} 
                    />
                </div>
            )}
            <main className={contentClass}>
                {children}
            </main>
        </div>
    );
};

export default MenuLayout;