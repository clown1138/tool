"use client";

import { useEffect, useState } from "react";
import CandlestickChart from "@/components/CandlestickChart";

type Profession = 'student' | 'freelancer' | 'productOwner' | 'engineer' | 'systemAnalytics';

interface User {
  firstName: string;
  lastName: string; // 題目說可以為空，但在物件中仍會存在字串
  customerID: string;
  note: string;
  profession: Profession;
}

export default function Page() {
  
  const [data, setData] = useState<any[]>([]);
  
  // 拆分一個為輸入框即時顯示, 一個為觸發
  const [inputId, setInputId] = useState("2330");
  const [debouncedId, setDebouncedId] = useState("2330");
  
  const [start, setStart] = useState("2025-11-01");
  const [end, setEnd] = useState("2026-01-31");

  // 當inputId改變後, 倒數1.5秒才更新
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedId(inputId);
    }, 1500); // 1.5 秒

    // 1.5秒內若又輸入則會取消上一次的計時
    return () => {
      clearTimeout(handler);
    };
  }, [inputId]);

  // 發送API的只對debouncedId、start、end 產生反應
  useEffect(() => {
    if (!debouncedId) return;

    fetch(`/api/stock?id=${debouncedId}&start=${start}&end=${end}`)
      .then((res) => res.json())
      .then((json) => {
        const candlestickData = (json.data ?? []).map((d: any) => ({
          x: new Date(d.date),
          o: d.open,
          h: d.max,
          l: d.min,
          c: d.close,
        }));
        setData(candlestickData);
      })
      .catch(err => console.error("抓取資料失敗:", err));
  }, [debouncedId, start, end]);
  return (
    <div className="p-6">
      <div className="flex gap-4 mb-6 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-500">股票代碼 (1.5s 延遲載入)</label>
          <input 
            className="border p-2 rounded"
            type="text" 
            value={inputId} // 綁定即時輸入
            onChange={(e) => setInputId(e.target.value)} 
          />
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-500">開始</label>
          <input className="border p-2 rounded" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-500">結束</label>
          <input className="border p-2 rounded" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>

        {/* 如輸入與發送中的ID不同則顯示Loading */}
        {inputId !== debouncedId && (
          <div className="text-sm text-blue-500 animate-pulse pb-2">等待輸入停止...</div>
        )}
      </div>

      <div style={{ width: "100%", height: "600px" }}>
        <CandlestickChart data={data} />
      </div>
    </div>
  );
}