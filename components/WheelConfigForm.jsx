// components/WheelConfigForm.jsx
"use client";
import React from 'react';
import styles from '../styles/Wheel.module.css';

const WheelConfigForm = ({ segments, setSegments, removedSegmentIds = [], onClose }) => {   
    // 移除輪盤項目
    const removeSegment = (id) => {
        setSegments(segments.filter(seg => seg.id !== id));
    };
    const redistributeProbability = (count, currentSegments, addNew = false) => {
        if (count === 0) return [];
        
        const averageProb = (100 / count);
        // 使用 Math.floor 來確保四捨五入時，總和不會超過 100
        const baseProb = Math.floor(averageProb * 100) / 100; // e.g., 33.33
        
        let updatedSegments = [];
        let totalAssignedProb = 0;
        
        // 1. 為所有現有項目分配基礎機率
        const existingSegmentsCount = addNew ? currentSegments.length : count;
        for (let i = 0; i < existingSegmentsCount; i++) {
            const seg = currentSegments[i];
            updatedSegments.push({ 
                ...seg, 
                probability: baseProb 
            });
            totalAssignedProb += baseProb;
        }

        // 2. 如果是新增，創建新項目並分配基礎機率
        if (addNew) {
            const newId = Date.now();
            const newSegment = {
                id: newId,
                name: `項目 ${count}`,
                probability: baseProb,
                color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`
            };
            updatedSegments.push(newSegment);
            totalAssignedProb += baseProb;
        }
        
        // 3. 計算並分配剩餘的誤差給最後一個項目 (或第一個，這裡選擇最後一個)
        // 使用toFixed(2)確保計算結果是浮點數且小數位數正確
        const remainingError = 100 - totalAssignedProb;
        
        // 將誤差精確地加到最後一個項目上
        if (updatedSegments.length > 0) {
            const lastIndex = updatedSegments.length - 1;
            // 確保最後一個項目的機率加上誤差後，總和為 100
            updatedSegments[lastIndex].probability = 
                parseFloat((updatedSegments[lastIndex].probability + remainingError).toFixed(2));
        }

        return updatedSegments;
    };


    // 新增項目時，平均分配機率
    const addSegment = () => {
        const newSegmentsCount = segments.length + 1;
        const newSegments = redistributeProbability(newSegmentsCount, segments, true);
        setSegments(newSegments);
    };
    
    // 將所有現有項目的機率設定為平均值 (手動按鈕功能)
    const setAverageProbability = () => {
        if (segments.length === 0) return;
        const newSegments = redistributeProbability(segments.length, segments, false);
        setSegments(newSegments);
    };

    // ... (render 部分的 totalProbability 計算邏輯保持不變，但由於計算邏輯修正，這裡會是精確的 100)
    const totalProbability = segments.reduce((sum, seg) => sum + (Number(seg.probability) || 0), 0);
    // 處理輸入欄位變更 ⬇️
    const handleChange = (id, field, value) => {
        setSegments(segments.map(seg => {
            if (seg.id === id) {
                let updatedValue = value;
                
                // 特別處理 'probability' 欄位，確保它是一個可以被轉換的字串
                if (field === 'probability') {
                    // 確保輸入的不是 NaN 且不為空字串，我們只更新原始的字串值，
                    // 實際計算時再轉換為數字。
                    if (value === '' || !isNaN(Number(value))) {
                        updatedValue = value;
                    } else {
                        // 如果輸入非法字符，則不更新狀態
                        return seg;
                    }
                }
                
                return { ...seg, [field]: updatedValue };
            }
            return seg;
        }));
    };
    return (
<div className={styles.configContainer}>
            {/* ⬇️ 新增關閉按鈕 (僅在手機版顯示) ⬇️ */}
            <button className={styles.closeButton} onClick={onClose}>
                ✕ 關閉設定
            </button>
            <h3>⚙️ 輪盤內容設定</h3>
            {removedSegmentIds.length > 0 && (
                <p className={styles.mode2Tip}>在 **模式 2** 下，已抽中的項目在設定中會被 **反灰**。</p>
            )}

            {segments.map((seg) => {
                // 判斷該項目是否已被移除
                const isRemoved = removedSegmentIds.includes(seg.id);
                
                return (
                    <div 
                        key={seg.id} 
                        className={`${styles.segmentInputRow} ${isRemoved ? styles.segmentRemoved : ''}`}
                    >
                       <input
                            type="text"
                            placeholder="名稱"
                            value={seg.name} // 使用字串值
                            onChange={(e) => handleChange(seg.id, 'name', e.target.value)}
                            className={styles.inputName}
                            disabled={isRemoved}
                        />
                        <input
                            type="number"
                            placeholder="機率 (%)"
                            // 在這裡不使用 toFixed(2) 來顯示，直接使用狀態中的原始值 (字串或數字)，
                            // 這樣使用者才能輸入小數點。toFixed(2) 會強制截斷使用者正在輸入的值。
                            value={seg.probability} 
                            onChange={(e) => handleChange(seg.id, 'probability', e.target.value)}
                            className={styles.inputProb}
                            min="0"
                            max="100"
                            disabled={isRemoved}
                        />
                        <input
                            type="color"
                            value={seg.color}
                            onChange={(e) => handleChange(seg.id, 'color', e.target.value)}
                            className={styles.inputColor}
                            disabled={isRemoved}
                        />
                        <button onClick={() => removeSegment(seg.id)} className={styles.removeButton} disabled={isRemoved}>
                            移除
                        </button>
                    </div>
                );
            })}
            
            <button onClick={addSegment} className={styles.addButton}>
                + 新增項目
            </button>

            <div className={styles.probSummary}>
            <strong>總機率: {totalProbability.toFixed(2)}%</strong>
            {!(totalProbability > 99.99 && totalProbability < 100.01) && (
                    <span className={styles.errorText}> (機率總和應為 100%)</span>
                )}
            </div>
        </div>
    );
};

export default WheelConfigForm;