"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type User = { username: string } | null;

const PRIZES = [
  "小獎 — 折價券 10%",
  "中獎 — 折價券 30%",
  "大獎 — 折價券 50%",
  "安慰獎 — 5 點積分",
  "豪華獎 — 神祕禮物",
  "再接再厲 — 無獎勵",
];

export default function Page() {
  const [user, setUser] = useState<User>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [signedInToday, setSignedInToday] = useState(false);
  const [lastSignDate, setLastSignDate] = useState<string | null>(null);

  // wheel states
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const wheelRef = useRef<HTMLDivElement | null>(null);

  // localStorage keys
  const LS_USER = "demo_user";
  const LS_SIGN_DATE = "demo_sign_date";
  const LS_WON_PRIZE = "demo_won_prize";

  useEffect(() => {
    // load user & sign-in state from localStorage
    const raw = localStorage.getItem(LS_USER);
    if (raw) setUser({ username: raw });

    const savedSign = localStorage.getItem(LS_SIGN_DATE);
    if (savedSign) setLastSignDate(savedSign);

    checkSignedInToday();
  }, []);

  useEffect(() => {
    // persist username
    if (user) localStorage.setItem(LS_USER, user.username);
    else localStorage.removeItem(LS_USER);
  }, [user]);

  function formatDate(d = new Date()) {
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  }

  function checkSignedInToday() {
    const saved = localStorage.getItem(LS_SIGN_DATE);
    const today = formatDate();
    setSignedInToday(saved === today);
    setLastSignDate(saved);
  }

  function handleLogin(e?: React.FormEvent) {
    e?.preventDefault();
    if (!usernameInput.trim()) return alert("請輸入使用者名稱");
    setUser({ username: usernameInput.trim() });
    setUsernameInput("");
  }

  function handleLogout() {
    setUser(null);
    setSignedInToday(false);
    setResult(null);
    localStorage.removeItem(LS_USER);
  }

  function handleSignIn() {
    if (!user) return;
    if (signedInToday) return alert("今天已簽到過了！");
    const today = formatDate();
    localStorage.setItem(LS_SIGN_DATE, today);
    setLastSignDate(today);
    setSignedInToday(true);
    alert("簽到成功！現在可以抽獎一次。");
  }

  // WHEEL LOGIC
  const sectors = useMemo(() => {
    const n = PRIZES.length;
    const angle = 360 / n;
    return PRIZES.map((p, i) => ({ label: p, index: i, angle }));
  }, []);

  function spinWheel() {
    if (!user) return alert("請先登入。");
    if (!signedInToday) return alert("請先簽到才可抽獎。");
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    // pick random prize index uniformly
    const prizeIndex = Math.floor(Math.random() * PRIZES.length);

    // compute rotation: want the wheel to land so that prizeIndex is at indicator (top)
    const sectorAngle = 360 / PRIZES.length;

    // target angle = random full rotations + offset such that chosen sector aligns
    const fullRotations = 6; // number of full spins for show
    const randomOffsetWithinSector = Math.random() * (sectorAngle - 8) - (sectorAngle / 2 - 4); // small jitter

    // If sector i spans angles [i*angle, (i+1)*angle), we need to rotate to -(i*angle + angle/2)
    // so its center aligns with top (0deg). We'll use negative because CSS rotate positive is clockwise.
    const target = -(prizeIndex * sectorAngle + sectorAngle / 2) + randomOffsetWithinSector;

    const finalRotation = fullRotations * 360 + target;

    if (wheelRef.current) {
      wheelRef.current.style.transition = "transform 5s cubic-bezier(.1,.9,.1,1)";
      wheelRef.current.style.transform = `rotate(${finalRotation}deg)`;
    }

    // after animation finishes
    setTimeout(() => {
      setIsSpinning(false);
      setResult(PRIZES[prizeIndex]);

      // consume the sign-in for prize (one-time per sign-in)
      const consumedKey = `${LS_WON_PRIZE}_${formatDate()}`;
      localStorage.setItem(consumedKey, PRIZES[prizeIndex]);

      // clear today's sign-in so user can't spin again without signing again
      // (optional: depends on your rule — here we require one spin per sign-in)
      localStorage.removeItem(LS_SIGN_DATE);
      checkSignedInToday();
    }, 5200);
  }

  function resetWheelStyle() {
    if (wheelRef.current) {
      wheelRef.current.style.transition = "none";
      wheelRef.current.style.transform = `rotate(0deg)`;
    }
  }

  // simple UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-4">Demo：登入 → 簽到 → 輪盤抽獎</h1>

          {!user ? (
            <form onSubmit={handleLogin} className="space-y-3">
              <label className="block text-sm font-medium">使用者名稱</label>
              <input
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="輸入任意名稱登入 (demo)"
              />
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">
                  登入
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded border"
                  onClick={() => alert("這是 demo，不會連後端")}
                >
                  說明
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="text-sm text-slate-600">目前使用者</div>
                <div className="font-medium text-lg">{user.username}</div>
              </div>

              <div>
                <div className="text-sm text-slate-600">簽到狀態</div>
                <div>
                  {signedInToday ? (
                    <span className="inline-block px-3 py-1 rounded bg-green-100 text-green-800">已簽到 ({lastSignDate})</span>
                  ) : (
                    <span className="inline-block px-3 py-1 rounded bg-yellow-100 text-yellow-800">尚未簽到</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button className="px-3 py-2 rounded bg-emerald-600 text-white" onClick={handleSignIn} disabled={signedInToday}>
                  簽到
                </button>
                <button
                  className="px-3 py-2 rounded bg-gray-200"
                  onClick={() => {
                    resetWheelStyle();
                    localStorage.removeItem(LS_SIGN_DATE);
                    checkSignedInToday();
                    alert("已重置簽到（demo）");
                  }}
                >
                  重置簽到 (Demo)
                </button>
                <button className="px-3 py-2 rounded border" onClick={handleLogout}>
                  登出
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-sm text-slate-700">
            <p>規則（demo）：</p>
            <ul className="list-disc ml-5">
              <li>登入後可進行每日簽到 (client 存在於 localStorage)</li>
              <li>簽到成功後可進行一次輪盤抽獎 (簽到會被消耗)</li>
              <li>此範例為前端 Demo，無後端驗證與持久化。</li>
            </ul>
          </div>
        </div>

        {/* Wheel area */}
        <div className="flex flex-col items-center">
          <div className="w-80 h-80 relative">
            {/* wheel */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                ref={wheelRef}
                className="w-72 h-72 rounded-full border-4 border-slate-200 relative overflow-hidden shadow-md"
                style={{ transform: "rotate(0deg)" }}
              >
                {/* draw sectors */}
                {sectors.map((s) => {
                  const deg = 360 / sectors.length;
                  const rotate = s.index * deg;
                  const bgColors = [
                    "#ffe4e6", // 粉
                    "#e0f2fe", // 藍
                    "#fef9c3", // 黃
                    "#dcfce7", // 綠
                    "#fae8ff", // 紫
                    "#fee2e2", // 紅
                  ];
                  const color = bgColors[s.index % bgColors.length];

                  return (
                    <div
                      key={s.index}
                      className="absolute left-1/2 top-1/2 origin-left"
                      style={{
                        width: "50%",
                        height: "50%",
                        transformOrigin: "0% 0%",
                        transform: `rotate(${rotate}deg) translateX(-100%)`,
                        backgroundColor: color,
                        clipPath: "polygon(0 1, 130% 0, 0 147%)",
                      }}
                    >
                      <div
                        className="w-full h-full flex items-center justify-center text-xs font-semibold"
                        style={{ transform: `rotate(41deg) translateX(16%);)` }}
                      >
                        <p style={{width:"50px"}}>{s.label}</p>
                      </div>
                    </div>
                  );
                })}

                {/* center */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center font-bold shadow">
                  抽
                </div>
              </div>
            <div >
              <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-red-600"></div>
            </div>
              {/* <div className="absolute left-1/2 top-0 -translate-x-1/2 -mt-3">
              <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-red-600"></div>
            </div> */}
            </div>

            {/* indicator */}
           
          </div>
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -mt-3">
              <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-red-600"></div>
            </div>
          <div className="mt-4 flex gap-2">
            <button
              className="px-4 py-2 rounded bg-pink-600 text-white disabled:opacity-50"
              onClick={spinWheel}
              disabled={!signedInToday || isSpinning}
            >
              {isSpinning ? "旋轉中..." : "開始抽獎"}
            </button>
            <button
              className="px-4 py-2 rounded border"
              onClick={() => {
                // allow re-showing last result in demo
                const existing = localStorage.getItem(`${LS_WON_PRIZE}_${formatDate()}`);
                if (existing) alert(`今日中獎：${existing}`);
                else alert("今天尚未中獎或已消耗簽到。");
              }}
            >
              查看今日結果 (Demo)
            </button>
          </div>

          {result && (
            <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
              <div className="font-semibold">中獎結果</div>
              <div className="mt-1">{result}</div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        /* small extra styles */
        .origin-left { transform-origin: 0% 0%; }
      `}</style>
    </div>
  );
}
