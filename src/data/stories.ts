import { StoryMeta, StoryChunk } from '../types/types';

// توسيع واجهة القصة لتشمل الـ chunks والـ duration
export interface FullStory extends StoryMeta {
  chunks: StoryChunk[];
  duration: number;
}

interface StoryMetaFile {
  title: string;
  description: string;
  duration: number;
}

// 1. جلب كافة ملفات meta.json و processed_story.json الخاصة بالقصص تلقائياً
const metaModules = import.meta.glob<StoryMetaFile>('/public/audio/stories/*/meta.json', {
  eager: true,
  import: 'default',
});

const chunksModules = import.meta.glob<{ chunks: StoryChunk[] } | StoryChunk[]>('/public/audio/stories/*/processed_story.json', {
  eager: true,
  import: 'default',
});

// 2. تجميع البيانات وتأطير الكائن الموحد تلقائياً
export const STORIES_DATA: Record<string, FullStory> = {};

Object.entries(metaModules).forEach(([filePath, meta]) => {
  const pathSegments = filePath.split('/');
  const storyFolderId = pathSegments[pathSegments.length - 2];

  // البحث عن ملف الـ chunks المطابق لنفس المجلد
  const chunksPath = `/public/audio/stories/${storyFolderId}/processed_story.json`;
  const rawChunksData = chunksModules[chunksPath];
  
  // استخراج المصفوفة بشكل صحيح سواء كانت كائن يحيط بها أو مصفوفة مباشرة
  let storyChunks: StoryChunk[] = [];
  if (rawChunksData) {
    if (Array.isArray(rawChunksData)) {
      storyChunks = rawChunksData;
    } else if (typeof rawChunksData === 'object' && 'chunks' in rawChunksData && Array.isArray((rawChunksData as any).chunks)) {
      storyChunks = (rawChunksData as any).chunks;
    }
  }

  // ✨ 3. التأكد من وجود المقطع التمهيدي (id: 0) وصورة scene_0.png في البداية تلقائياً
  const hasIntro = storyChunks.some((chunk: any) => chunk.id === 0 || chunk.id === '0');
  
  if (!hasIntro) {
    const introChunk: StoryChunk = {
      id: 0,
      text: meta.title || "بداية القصة",
      imageAsset: `/audio/stories/${storyFolderId}/scene_0.png`,
    };
    storyChunks = [introChunk, ...storyChunks];
  }

  // ⏱️ 4. تطبيق منطق التوزيع النسبي للوقت بناءً على عدد الأحرف لكل مقطع مقارنة بالمدة الكلية
  const totalDuration = meta.duration || 0;
  const totalChars = storyChunks.reduce((sum, chunk) => sum + (chunk.text?.length || 1), 0);

  let accumulatedTime = 0;
  storyChunks = storyChunks.map((chunk, index) => {
    const charCount = chunk.text?.length || 1;
    // حساب حصة هذا المقطع زمنياً بناءً على نسبة عدد أحرفه
    const chunkDuration = totalChars > 0 ? (charCount / totalChars) * totalDuration : 0;
    
    const startTime = accumulatedTime;
    accumulatedTime += chunkDuration;

    return {
      ...chunk,
      id: index, // ضمان تسلسل المعرفات من 0 تصاعدياً
      startTime: Number(startTime.toFixed(2)), // تعيين توقيت البدء النسبي بدقة
    };
  });

  STORIES_DATA[storyFolderId] = {
    id: storyFolderId,
    title: meta.title || storyFolderId,
    description: meta.description || '',
    fileName: storyFolderId,
    audioUrl: `/audio/stories/${storyFolderId}/full_story.mp3`,
    fullStoryAudio: `/audio/stories/${storyFolderId}/full_story.mp3`,
    bgMusicUrl: '/audio/static/bg_music.mp3',
    coverImage: `/audio/stories/${storyFolderId}/cover.png`,
    duration: totalDuration,
    chunks: storyChunks, // ✨ إدراج المقاطع مسبوقة بالمقطع 0 وموزعة الأوقات نسبياً
  };
});

// 5. تصدير مصفوفة القصص الموحدة
export const STORIES_LIST: FullStory[] = Object.values(STORIES_DATA);

// 6. دالة الاستعلام المباشر عن القصة
export const getStoryById = (id: string): FullStory | undefined => {
  return STORIES_LIST.find((story) => story.id === id);
};