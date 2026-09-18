import { createModel, VoskModel } from 'vosk-browser';
import { KNOWN_NAME_PATTERNS } from '../data/namesDatabase';

export interface VoskRecognitionResult {
  transcript: string;
  matchedName: string | null;
  status: 'SUCCESS' | 'NO_MATCH' | 'ERROR' | 'LOADING';
}

let model: VoskModel | any = null;
let recognizer: any = null;

let mediaStream: MediaStream | null = null;
let audioContext: AudioContext | null = null;
let processorNode: ScriptProcessorNode | null = null;
let sourceNode: MediaStreamAudioSourceNode | null = null;

const normalizeArabic = (text: string): string => {
  return text
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();
};

export async function initVoskEngine(): Promise<boolean> {
  if (model && recognizer) return true;

  try {
    console.log('📦 [VOSK]: جاري تحميل النموذج...');
    model = await createModel('/vosk-model-ar-mgb2-0.4.tar.gz?v=3');
    
    console.log('🎙️ [VOSK]: جاري تهيئة المستبصر (16000Hz)...');
    recognizer = new model.KaldiRecognizer(16000);
    recognizer.setWords(true);

    console.log('✅ [VOSK]: النموذج جاهز بالكامل!');
    return true;
  } catch (error) {
    console.error('❌ [VOSK ERROR]: فشل تحميل النموذج ->', error);
    return false;
  }
}

/**
 * بدء الاستماع الحي من الميكروفون
 */
export async function startVoskListening(
  onPartialText: (text: string) => void,
  onFinalResult: (res: VoskRecognitionResult) => void
): Promise<void> {
  try {
    const isReady = await initVoskEngine();
    if (!isReady || !recognizer) {
      onFinalResult({ transcript: '', matchedName: null, status: 'ERROR' });
      return;
    }

    // إيقاف أي جلسة استماع سابقة
    stopVoskListening();

    // 1. طلب الوصول إلى الميكروفون
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        channelCount: 1,
      },
    });

    // 2. إنشاء AudioContext بمعدل 16000Hz
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioContext = new AudioContextClass({ sampleRate: 16000 });

    sourceNode = audioContext.createMediaStreamSource(mediaStream);
    
    // 3. معالج تدفق الصوت
    processorNode = audioContext.createScriptProcessor(4096, 1, 1);

    // ربط الأحداث مع Vosk
    recognizer.on('partialresult', (message: any) => {
      const partial = message.result?.partial?.trim() || '';
      if (partial) {
        onPartialText(partial);
      }
    });

    recognizer.on('result', (message: any) => {
      const capturedText = message.result?.text?.trim() || '';
      if (capturedText) {
        console.log('🏁 [LIVE RESULT]:', capturedText);
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
    });

    // ضخ بيانات المايك باستمرار
    processorNode.onaudioprocess = (event) => {
      if (!recognizer) return;
      const inputBuffer = event.inputBuffer;
      recognizer.acceptWaveform(inputBuffer);
    };

    // توصيل شبكة الصوت
    sourceNode.connect(processorNode);
    processorNode.connect(audioContext.destination);

    console.log('🎙️ [VOSK LIVE]: جاري الاستماع للمايك المباشر...');

  } catch (err) {
    console.error('❌ [VOSK MIC ERROR]:', err);
    onFinalResult({ transcript: 'فشل الوصول للميكروفون', matchedName: null, status: 'ERROR' });
  }
}

/**
 * إيقاف الاستماع الحي وتنظيف الموارد
 */
export function stopVoskListening(): void {
  if (processorNode && sourceNode) {
    processorNode.disconnect();
    sourceNode.disconnect();
    processorNode = null;
    sourceNode = null;
  }

  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close();
    audioContext = null;
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }

  if (recognizer) {
    try {
      recognizer.reset();
    } catch (e) {
      console.warn('Vosk reset warning:', e);
    }
  }

  console.log('🛑 [VOSK LIVE]: تم إيقاف الميكروفون والتنظيف.');
}