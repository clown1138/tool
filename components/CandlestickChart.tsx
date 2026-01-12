"use client";

import React, { useMemo, useState, useEffect, useLayoutEffect } from 'react';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  PointElement,
  LineElement,
  Legend,
  Filler
} from "chart.js";
import "chartjs-adapter-date-fns";
import annotationPlugin from "chartjs-plugin-annotation";
import { CandlestickController, CandlestickElement } from "chartjs-chart-financial";

// 註冊組件
ChartJS.register(
  CategoryScale, LinearScale, TimeScale, Tooltip, PointElement, 
  LineElement, Legend, annotationPlugin, CandlestickController, CandlestickElement, Filler
);

type Candle = {
  x: number; 
  o: number; h: number; l: number; c: number;
};

type ExtremePoint = {
  index: number;
  price: number;
  x: number;
};

type WPattern = {
  L1: ExtremePoint;
  L2: ExtremePoint;
  M: ExtremePoint;
  breakout: Candle;
};

function findLocalExtremes(data: Candle[], window: number = 5) {
  const lows: ExtremePoint[] = [];
  const highs: ExtremePoint[] = [];
  for (let i = window; i < data.length - window; i++) {
    const currentLow = data[i].l;
    const currentHigh = data[i].h;
    if (data.slice(i - window, i + window + 1).every(d => currentLow <= d.l)) {
      lows.push({ index: i, price: currentLow, x: data[i].x });
    }
    if (data.slice(i - window, i + window + 1).every(d => currentHigh >= d.h)) {
      highs.push({ index: i, price: currentHigh, x: data[i].x });
    }
  }
  return { lows, highs };
}


function detectWBottoms(data: Candle[], settings: {
    footDiff: number;    // 左右腳價差容許度 (原本是 0.05)
    minBounce: number;   // 頸線回升最小比例 (原本是 0.02)
    minGap: number;      // 兩腳之間最小距離 (原本是 10)
  }) {
    const windowSize = 5;
    const { lows, highs } = findLocalExtremes(data, windowSize);
    const results: WPattern[] = [];
  
    for (let i = 0; i < lows.length - 1; i++) {
      const L1 = lows[i];
      for (let j = i + 1; j < lows.length; j++) {
        const L2 = lows[j];
        const gap = L2.index - L1.index;
        
        // 使用調整後的 minGap
        if (gap < settings.minGap || gap > 100) continue;
  
        const ms = highs.filter(h => h.index > L1.index && h.index < L2.index);
        if (ms.length === 0) continue;
        const M = ms.reduce((prev, curr) => (prev.price > curr.price ? prev : curr));
  
        // 使用調整後的 minBounce (頸線高度)
        if ((M.price - L1.price) / L1.price < settings.minBounce) continue;
        
        // 使用調整後的 footDiff (左右腳接近程度)
        if (Math.abs(L1.price - L2.price) / L1.price > settings.footDiff) continue;
  
        const breakout = data.slice(L2.index + 1).find(d => d.c > M.price);
        if (breakout) {
          results.push({ L1, L2, M, breakout });
          break;
        }
      }
    }
    return results;
  }
/* ------------------ 3. 主元件 ------------------ */
export default function AdvancedStockChart({ data: rawData }: { data: any[] }) {
  
    // A. 資料預處理
    const fullData = useMemo(() => {
      if (!rawData || rawData.length === 0) return [];
      return rawData.map(d => ({ ...d, x: new Date(d.x).getTime() })).sort((a, b) => a.x - b.x);
    }, [rawData]);
  
    // B. 基礎狀態
    const [range, setRange] = useState<[number, number]>([0, 0]);
    
    // C. 偵測 W 底
    // const wPatterns = useMemo(() => {
    //   return fullData.length > 0 ? detectWBottoms(fullData) : [];
    // }, [fullData]);
    const [settings, setSettings] = useState({
        footDiff: 0.03,   // 3% 價差
        minBounce: 0.03,  // 3% 頸線高度
        minGap: 15        // 兩腳間距至少 15 根
      });
    
      // 修改 wPatterns 的 useMemo，將 settings 加入依賴
      const wPatterns = useMemo(() => {
        return fullData.length > 0 ? detectWBottoms(fullData, settings) : [];
      }, [fullData, settings]); // 當 settings 改變，會自動重算
    // D. 【新增】控制顯示/隱藏的狀態 (預設全部顯示)
    const [visibleIndices, setVisibleIndices] = useState<number[]>([]);
  
    // 當偵測到新資料或 W 底更新時，預設顯示所有
    useEffect(() => {
      if (wPatterns.length > 0) {
        setVisibleIndices(wPatterns.map((_, i) => i));
      }
    }, [wPatterns]);
  
    // E. 點擊切換函數
    const togglePattern = (index: number) => {
      setVisibleIndices(prev => 
        prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
      );
    };
  
    const toggleAll = () => {
      if (visibleIndices.length === wPatterns.length) setVisibleIndices([]);
      else setVisibleIndices(wPatterns.map((_, i) => i));
    };
  
    // F. 繪製 Annotation (只繪製 visibleIndices 內的)
    const annotations = useMemo(() => {
      const anns: any = {};
      if (fullData.length === 0) return anns;
      const lastDate = fullData[fullData.length - 1].x;
  
      wPatterns.forEach((w, i) => {
        if (!visibleIndices.includes(i)) return;

  const blue = 'rgba(54, 162, 235, 1)';
  const red = 'rgba(239, 68, 68, 1)';

  // 定義起始點 (與 W 本體一致)
  const startIdx = Math.max(0, w.L1.index - 5);
  const startTime = fullData[startIdx].x;
        // 為了讓 W 字更完整，我們定義四個點的連線
        
        // 1. 起始點 (Start -> L1): 找 L1 前面幾根 K 線的高點，模擬跌下來的過程
        const startPoint = fullData[startIdx];
      
        // --- 繪製 W 字本體 (四段線) ---
        
        // 第一段：下行 (跌到左腳)
        anns[`line1_${i}`] = { 
          type: 'line', xMin: startPoint.x, yMin: startPoint.h, xMax: w.L1.x, yMax: w.L1.price, 
          borderColor: blue, borderWidth: 3 
        };
        
        // 第二段：反彈 (左腳到頸線 M)
        anns[`line2_${i}`] = { 
          type: 'line', xMin: w.L1.x, yMin: w.L1.price, xMax: w.M.x, yMax: w.M.price, 
          borderColor: blue, borderWidth: 3 
        };
        
        // 第三段：回檔 (頸線 M 到右腳 L2)
        anns[`line3_${i}`] = { 
          type: 'line', xMin: w.M.x, yMin: w.M.price, xMax: w.L2.x, yMax: w.L2.price, 
          borderColor: blue, borderWidth: 3 
        };
        
        // 第四段：突破 (右腳 L2 到突破點)
        anns[`line4_${i}`] = { 
          type: 'line', xMin: w.L2.x, yMin: w.L2.price, xMax: w.breakout.x, yMax: w.breakout.c, 
          borderColor: blue, borderWidth: 3 
        };
      
        // --- 頸線與背景 ---
        
        anns[`bg_${i}`] = {
          type: 'box',
          xMin: startPoint.x,
          xMax: w.breakout.x,
          backgroundColor: 'rgba(54, 162, 235, 0.03)', // 改用藍色背景較符合 W 底直覺
          borderColor: 'transparent',
          borderWidth: 0,
        };
      
        anns[`neck_${i}`] = {
            type: 'line', 
            xMin: startTime, // 從型態起始位置就開始畫
            xMax: lastDate,  // 一路延伸到最後一根 K 線
            yMin: w.M.price, 
            yMax: w.M.price,
            borderColor: red, 
            borderWidth: 2, 
            borderDash: [5, 5], // 保持虛線格式
            label: { 
              display: true, 
              content: `W${i+1} 頸線: ${w.M.price.toFixed(1)}`, 
              position: 'end', 
              backgroundColor: red, 
              color: '#fff', 
              font: {size: 10} 
            }
          };
      });
      return anns;
    }, [wPatterns, visibleIndices, fullData]);
  
    // G. 初始化 Range
    // useEffect(() => {
    //   if (fullData.length > 0 && range[1] === 0) {
    //     setRange([Math.max(0, fullData.length - 80), fullData.length - 1]);
    //   }
    // }, [fullData, range]);
    const resetToFullRange = () => {
        if (fullData.length > 0) {
          setRange([0, fullData.length - 1]);
        }
      };
    // 1. 唯一負責初始化與資料更新重設的 Effect
    useLayoutEffect(() => {
        if (fullData && fullData.length > 0) {
          // 同步將範圍設為 [0, 最後一根]
          setRange([0, fullData.length - 1]);
      
          // 同時重設偵測到的 W 底顯示勾選
          setVisibleIndices(wPatterns.map((_, i) => i));
        }
        // 這裡只依賴 fullData，確保只有資料源變動時才重設範圍
      }, [fullData]);
      
      

    //   useEffect(() => {
    //     if (fullData && fullData.length > 0) {
    //       // 1. 強制重設 X 軸範圍到最新的 80 根 (或全部)
    //       const newEnd = fullData.length - 1;
    //       const newStart = Math.max(0, newEnd - 80);
    //       setRange([newStart, newEnd]);
      
    //       // 2. 只有在偵測到新的 W 底時，才重設顯示勾選
    //       // 這樣可以避免每次移動滑桿都重設你的勾選狀態
    //       if (wPatterns.length > 0) {
    //         setVisibleIndices(wPatterns.map((_, i) => i));
    //       }
    //     }
    //   }, [fullData, wPatterns.length]);

      
    if (fullData.length === 0) return <div className="p-10 text-center text-gray-400 font-mono">Loading Data...</div>;
  
    return (
      <div className="flex flex-col w-full gap-6 p-6 bg-slate-50 rounded-3xl shadow-2xl border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500">
            左右腳價差容許度 ({(settings.footDiff * 100).toFixed(0)}%)
          </label>
          <input 
            type="range" min="0.01" max="0.1" step="0.01" 
            value={settings.footDiff}
            onChange={(e) => setSettings({...settings, footDiff: parseFloat(e.target.value)})}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500">
            頸線最小彈幅 ({(settings.minBounce * 100).toFixed(0)}%)
          </label>
          <input 
            type="range" min="0.02" max="0.15" step="0.01" 
            value={settings.minBounce}
            onChange={(e) => setSettings({...settings, minBounce: parseFloat(e.target.value)})}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500">
            兩腳最短間距 ({settings.minGap} 根)
          </label>
          <input 
            type="range" min="5" max="40" step="1" 
            value={settings.minGap}
            onChange={(e) => setSettings({...settings, minGap: parseInt(e.target.value)})}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>
        {/* 1. 控制面板 (顯示/隱藏切換) */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
              偵測結果控制台
            </h3>
            <button 
              onClick={toggleAll}
              className="text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors uppercase tracking-wider"
            >
              {visibleIndices.length === wPatterns.length ? "全部隱藏" : "全部顯示"}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {wPatterns.length === 0 ? (
              <p className="text-sm text-slate-400 italic">尚未在區間內偵測到型態</p>
            ) : (
              wPatterns.map((w, idx) => (
                <button
                  key={idx}
                  onClick={() => togglePattern(idx)}
                  className={`flex flex-col items-center px-4 py-2 rounded-xl border transition-all duration-200 ${
                    visibleIndices.includes(idx) 
                    ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase mb-1">Pattern</span>
                  <span className="text-sm font-black">W#{idx + 1}</span>
                  <span className="text-[10px] mt-1 font-mono">{new Date(w.breakout.x).toLocaleDateString('zh-TW', {month:'2-digit', day:'2-digit'})}</span>
                </button>
              ))
            )}
          </div>
        </div>
  
        {/* 2. 圖表區域 */}
        <div className="h-[550px] w-full bg-white p-4 rounded-2xl shadow-inner border border-slate-200 relative">
          <Chart 
            type='candlestick' 
            data={{ datasets: [{ label: "K線", data: fullData }] }} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              animation: false,
              scales: {
                x: { type: "time" as const, min: fullData[range[0]]?.x, max: fullData[range[1]]?.x },
                y: { position: 'right' }
              },
              plugins: {
                legend: { display: false },
                annotation: { annotations }
              }
            } as any} 
          />
        </div>
  
        {/* 3. 時間軸控制 (維持不變) */}
        <div className="px-4">
  <div className="relative w-full h-10">
    <div className="absolute top-1/2 -translate-y-1/2 w-full h-3 bg-slate-200 rounded-full" />
    <div 
      className="absolute top-1/2 -translate-y-1/2 h-3 bg-blue-500 rounded-full transition-all duration-150"
      style={{ 
        left: `${(range[0] / (fullData.length - 1)) * 100}%`, 
        right: `${100 - (range[1] / (fullData.length - 1)) * 100}%` 
      }} 
    />
    
    {/* 關鍵：將 key 放在這層，確保資料長度變更時，內部 Range Input 徹底重置 */}
    <div className="absolute inset-0" key={`slider-group-${fullData.length}`}>
      <input 
        type="range" 
        min={0} 
        max={fullData.length - 1} 
        value={range[0]}
        onChange={e => setRange([Math.min(parseInt(e.target.value), range[1] - 5), range[1]])}
        className="absolute w-full top-0 h-10 appearance-none bg-transparent cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:rounded-full z-20" 
      />
      
      <input 
        type="range" 
        min={0} 
        max={fullData.length - 1} 
        value={range[1]}
        onChange={e => setRange([range[0], Math.max(parseInt(e.target.value), range[0] + 5)])}
        className="absolute w-full top-0 h-10 appearance-none bg-transparent cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:rounded-full z-10" 
      />
    </div>
  </div>
  
  <div className="flex justify-end mt-2">
    <button 
      onClick={resetToFullRange}
      className="px-4 py-1.5 text-xs font-bold bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 shadow-sm transition-all"
    >
      ↺ 重設全選範圍
    </button>
  </div>
</div>
      </div>
    );
  }