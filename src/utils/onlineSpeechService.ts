// src/utils/onlineSpeechService.ts

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

/**
 * دالة لتنظيف واستخلاص اسم الطفل من النص المنطوق
 */
export function extractChildName(spokenText: string): string {
  if (!spokenText || !spokenText.trim()) return '';

  let cleaned = spokenText
    .trim()
    .replace(/[\u064B-\u0652]/g, '') // إزالة التشكيل
    .replace(/[أإآ]/g, 'ا')         // توحيد الهمزات
    .replace(/ة/g, 'ه')             // توحيد التاء المربوطة
    .replace(/ى/g, 'ي');            // توحيد الألف المقصورة

  const fillerWords = [
    /^انا\s+اسمي\s+/i,
    /^انا\s+/i,
    /^اسمي\s+/i,
    /^يا\s+/i,
    /^هو\s+/i
  ];

  for (const pattern of fillerWords) {
    cleaned = cleaned.replace(pattern, '');
  }

  const words = cleaned.trim().split(/\s+/);
  return words[0] || '';
}

/**
 * محرك الصوت عبر Web Speech API مع حماية ضد التكرار والتصادم
 */
export class OnlineSpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private isStarting: boolean = false;

  constructor() {
    this.initEngine();
  }

  private initEngine(): void {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'ar';
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
    }
  }

  public startListeningForName(
    onNameCaptured: (name: string) => void,
    onError: (errorType: string) => void
  ): void {
    if (!this.recognition) {
      this.initEngine();
    }

    if (!this.recognition) {
      onError('NOT_SUPPORTED');
      return;
    }

    // 🛡️ الحماية: منع الاستدعاء المكرر أثناء التشغيل أو التهيئة
    if (this.isListening || this.isStarting) {
      console.warn('⚠️ المحرك يعمل بالفعل - تم تجاهل الطلب المكرر.');
      return;
    }

    this.isStarting = true;

    this.recognition.onstart = () => {
      this.isStarting = false;
      this.isListening = true;
      console.log('✅ بدأ الاستماع الفعلي الآن');
    };

    this.recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        const extractedName = extractChildName(transcript);

        if (extractedName && extractedName.length >= 2) {
          this.stop();
          onNameCaptured(extractedName);
          break;
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isStarting = false;
      this.isListening = false;
      console.warn('Speech Engine Warning:', event.error);
      onError(event.error);
    };

    this.recognition.onend = () => {
      this.isStarting = false;
      this.isListening = false;
    };

    try {
      this.recognition.start();
    } catch (e) {
      this.isStarting = false;
      this.isListening = false;
      onError('START_FAILED');
    }
  }

  public stop(): void {
    this.isStarting = false;
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {}
    }
  }
}