"use client";
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie'; 
import { loginSuccess } from '@/lib/features/authSlice';
import styles from '../styles/LoginModal.module.css';

// 定義三種帳號權限
const MOCK_USERS = [
    { email: 'admin@test.com', password: '123', role: 'admin', name: '最高權限' },
    { email: 'editor@test.com', password: '123', role: 'editor', name: '次級權限' },
    { email: 'user@test.com', password: '123', role: 'user', name: '一般權限' },
];

const LoginModal = ({ onClose }) => {
    const [account, setAccount] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();

    const handleSubmit = (e) => {
        e.preventDefault();

        const user = MOCK_USERS.find(u => u.email === account && u.password === password);

        if (user) {
            Cookies.set('auth-token', 'mock-token-abc', { expires: 1 });
            Cookies.set('user-role', user.role, { expires: 1 });

            dispatch(loginSuccess({
                name: user.name,
                role: user.role,
                email: user.email
            }));

            alert(`歡迎，${user.name}！身分：${user.role}`);
            onClose(); 
        } else {
            alert('帳號或密碼錯誤');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
        }).catch(err => {
            console.error('無法複製: ', err);
        });
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={onClose}>✕</button>
                <h2>帳號登入</h2>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label>帳號</label>
                        <input 
                            type="text" 
                            placeholder="請輸入帳號" 
                            value={account}
                            onChange={(e) => setAccount(e.target.value)}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>密碼</label>
                        <input 
                            type="password" 
                            placeholder="請輸入密碼" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className={styles.submitBtn}>確認登入</button>
                </form>

                <div className={styles.testAccountArea}>
                    <p className={styles.testHint}>點擊帳號可快速複製：</p>
                    <div 
                        className={styles.accountTag} 
                        onClick={() => {
                            copyToClipboard('admin@test.com');
                        }}
                    >
                        <p>最高管理員：admin@test.com/123</p>
                    </div>
                    
                    <div 
                        className={styles.accountTag} 
                        onClick={() => {
                            copyToClipboard('editor@test.com');
                        }}
                    >
                        <p>次級管理員：editor@test.com/123</p> 
                    </div>

                    <div 
                        className={styles.accountTag} 
                        onClick={() => {
                            copyToClipboard('user@test.com');
                        }}
                    >
                        <p>一般使用者：user@test.com/123</p> 
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;