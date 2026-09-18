// قائمة عينة للأسماء الشائعة للتصنيف
const GENDER_MAP: Record<string, 'male' | 'female'> = {
  kareem: 'male', كريم: 'male', sara: 'female', سارة: 'female',
  ahmed: 'male', أحمد: 'male', nour: 'female', نور: 'female'
};

export const checkGender = (name: string): 'male' | 'female' | 'neutral' => {
  const cleanName = name.trim().toLowerCase();
  return GENDER_MAP[cleanName] || 'neutral';
};

// دالة دمج وتشغيل التتابع الصوتي الهجين
export const playHybridGreeting = async (
  childAudioBlob: Blob,
  onEnded?: () => void
): Promise<void> => {
  const introAudio = new Audio('/audio/owl_greet_intro.mp3');
  const outroAudio = new Audio('/audio/owl_ask_reader.mp3');
  const childAudioUrl = URL.createObjectURL(childAudioBlob);
  const childAudio = new Audio(childAudioUrl);

  const playNext = (audio: HTMLAudioElement) =>
    new Promise<void>((resolve) => {
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      audio.play().catch(() => resolve());
    });

  await playNext(introAudio);
  await playNext(childAudio);
  await playNext(outroAudio);

  URL.revokeObjectURL(childAudioUrl);
  if (onEnded) onEnded();
};