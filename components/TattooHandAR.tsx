"use client";
import React, { useEffect, useState } from 'react';
import Script from 'next/script';

export default function TattooAnchorAR() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <div className="w-full h-screen bg-black" />;
  }

  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      <Script 
        src="https://aframe.io/releases/1.4.2/aframe.min.js" 
        strategy="beforeInteractive"
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/mind-ar@1.2.2/dist/mindar-image-aframe.prod.js" 
        strategy="afterInteractive"
      />

      <div 
        className="w-full h-full"
        dangerouslySetInnerHTML={{
          __html: `
            <a-scene 
              mindar-image="imageTargetSrc: /targets.mind; filterMinCF:0.001; filterBeta: 10" 
              color-space="sRGB" 
              renderer="colorManagement: true, physicallyCorrectLights" 
              vr-mode-ui="enabled: false" 
              device-orientation-permission-ui="enabled: false"
            >
              <a-assets>
                <img id="tattooTexture" src="/tattoos/test001.png" />
              </a-assets>

              <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

              <a-entity mindar-image-target="targetIndex: 0">
                <a-plane 
                  src="#tattooTexture" 
                  position="0 0 0" 
                  height="1" 
                  width="1" 
                  transparent="true" 
                  opacity="0.9"
                  rotation="0 0 0"
                ></a-plane>
              </a-entity>
            </a-scene>
          `
        }}
      />
      
      <div className="absolute bottom-10 left-0 w-full text-center text-white z-50 pointer-events-none">
        <p className="bg-black/50 inline-block px-4 py-2 rounded-full">
          請掃描刺青錨點圖案
        </p>
      </div>
    </div>
  );
}