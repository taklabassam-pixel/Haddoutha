export type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

export interface StoryChunk {
  id: string | number;
  text: string;
  startTime?: number;
  endTime?: number;
  audioUrl?: string;
  imageAsset?: string;
}

export interface StoryPlayerScreenProps {
  storyTitle: string;
  chunks: StoryChunk[];
  audioSrc?: string;
  coverImage?: string;
  onFinish: () => void;
  onBack?: () => void;
}

export interface CharacterVideoOverlayProps {
  videoSrc: string;        // مسار فيديو حركة الشخصية وهي تتكلم (بدون صوت)
  idleImageSrc: string;    // مسار صورة ثابتة للشخصية وهي صامتة (Idle)
  isSpeaking: boolean;     // هل الشخصية تتحدث حالياً؟
}

export interface StoryMeta {
  id: string;
  title: string;
  description: string;
  fileName: string;
  audioUrl: string;
  fullStoryAudio: string;
  bgMusicUrl: string;
  coverImage: string;
  duration: number; // ✨ إضافة هذا السطر لحل مشكلة الخط الأحمر تحت duration
}

export type Screen = 'home' | 'stories' | 'record' | 'archive' | 'player';

// ❌ تم حذف 'ASK_MEMBER' من الحالات
export type DialogueState = 
  | 'WELCOME' 
  | 'ASK_GENDER' 
  | 'ASK_LETTER' 
  | 'ASK_NAME' 
  | 'CONFIRMED' 
  | 'MISSING_AUDIO';
