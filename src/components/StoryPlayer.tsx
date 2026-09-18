import React, { useState, useRef, useEffect } from 'react';
import { StoryChunk, StoryPlayerScreenProps } from '../types/types';

export const StoryPlayer: React.FC<StoryPlayerScreenProps> = ({
  storyTitle,
  chunks,
  audioSrc,
  coverImage,
  onFinish,
  onBack,
}) => {
  const [currentChunkIndex, setCurrentChunkIndex] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentChunk = chunks[currentChunkIndex] || {};
  const activeImage = currentChunk.imageAsset || coverImage;

  // مراقبة التوقيت الزمني للملف الصوتي لتحديث المشهد تلقائياً
  const handleTimeUpdate = () => {
    if (!audioRef.current || !chunks || chunks.length === 0) return;
    
    const currentTime = audioRef.current.currentTime;

    // البحث عن الـ Chunk الذي يتطابق مع الوقت الحالي
    const matchingIndex = chunks.findIndex((chunk) => {
      if (chunk.startTime !== undefined && chunk.endTime !== undefined) {
        return currentTime >= chunk.startTime && currentTime < chunk.endTime;
      }
      return false;
    });

    // 💡 التعديل الهام: لا تقم بتحديث الحالة إلا إذا وجدنا مقطعاً صحيحاً،
    // وأنه يختلف تماماً عن المقطع الحالي لمنع التحديثات المفرطة.
    if (matchingIndex !== -1 && matchingIndex !== currentChunkIndex) {
      setCurrentChunkIndex(matchingIndex);
    }
  };

  return (
    <div className="story-player-container flex flex-col items-center p-4">
      {/* رأس المشغل ومعلومات القصة */}
      <div className="flex justify-between w-full max-w-md mb-4">
        <button onClick={onBack} className="text-sm px-3 py-1 bg-gray-200 rounded">رجوع</button>
        <h2 className="text-lg font-bold">{storyTitle}</h2>
      </div>

      {/* 🖼️ حاوية عرض الرسوم المتسلسلة (تتغير تلقائياً مع الصوت في نفس مكان البطل) */}
      <div className="relative w-72 h-72 mb-6 rounded-xl overflow-hidden shadow-lg border-2 border-orange-200 bg-black flex items-center justify-center">
        <img 
          key={activeImage} 
          src={activeImage} 
          alt="مشهد القصة الحالي"
          className="w-full h-full object-cover transition-opacity duration-500 ease-in-out"
        />
      </div>

      {/* 📜 عرض النص الحالي المتزامن */}
      <div className="w-full max-w-md bg-white p-4 rounded-xl shadow mb-6 text-center min-h-[80px] flex items-center justify-center">
        <p className="text-lg text-gray-800">
          {currentChunk.text || "استمتع بالقصة..."}
        </p>
      </div>

      {/* عنصر الصوت المخفي أو الظاهر مع تفعيل المزامنة */}
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          controls
          autoPlay
          onTimeUpdate={handleTimeUpdate}
          onEnded={onFinish}
          className="w-full max-w-md"
        />
      )}
    </div>
  );
};