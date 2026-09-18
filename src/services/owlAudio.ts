// خريطة تصنيف الأسماء الشائعة لتحديد الجنس تلقائياً
const GENDER_MAP: Record<string, 'male' | 'female'> = {
  kareem: 'male', كريم: 'male',
  sara: 'female', سارة: 'female',
  ahmed: 'male', أحمد: 'male',
  nour: 'female', نور: 'female'
};

export const checkGender = (name: string): 'male' | 'female' | 'neutral' => {
  const cleanName = name.trim().toLowerCase();
  return GENDER_MAP[cleanName] || 'neutral';
};

// تشغيل مقطع صوتي بصيغة Promise للتحكم بالزمن
export const playAudioSegment = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    const audio = new Audio(src);
    audio.onended = () => resolve();
    audio.onerror = () => resolve();
    audio.play().catch(() => resolve());
  });
};

// تشغيل التتابع الصوتي الترحيبي الهجين مع صوت الطفل
export const playHybridSequence = async (childAudioBlob: Blob): Promise<void> => {
  const childAudioUrl = URL.createObjectURL(childAudioBlob);

  // 1. أهلاً يا...
  await playAudioSegment('/audio/owl_greet_intro.mp3');

  // 2. [صوت الطفل المسجل محلياً]
  await playAudioSegment(childAudioUrl);

  // 3. ... ومين بدّو يحكيلنا القصة اليوم؟
  await playAudioSegment('/audio/owl_ask_reader.mp3');

  URL.revokeObjectURL(childAudioUrl);
};