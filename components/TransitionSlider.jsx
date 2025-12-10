// components/TransitionSlider.jsx
"use client";

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { slideData } from '@/data/SlideData'; 
import styles from '@/styles/TransitionSlider.module.css'; 

// 動畫時間：交疊淡入淡出
const ENTER_DURATION = 800;

const TransitionSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // 動畫狀態：IDLE / CROSS (淡出與淡入同時)
  const [animationStage, setAnimationStage] = useState('IDLE');
  const [lastSlideIndex, setLastSlideIndex] = useState(null);
  // 圓餅旋轉（左右空缺切換）
  const [pieFlip, setPieFlip] = useState(false);

  const currentSlide = slideData[currentIndex];
  const isOdd = currentSlide.id % 2 === 1;
  const bgSideClass = isOdd ? styles.bgLeft : styles.bgRight;

  const nextSlide = useCallback(() => {
    if (animationStage !== 'IDLE') return;
    const nextIndex = (currentIndex + 1) % slideData.length;
    setLastSlideIndex(currentIndex);
    setCurrentIndex(nextIndex);
    setAnimationStage('CROSS');
    setPieFlip((v) => !v);

    const timer = setTimeout(() => {
      setAnimationStage('IDLE');
      setLastSlideIndex(null);
    }, ENTER_DURATION);

    return () => clearTimeout(timer);
  }, [animationStage, currentIndex]);

  const currentContentClass = `${styles.slideContent} ${isOdd ? styles.layoutLeft : styles.layoutRight} ${
    animationStage === 'CROSS' ? styles.fadeIn : styles.contentEnd
  }`;
  const lastContentClass =
    lastSlideIndex !== null && animationStage === 'CROSS'
      ? `${styles.slideContent} ${styles.fadeOut}`
      : '';
  const maskClass =
    animationStage === 'CROSS'
      ? `${styles.transitionMask} ${styles.transitionStart}`
      : styles.transitionMask;

  const slideKey = currentSlide.id;

  return (
    <div>
      {/* 投影片容器 */}
      <div
        className={`${styles.sliderContainer} ${bgSideClass}`}
        style={{
          backgroundColor: currentSlide.color,
          ['--bg-image']: `url(${currentSlide.imageBg || currentSlide.image})`,
          ['--pie-color']: currentSlide.color,
        }}
      >
        {/* 圓餅動畫 */}
        <div className={`${styles.pieOverlay} ${pieFlip ? styles.pieRotate : ''}`} />

        {/* 遮罩層 */}
        <div className={maskClass}></div>

        {/* 前一張（淡出） */}
        {lastSlideIndex !== null && animationStage === 'CROSS' && (
          <div key={`last-${lastSlideIndex}`} className={lastContentClass}>
            <Image
              src={slideData[lastSlideIndex].image}
              alt={slideData[lastSlideIndex].character}
              className={styles.characterImage}
              width={300}
              height={500}
              priority={true}
            />
            <div className={styles.textArea}>
              <h2 className={styles.characterName}>{slideData[lastSlideIndex].character}</h2>
              <p className={styles.description}>{slideData[lastSlideIndex].description}</p>
            </div>
          </div>
        )}

        {/* 當前（淡入） */}
        <div key={slideKey} className={currentContentClass}>
          <Image
            src={currentSlide.image}
            alt={currentSlide.character}
            className={styles.characterImage}
            width={300}
            height={500}
            priority={true}
          />
          <div className={styles.textArea}>
            <h2 className={styles.characterName}>{currentSlide.character}</h2>
            <p className={styles.description}>{currentSlide.description}</p>
          </div>
        </div>
      </div>

      {/* 控制按鈕 */}
      <div className={styles.controlsContainer}>
        <button
          onClick={nextSlide}
          className={styles.nextButton}
          disabled={animationStage !== 'IDLE'}
        >
          下一頁 ({currentIndex + 1} / {slideData.length})
        </button>
      </div>
    </div>
  );
};

export default TransitionSlider;