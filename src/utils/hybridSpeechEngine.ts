import { KNOWN_NAME_PATTERNS } from '../data/namesDatabase';
import { startVoskListening, stopVoskListening, VoskRecognitionResult } from './voskEngine';

// فحص دعم المتصفح لـ Web Speech API
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

let recognitionInstance: any = null;

const normalizeArabic = (text: string): string => {
  return text
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * 1. بدء الاستماع عبر Web Speech API (الخيار السريع)
 */
export function startWebSpeechListening(
  onPartialText: (text: string) => void,
  onFinalResult: (res: VoskRecognitionResult) => void
): boolean {
  if (!SpeechRecognition) {
    console.warn('⚠️ [HYBRID]: Web Speech API غير مدعوم في هذا المتصفح.');
    return false;
  }

  stopHybridListening(); // تنظيف أي جلسة قائمة

  try {
    recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'ar-SA'; // ضبط اللغة للقط العربي السريع

    recognitionInstance.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart;
        } else {
          interimTranscript += transcriptPart;
        }
      }

      // إرسال النص اللحظي (المرحلي)
      if (interimTranscript.trim()) {
        onPartialText(interimTranscript.trim());
      }

      // معالجة النص النهائي وتطبيق المطابقة
      if (finalTranscript.trim()) {
        const capturedText = finalTranscript.trim();
        console.log('🏁 [WEB SPEECH RESULT]:', capturedText);

        const cleanCaptured = normalizeArabic(capturedText);
        const matched = KNOWN_NAME_PATTERNS.find((p) => {
          const cleanDbName = normalizeArabic(p.name);
          return cleanCaptured.includes(cleanDbName) || cleanDbName.includes(cleanCaptured);
        });

        onFinalResult({
          transcript: capturedText,
          matchedName: matched ? matched.name : null,
          status: matched ? 'SUCCESS' : 'NO_MATCH',
        });
      }
    };

    recognitionInstance.onerror = (event: any) => {
      console.error('❌ [WEB SPEECH ERROR]:', event.error);
    };

    recognitionInstance.start();
    console.log('🎙️ [HYBRID]: تم تشغيل Web Speech API بنجاح.');
    return true;
  } catch (err) {
    console.error('❌ [WEB SPEECH INIT ERROR]:', err);
    return false;
  }
}

/**
 * 2. دالة الاستماع الهجينة الذكية (تستخدم Web Speech أولاً، وإذا فشل تتجه إلى Vosk)
 */
export async function startHybridListening(
  onPartialText: (text: string) => void,
  onFinalResult: (res: VoskRecognitionResult) => void
): Promise<'WEB_SPEECH' | 'VOSK'> {
  // محاولة التشغيل عبر Web Speech API أولاً
  const webSpeechSuccess = startWebSpeechListening(onPartialText, onFinalResult);

  if (webSpeechSuccess) {
    return 'WEB_SPEECH';
  }

  // إذا لم ينجح، التوجه التلقائي لـ Vosk
  console.log('🔄 [HYBRID]: التحويل التلقائي لمحرك Vosk المحلي...');
  await startVoskListening(onPartialText, onFinalResult);
  return 'VOSK';
}

/**
 * 3. إيقاف شامل لكل المحركات النشطة
 */
export function stopHybridListening(): void {
  // إيقاف Web Speech API
  if (recognitionInstance) {
    try {
      recognitionInstance.stop();
    } catch (e) {
      // تجاهل أخطاء الإيقاف إن كان متوقفاً بالأساس
    }
    recognitionInstance = null;
  }

  // إيقاف Vosk
  stopVoskListening();

  console.log('🛑 [HYBRID]: تم إيقاف جميع محركات الاستماع والتنظيف.');
}