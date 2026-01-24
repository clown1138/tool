"use client";
import React, { useEffect, useState } from 'react';
import Script from 'next/script';

export default function TattooAnchorAR() {
  const [isLoaded, setIsLoaded] = useState(false);
  const AScene = 'a-scene' as any;
  const AAssets = 'a-assets' as any;
  const ACamera = 'a-camera' as any;
  const AEntity = 'a-entity' as any;
  const APlane = 'a-plane' as any;
  // 監測 A-Frame 和 MindAR 是否真的準備好了
  useEffect(() => {
    const timer = setInterval(() => {
      if ((window as any).AFRAME && (window as any).MINDAR) {
        setIsLoaded(true);
        clearInterval(timer);
      }
    }, 500);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const sceneEl = document.querySelector('a-scene');
    const targetEl = document.querySelector('a-entity[mindar-image-target]');
  
    if (targetEl) {
      targetEl.addEventListener("targetFound", event => {
        console.log("找到錨點了！");
        // alert("偵測成功！"); // 測試用，成功後會跳通知
      });
  
      targetEl.addEventListener("targetLost", event => {
        console.log("錨點消失了");
      });
    }
  }, [isLoaded]);
  return (
    <div className="ar-wrapper">
      <Script 
        src="https://aframe.io/releases/1.4.2/aframe.min.js" 
        strategy="beforeInteractive"
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/mind-ar@1.2.2/dist/mindar-image-aframe.prod.js" 
        strategy="afterInteractive"
      />

{isLoaded && (
        <AScene 
        mindar-image="imageTargetSrc: /targets.mind; autoStart: true; uiLoading: no; uiError: no; uiScanning: no;"
        embedded
        color-space="sRGB"
        renderer="colorManagement: true, physicallyCorrectLights"
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: false"
      >
          <AAssets>
            <img id="tattooTexture" src="/tattoos/your-tattoo.png" />
          </AAssets>

          <ACamera position="0 0 0" look-controls="enabled: false"></ACamera>

          <AEntity mindar-image-target="targetIndex: 0">
            <APlane 
              src="#tattooTexture" 
              position="0 0 0" 
              height="1" 
              width="1" 
              transparent="true" 
            />
          </AEntity>
        </AScene>
      )}

      {!isLoaded && (
        <div className="loading-screen">
          <p>準備相機中...</p>
        </div>
      )}

      <style jsx>{`
        .ar-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: black;
          z-index: 999;
        }
        .loading-screen {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          color: white;
          font-family: sans-serif;
        }
      `}</style>

      {/* 關鍵：強制讓 A-Frame 的底層 Video 顯示出來 */}
      <style jsx global>{`
        body { margin: 0; overflow: hidden; }
        .a-canvas {
          width: 100% !important;
          height: 100% !important;
          position: absolute;
          top: 0;
          left: 0;
        }
        video {
        position: absolute;
        top: 0;
        left: 0;
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        z-index: -1; /* 讓它在 A-Frame Canvas 下方但看得見 */
    }
    .a-canvas {
        z-index: 1;
    }
    `}</style>
    </div>
  );
}