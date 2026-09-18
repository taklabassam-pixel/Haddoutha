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
  coverImage: string;
  fileName: string;
  description?: string;
  bgMusicUrl?: string;
  audioUrl?: string;
  titleAudio?: string;     // 👈 مسار صوت العنوان/المقدمة
  fullStoryAudio?: string; // 👈 مسار الصوت الكامل للقصة
  chunks?: StoryChunk[];
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
