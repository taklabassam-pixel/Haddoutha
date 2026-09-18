import React, { useRef, useState, useEffect } from 'react';

interface OwlAvatarProps {
  imageSrc: string;
  videoSrc?: string;
  isListening?: boolean;
  isPlaying?: boolean;
  onOwlClick?: () => void;
  onVideoEnd?: () => void;
}

export const OwlAvatar: React.FC<OwlAvatarProps> = ({
  imageSrc,
  videoSrc,
  isListening = false,
  isPlaying = false,
  onOwlClick,
  onVideoEnd,
}) => {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 1. التحكم ببدء وإيقاف الفيديو بناءً على حالة الصوت فقط
  useEffect(() => {
    const playOrStopVideo = async () => {
      if (!videoRef.current || !videoSrc) return;

      if (isPlaying) {
        try {
          // تشغيل الفيديو والدوران بـ loop التلقائي عند انتهاء مدته طالما الصوت مستمر
          await videoRef.current.play();
          setIsPlayingVideo(true);
        } catch (error) {
          console.error("فشل تشغيل الفيديو بسبب المتصفح:", error);
          setIsPlayingVideo(false);
        }
      } else {
        // عند توقف الصوت: إيقاف موقت بالفيديو في موقعه الحالي بدون currentTime = 0
        videoRef.current.pause();
        setIsPlayingVideo(false);
      }
    };

    playOrStopVideo();
  }, [isPlaying, videoSrc]);

  const handleContainerClick = () => {
    if (onOwlClick) {
      onOwlClick();
    }
  };

  const handleVideoEnded = () => {
    if (onVideoEnd) {
      onVideoEnd();
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className={`relative w-full h-full cursor-pointer transition-transform duration-300 active:scale-95 flex items-center justify-center ${
        isListening ? 'scale-105' : ''
      }`}
    >
      {/* 1. فيديو البومة */}
      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          playsInline
          muted
          loop
          onEnded={handleVideoEnded}
          className={`absolute inset-0 w-full h-full object-contain rounded-full transition-opacity duration-300 ${
            isPlayingVideo ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        />
      )}

      {/* 2. الصورة الثابتة (تظهر في البداية وتختفي بمجرد بدء تشغيل الفيديو) */}
      <img
        src={imageSrc}
        alt="البومة كوكو"
        className={`w-full h-full object-contain transition-opacity duration-300 ${
          isPlayingVideo ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* 3. توهج الاستماع */}
      {isListening && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 z-20">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500" />
        </span>
      )}
    </div>
  );
};