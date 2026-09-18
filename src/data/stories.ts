import { StoryMeta, StoryChunk } from '../types/types';

// توسيع واجهة القصة لتشمل الـ chunks
export interface FullStory extends StoryMeta {
  chunks: StoryChunk[];
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

  STORIES_DATA[storyFolderId] = {
    id: storyFolderId,
    title: meta.title || storyFolderId,
    description: meta.description || '',
    fileName: storyFolderId,
    audioUrl: `/audio/stories/${storyFolderId}/full_story.mp3`,
    fullStoryAudio: `/audio/stories/${storyFolderId}/full_story.mp3`,
    bgMusicUrl: '/audio/static/bg_music.mp3',
    coverImage: `/audio/stories/${storyFolderId}/cover.png`,
    chunks: storyChunks, // ✨ إدراج المقاطع والـ imageAsset هنا بنجاح
  };
});

// 3. تصدير مصفوفة القصص الموحدة
export const STORIES_LIST: FullStory[] = Object.values(STORIES_DATA);

// 4. دالة الاستعلام المباشر عن القصة
export const getStoryById = (id: string): FullStory | undefined => {
  return STORIES_LIST.find((story) => story.id === id);
};