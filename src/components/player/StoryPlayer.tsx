import React, { useRef, useState, useEffect } from 'react';
import { getStoryById } from "../../data/stories";
import { StoryMeta, StoryChunk } from "../../types/types";
import { CharacterVideoOverlay } from '../CharacterVideoOverlay';

interface StoryPlayerProps {
  storyId: string;
  childName?: string;
  onBack?: () => void;
  onFinish?: () => void;
}

const StoryPlayer: React.FC<StoryPlayerProps> = ({
  storyId,
  childName,
  onBack,
  onFinish,
}) => {
  const story = getStoryById(storyId);

  const storyAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  const [currentChunkIndex, setCurrentChunkIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [bgVolume, setBgVolume] = useState<number>(0.25);

  // 🌟 حقن المقطع التمهيدي (id: 0) تلقائياً في بداية القصة إذا لم يكن موجوداً
  const initializedChunks = React.useMemo(() => {
    if (!story || !story.chunks) return [];

    const hasIntro = story.chunks.some((chunk: any) => chunk.id === 0 || chunk.id === '0');

    if (!hasIntro) {
      const introChunk = {
        id: 0,
        text: story.title || "بداية القصة",
        startTime: 0,
        imageAsset: `/audio/stories/${story.title?.replace(/\s+/g, '_') || 'story'}/cover.png`,
      };
      return [introChunk, ...story.chunks];
    }

    return story.chunks;
  }, [story]);

  // 🌟 استخدام initializedChunks كمرجع أساسي موحد للمقاطع
  const chunks: StoryChunk[] = initializedChunks;
  const currentChunk: StoryChunk | null = chunks.length > 0 ? chunks[currentChunkIndex] : null;

  const currentAudioUrl = currentChunk?.audioUrl || story?.audioUrl || '';

  // 🖼️ دالة العرض القياسية وتتبع المشاهد
  const getActiveVisual = () => {
    console.log(`🎬 [TRACE START] currentTime: ${currentTime.toFixed(2)}s | currentChunkIndex: ${currentChunkIndex}`);

    if (!chunks.length) {
      console.log(`⚠️ [TRACE]: مصفوفة الـ chunks فارغة تماماً!`);
      return { type: 'image', src: story?.coverImage || '' };
    }

    // 1. فحص المقطع النشط حالياً بناءً على مؤشر الـ index
    const currentChunk = chunks[currentChunkIndex];
    console.log(`📦 [TRACE CURRENT CHUNK]:`, {
      id: currentChunk?.id,
      startTime: currentChunk?.startTime,
      hasImageAsset: !!currentChunk?.imageAsset,
      text: currentChunk?.text?.substring(0, 20)
    });

    // 2. البحث عن الـ Pivot الحالي (أول مقطع خلفه أو هو يمتلك imageAsset)
    let pivotChunkIndex = currentChunkIndex;
    while (pivotChunkIndex >= 0 && !chunks[pivotChunkIndex]?.imageAsset) {
      pivotChunkIndex--;
    }

    console.log(`🔍 [TRACE PIVOT SEARCH]: تم العثور على pivotChunkIndex عند الفهرس: ${pivotChunkIndex}`);

    if (pivotChunkIndex < 0) {
      console.log(`⚠️ [TRACE]: لم يتم العثور على أي Pivot يحمل صورة، سيتم عرض الغلاف الافتراضي.`);
      return { type: 'image', src: story?.coverImage || '' };
    }

    const pivotChunk = chunks[pivotChunkIndex];
    const activeImageSrc = pivotChunk.imageAsset!;
    const pivotId = pivotChunk.id;

    // 3. البحث عن الـ Pivot التالي لتحديد نطاق الوقت
    let nextPivotIndex = pivotChunkIndex + 1;
    while (nextPivotIndex < chunks.length && !chunks[nextPivotIndex]?.imageAsset) {
      nextPivotIndex++;
    }

    const pivotStartTime = pivotChunk.startTime ?? 0;
    const pivotEndTime = nextPivotIndex < chunks.length ? (chunks[nextPivotIndex].startTime ?? duration) : duration;
    
    const pivotDuration = pivotEndTime - pivotStartTime;
    const elapsedInPivot = currentTime - pivotStartTime;
    const imageTimeLimit = pivotDuration * 0.85;
    const isImagePhase = elapsedInPivot <= imageTimeLimit && elapsedInPivot >= 0;

    console.log(`📊 [TRACE CALCULATIONS]:`, {
      pivotId,
      activeImageSrc: activeImageSrc.split('/').pop(),
      pivotStartTime,
      pivotEndTime,
      pivotDuration: pivotDuration.toFixed(2),
      elapsedInPivot: elapsedInPivot.toFixed(2),
      imageTimeLimit: imageTimeLimit.toFixed(2),
      isImagePhase
    });

    if (isImagePhase) {
      return { type: 'image', src: activeImageSrc };
    } else {
      return { type: 'owl', src: '' };
    }
  };
 const chunkTimesRef = useRef<{ startTime: number; endTime: number }[]>([]);
  const visual = getActiveVisual();

  // استخدام useRef لحفظ الـ chunks الحالية لتجنب مشاكل الـ Closure في الـ Event Listeners
  const chunksRef = useRef(chunks);
  useEffect(() => {
    chunksRef.current = chunks;
  }, [chunks]);

  // ⏱️ حسابات الأوقات وتوزيع المحاور
  useEffect(() => {
    if (!currentAudioUrl || chunks.length === 0) return;

    let isMounted = true;
    const storyAudio = new Audio(currentAudioUrl);
    storyAudioRef.current = storyAudio;

    const processChunkTimes = (totalDuration: number) => {
      const currentChunks = chunksRef.current;
      if (currentChunks.length === 0) return;
      
      // إذا كانت حُسِبت مسبقاً، لا داعي لإعادة حسابها
      if (currentChunks[0].startTime !== undefined) return;

      const pivotIndices: number[] = [];
      currentChunks.forEach((chunk, idx) => {
        if (chunk.imageAsset) {
          pivotIndices.push(idx);
          console.log("🛠️ [ALL CHUNKS TIMES MAPPED]:", currentChunks.map(c => ({ id: c.id, start: c.startTime?.toFixed(2), end: c.endTime?.toFixed(2) })));
        }
      });

      const pivotWeights = pivotIndices.map((startIndex, i) => {
        const endIndex = (i < pivotIndices.length - 1) ? pivotIndices[i + 1] : currentChunks.length;
        let charsInPivot = 0;
        for (let j = startIndex; j < endIndex; j++) {
          charsInPivot += currentChunks[j].text?.length || 1;
        }
        return charsInPivot;
      });

      const totalPivotChars = pivotWeights.reduce((sum, w) => sum + w, 0);
      let accumulatedTime = 0;

      pivotIndices.forEach((startIndex, i) => {
        const endIndex = (i < pivotIndices.length - 1) ? pivotIndices[i + 1] : currentChunks.length;
        const pivotDuration = totalDuration * (pivotWeights[i] / (totalPivotChars || 1));
        const pivotStartTime = accumulatedTime;
        const pivotEndTime = accumulatedTime + pivotDuration;
        accumulatedTime = pivotEndTime;

        const timePerChar = pivotDuration / (pivotWeights[i] || 1);
        let subTime = pivotStartTime;
        for (let j = startIndex; j < endIndex; j++) {
          const charCount = currentChunks[j].text?.length || 1;
          currentChunks[j].startTime = subTime;
          subTime += charCount * timePerChar;
          currentChunks[j].endTime = subTime;
        }
      });

      if (currentChunks.length > 0) {
        currentChunks[currentChunks.length - 1].endTime = totalDuration;
      }
    };
console.log("🛠️ [CHUNKS PROCESSED TIMES]:", chunksRef.current.map(c => ({ id: c.id, start: c.startTime, end: c.endTime })));
    const handleLoadedMetadata = () => {
      if (!isMounted) return;
      const totalDuration = storyAudio.duration;
      setDuration(totalDuration);
      processChunkTimes(totalDuration);
    };

    const handleTimeUpdate = () => {
      if (!isMounted) return;
      const time = storyAudio.currentTime;
      setCurrentTime(time);

      const currentChunks = chunksRef.current;
      if (currentChunks.length > 0) {
        const matchingIndex = currentChunks.findIndex((chunk) => {
          if (chunk.startTime !== undefined && chunk.endTime !== undefined) {
            return time >= chunk.startTime && time < chunk.endTime;
          }
          return false;
        });

        if (matchingIndex !== -1) {
          setCurrentChunkIndex((prevIndex) => {
            if (prevIndex !== matchingIndex) {
              console.log(`🔄 [INDEX CHANGE]: من ${prevIndex} إلى ${matchingIndex} عند وقت ${time.toFixed(2)}s`);
              return matchingIndex;
            }
            return prevIndex;
          });
        }
      }
    };
    
    const handleEnded = () => {
      if (!isMounted) return;
      const currentChunks = chunksRef.current;

      if (currentChunks.length > 0 && currentChunkIndex < currentChunks.length - 1) {
        setCurrentChunkIndex((prev) => prev + 1);
      } else {
        setIsPlaying(false);
        if (bgAudioRef.current) bgAudioRef.current.pause();
        if (onFinish) onFinish();
      }
    };

    storyAudio.addEventListener('loadedmetadata', handleLoadedMetadata);
    storyAudio.addEventListener('timeupdate', handleTimeUpdate);
    storyAudio.addEventListener('ended', handleEnded);

    if (!isNaN(storyAudio.duration) && storyAudio.duration > 0) {
      setDuration(storyAudio.duration);
      processChunkTimes(storyAudio.duration);
    }

    if (isPlaying) {
      storyAudio.play().catch(() => setIsPlaying(false));
    }

    return () => {
      isMounted = false;
      storyAudio.pause();
      storyAudio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      storyAudio.removeEventListener('timeupdate', handleTimeUpdate);
      storyAudio.removeEventListener('ended', handleEnded);
    };
  }, [currentAudioUrl]); // تم الاعتماد على currentAudioUrl فقط لمنع إعادة تهيئة الـ Audio بلا مبرر
  const togglePlay = (shouldPlay?: boolean) => {
    const nextState = shouldPlay !== undefined ? shouldPlay : !isPlaying;
    setIsPlaying(nextState);

    if (storyAudioRef.current) {
      if (nextState) {
        storyAudioRef.current.play().catch(() => {});
        if (bgAudioRef.current) bgAudioRef.current.play().catch(() => {});
      } else {
        storyAudioRef.current.pause();
        if (bgAudioRef.current) bgAudioRef.current.pause();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (storyAudioRef.current) {
      storyAudioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!story) {
    return (
      <div className="p-8 text-center text-white">
        <h2>❌ القصة غير موجودة.</h2>
        {onBack && <button onClick={onBack} className="mt-4 px-6 py-2 bg-slate-700 rounded-lg">العودة</button>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-slate-900 text-white p-6 max-w-md mx-auto relative rounded-2xl shadow-2xl overflow-hidden">
      
      <div className="w-full flex justify-between items-center z-10">
        {onBack && (
          <button onClick={onBack} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full text-xl transition active:scale-95">
            ↩️
          </button>
        )}
        <span className="text-sm font-semibold text-amber-400">
          {childName ? `✨ لـ ${childName}` : 'حكاية مشوقة'}
        </span>
      </div>

      <div className="my-6 z-10 text-center w-full">
        <div className="relative w-72 h-72 mx-auto rounded-2xl overflow-hidden shadow-xl border-4 border-amber-300/30 bg-black flex items-center justify-center">
          {visual.type === 'image' ? (
            <img key={visual.src} src={visual.src} alt="مشهد القصة" className="w-full h-full object-cover transition-opacity duration-500 ease-in-out" />
          ) : (
            <CharacterVideoOverlay videoSrc="/videos/koko_welcome.mp4" idleImageSrc={story.coverImage} isSpeaking={isPlaying} />
          )}
        </div>

        <h1 className="text-2xl font-black mt-4 text-amber-300">{story.title}</h1>
        
        <p className="text-base font-bold text-amber-100 mt-3 p-3 bg-slate-800/60 rounded-xl border border-white/10 shadow-inner min-h-[4rem] flex items-center justify-center">
          "{currentChunk?.text || story.description}"
        </p>
      </div>

      <div className="w-full bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl z-10 shadow-lg border border-slate-700">
        
        <div className="w-full mb-4">
          <input type="range" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} className="w-full accent-amber-400 h-2 bg-slate-700 rounded-lg cursor-pointer" />
          <div className="flex justify-between text-xs text-slate-400 font-mono mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex justify-center items-center gap-6 my-2">
          <button onClick={() => setCurrentChunkIndex((prev) => Math.max(0, prev - 1))} disabled={currentChunkIndex === 0} className="p-3 text-slate-300 text-xl disabled:opacity-30">⏭️</button>
          <button onClick={() => togglePlay()} className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl font-black shadow-xl ${isPlaying ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'}`}>
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <button onClick={() => setCurrentChunkIndex((prev) => Math.min(chunks.length - 1, prev + 1))} disabled={chunks.length === 0 || currentChunkIndex === chunks.length - 1} className="p-3 text-slate-300 text-xl disabled:opacity-30">⏭️</button>
        </div>

      </div>
    </div>
  );
};

export default StoryPlayer;