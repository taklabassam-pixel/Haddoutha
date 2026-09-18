import React from 'react';
import { CharacterVideoOverlayProps } from '../types/types';

export const CharacterVideoOverlay: React.FC<CharacterVideoOverlayProps> = ({
  videoSrc,
  idleImageSrc,
  isSpeaking,
}) => {
  return (
    <div className="relative w-64 h-64 mx-auto rounded-3xl overflow-hidden border-4 border-amber-400/30 shadow-2xl bg-slate-800">
      
      {/* 1. الصورة الثابتة: تظهر وتختفي بسلاسة حسب الكلام */}
      <img
        src={idleImageSrc}
        alt="Character Idle"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ease-in-out ${
          isSpeaking ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* 2. فيديو الحركة المستمر: يعمل بالكامل عبر المتصفح (HTML5 Autoplay) */}
      <video
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onError={(e) => {
          console.error(`❌ فشل تحميل ملف الفيديو من المسار: ${videoSrc}`, e);
        }}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ease-in-out ${
          isSpeaking ? 'opacity-100' : 'opacity-0 pointer-events-auto'
        }`}
      />

    </div>
  );
};

export default CharacterVideoOverlay;