// components/CustomWheel.jsx
"use client";
import React, { useState, useCallback, useEffect } from 'react';
import styles from '../styles/Wheel.module.css';
import WheelConfigForm from './WheelConfigForm';

const TRANSITION_TIME = 5;
const WHEEL_RADIUS = 200;

const initialSegments = [
    { id: 1, name: '大獎', probability: 20, color: '#FFD700' },
    { id: 2, name: '普通獎', probability: 50, color: '#32CD32' },
    { id: 3, name: '銘謝惠顧', probability: 30, color: '#FF6347' },
];

const CustomWheel = () => {
    const [segments, setSegments] = useState(initialSegments);
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [result, setResult] = useState(null);
    // 狀態／：控制設定表單的顯示/隱藏 ⬇️
    const [showConfig, setShowConfig] = useState(false);
    // 狀態優化 1: 歷史紀錄分離
    const [mode, setMode] = useState('repeatable'); // 'repeatable' 或 'non-repeatable'
    const [allHistory, setAllHistory] = useState({ 
        'repeatable': [], 
        'non-repeatable': [] 
    });
    
    // 模式 2 追蹤：儲存目前還未被抽中的項目 ID
    const [availableSegmentIds, setAvailableSegmentIds] = useState(segments.map(s => s.id));

    const processedSegments = segments.map(seg => ({ 
        ...seg, 
        probability: Number(seg.probability) || 0 
    }));
    const totalProbability = processedSegments.reduce((sum, seg) => sum + seg.probability, 0);
    const isValid = totalProbability > 99.99 && totalProbability < 100.01;

    // 根據當前模式篩選可抽取的項目
    const currentSegmentsToDraw = mode === 'repeatable'
        ? processedSegments
        : processedSegments.filter(s => availableSegmentIds.includes(s.id));
    
    const currentTotalProb = currentSegmentsToDraw.reduce((sum, seg) => sum + seg.probability, 0);

    // 獲取當前模式的歷史紀錄
    const currentHistory = allHistory[mode];
    // 模式切換與項目重置邏輯
    const handleModeChange = useCallback((newMode) => {
        setMode(newMode);
        // 如果切換到模式 2，確保可用項目是完整的
        if (newMode === 'non-repeatable') {
            setAvailableSegmentIds(segments.map(s => s.id));
        }
        // 切換回模式 1 則不需要重置 availableSegmentIds
    }, [segments]);
    
    // 清空紀錄 (針對當前模式)
    const clearHistory = useCallback(() => {
        setAllHistory(prev => ({ ...prev, [mode]: [] }));
        
        // 如果是模式 2，清空紀錄時重置可用項目
        if (mode === 'non-repeatable') {
            setAvailableSegmentIds(segments.map(s => s.id));
        }
    }, [mode, segments]);


    // 核心邏輯：決定中獎結果並計算停止角度
    const determineAndSpin = useCallback(() => {
        if (isSpinning || !isValid || currentSegmentsToDraw.length === 0) return; 

        setIsSpinning(true);
        setResult(null);

        // ... (省略旋轉角度和中獎項目的計算邏輯，與前一版相同，使用 segmentedDataToDraw 和 currentTotalProb) ...
        
        let rand = Math.random() * currentTotalProb;
        let winningSegment = null;
        let cumulativeAngle = 0;
        
        const segmentedDataToDraw = currentSegmentsToDraw.map(segment => {
            const angle = (segment.probability / currentTotalProb) * 360;
            const startAngle = cumulativeAngle;
            cumulativeAngle += angle;
            return { ...segment, angle, startAngle };
        });

        for (const segment of segmentedDataToDraw) {
            rand -= segment.probability;
            if (rand <= 0) {
                winningSegment = segment;
                break;
            }
        }
        
        // 計算旋轉角度 (使用累加 rotation)
        const fullSpins = 10; 
        const segmentCenter = winningSegment.startAngle + (winningSegment.angle / 2);
        const stopAngle = 360 - segmentCenter; 
        
        const targetStopAngle = 360 - segmentCenter; 
        
        // ⬇️ 核心修正開始 ⬇️
        
        // 1. 計算輪盤當前「淨角度」 (0 到 360 度之間)
        // rotation 是累加值，取模運算得到當前的視覺角度
        const currentVisualRotation = rotation % 360; 

        // 2. 計算所需的最小額外旋轉量
        // 如果當前輪盤角度為 10度，目標停止角度為 350度：
        // (350 - 10) = 340度 (正確)
        // 如果當前輪盤角度為 300度，目標停止角度為 10度：
        // (10 - 300) = -290度 (負值，需修正)
        let angleToRotate = targetStopAngle - currentVisualRotation; 

        // 3. 校正負值，確保總是順時針旋轉 (最短路徑)
        if (angleToRotate < 0) {
            angleToRotate += 360;
        }
        
        // 4. 最終總旋轉角度 = 完整圈數 + 最小額外旋轉量 + 隨機晃動
        const wobble = Math.random() * (winningSegment.angle * 0.8) - (winningSegment.angle * 0.4); 

        // 將所有新轉動量加到當前累計的 rotation 上
        const newRotation = rotation + (fullSpins * 360) + angleToRotate + wobble;
        
        // ⬇️ 核心修正結束 ⬇️
        
        setRotation(newRotation);

        // 3. 在動畫結束後更新狀態
        setTimeout(() => {
            setIsSpinning(false);
            setResult(winningSegment);
            
            // 紀錄結果到當前模式的歷史表
            setAllHistory(prev => ({ 
                ...prev, 
                [mode]: [...prev[mode], winningSegment.name] 
            }));

            // 處理模式 2: 移除邏輯
            if (mode === 'non-repeatable') {
                setAvailableSegmentIds(prevIds => prevIds.filter(id => id !== winningSegment.id));
            }
        }, TRANSITION_TIME * 1000);

    }, [isSpinning, isValid, rotation, mode, currentSegmentsToDraw, currentTotalProb]);
    

    // 輪盤渲染邏輯
    const renderWheel = () => {
        // ... (計算 gradientString 和 conicGradient 的邏輯不變) ...
        let gradientString = [];
        let cumulativeAngle = 0;
        const currentTotalProb = currentSegmentsToDraw.reduce((sum, seg) => sum + seg.probability, 0);
        
        if (currentSegmentsToDraw.length === 0) {
            return <div className={styles.wheelError}>沒有可抽取的項目了！</div>;
        }
    
        // 重新計算帶有定位資訊的扇區數據
        const segmentedDataWithPosition = currentSegmentsToDraw.map((seg) => {
            const angle = (seg.probability / currentTotalProb) * 360;
            const startAngle = cumulativeAngle;
            const centerAngle = startAngle + angle / 2; // 扇區中心角度
            cumulativeAngle += angle;
            
            // 用於 CSS 渲染
            gradientString.push(`${seg.color} ${startAngle}deg ${cumulativeAngle}deg`);
            
            return { 
                ...seg, 
                angle, 
                centerAngle // 新增中心角度
            };
        });
    
        const conicGradient = `conic-gradient(${gradientString.join(', ')})`;
        
        // 渲染輪盤主體和文字疊加層
        return (
            <div 
                className={styles.wheel} 
                style={{ 
                    backgroundImage: conicGradient,
                    transform: `rotate(${rotation}deg)`,
                    transition: `transform ${TRANSITION_TIME}s cubic-bezier(0.25, 0.1, 0.25, 1)`
                }}
            >
                {/* ⬇️ 新增文字疊加層 ⬇️ */}
                {segmentedDataWithPosition.map((seg) => (
                    <div
                        key={seg.id}
                        className={styles.segmentText}
                        style={{
                            // 1. 旋轉文字，使其位於扇區中心 (centerAngle)
                            // 2. 位移到半徑處
                            // 3. 反向旋轉 90 度 (讓文字水平)
                            transform: `
                                rotate(${seg.centerAngle}deg) 
                                translateY(-${WHEEL_RADIUS * 0.75}px) 
                                rotate(90deg)
                            `,
                            color: getContrastColor(seg.color)
                        }}
                    >
                        {seg.name.substring(0, 10)} {/* 限制文字長度 */}
                    </div>
                ))}
                {/* ⬆️ 新增文字疊加層 ⬆️ */}
            </div>
        );
    };
    
    // 輔助函式：根據背景色判斷使用黑色或白色文字 (用於提高可讀性)
    function getContrastColor(hexcolor){
        // 如果 color 是無效的，預設黑色
        if (!hexcolor || hexcolor.length < 7) return '#000000'; 
        
        // 將 HEX 轉換為 RGB
        const r = parseInt(hexcolor.slice(1, 3), 16);
        const g = parseInt(hexcolor.slice(3, 5), 16);
        const b = parseInt(hexcolor.slice(5, 7), 16);
        
        // 使用 Luma 值（亮度）來判斷對比度
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return (luma < 140) ? '#ffffff' : '#000000'; // 閾值 140
    }
    return (
        <div className={styles.mainWrapper}>
            <button 
                className={styles.configToggle} 
                onClick={() => setShowConfig(true)}
            >
                ⚙️ 設定輪盤內容
            </button>
            {/* 1. 設定表單 (在手機上會變成彈出視窗) */}
            <div className={`${styles.configWrapper} ${showConfig ? styles.configVisible : ''}`}>
                <WheelConfigForm 
                    segments={segments} 
                    setSegments={setSegments} 
                    removedSegmentIds={mode === 'non-repeatable' 
                                      ? processedSegments.filter(s => !availableSegmentIds.includes(s.id)).map(s => s.id) 
                                      : []}
                    // 傳遞關閉按鈕，用於手機版彈出視窗
                    onClose={() => setShowConfig(false)}
                />
            </div>

            
            {/* 右側：輪盤與控制 */}
            <div className={styles.wheelSection}>
                
                {/* 模式切換按鈕 */}
                <div className={styles.modeToggle}>
                    <label>
                        <input 
                            type="radio" 
                            value="repeatable" 
                            checked={mode === 'repeatable'} 
                            onChange={() => handleModeChange('repeatable')} 
                        /> 
                        模式 1: 可重複抽中
                    </label>
                    <label>
                        <input 
                            type="radio" 
                            value="non-repeatable" 
                            checked={mode === 'non-repeatable'} 
                            onChange={() => handleModeChange('non-repeatable')} 
                        /> 
                        模式 2: 抽中即移除 (剩餘 {currentSegmentsToDraw.length} 個)
                    </label>
                </div>
                
                <div className={styles.wheelContainer}>
                    <div className={styles.pointer}></div>
                    {isValid ? renderWheel() : <div className={styles.wheelError}>請設定總和 100% 的項目</div>}
                </div>

                <button 
                    onClick={determineAndSpin} 
                    disabled={isSpinning || !isValid || currentSegmentsToDraw.length === 0} 
                    className={styles.spinButton}
                >
                    {isSpinning ? '旋轉中...' : (currentSegmentsToDraw.length === 0 ? '無項目可抽' : '開始旋轉')}
                </button>
                
                {result && (
                    <div className={styles.resultDisplay}>
                        恭喜您抽中: <strong>{result.name}</strong>！
                    </div>
                )}
                
                {/* 紀錄顯示區塊 (顯示當前模式的歷史) */}
                <div className={styles.historyContainer}>
                    <h4>模式 {mode === 'repeatable' ? '1' : '2'} 抽獎紀錄 ({allHistory[mode].length} 次)</h4>
                    {allHistory[mode].length > 0 && <button onClick={clearHistory} className={styles.clearButton}>清除紀錄</button>}
                    <ul className={styles.historyList}>
                        {allHistory[mode].slice(-5).map((item, index) => (
                            <li key={index + item}>{item}</li>
                        ))}
                    </ul>
                    {allHistory[mode].length > 5 && <p>...(還有 {allHistory[mode].length - 5} 次紀錄)</p>}
                </div>
                
            </div>
        </div>
    );
};

export default CustomWheel;