import { createModel, Recognizer } from 'vosk-browser';
import { KNOWN_NAME_PATTERNS, NamePattern } from '../data/namesDatabase';

export interface SignalMetrics {
  rms: number;
  hasVoice: boolean;
  speechDurationMs: number;
  validFramesCount: number;
  freqRatio: number;
  pitchHz: number;
}

export interface KwsTestResult {
  detectedName: string | null;
  matchedPattern: NamePattern | null;
  metrics: SignalMetrics;
  status: 'NO_MIC' | 'SILENCE' | 'TOO_SHORT' | 'MATCHED' | 'NO_MATCH';
}

let audioCtx: AudioContext | null = null;
let mediaStream: MediaStream | null = null;
let analyser: AnalyserNode | null = null;
let processor: ScriptProcessorNode | null = null;

// متغيرات Vosk المشتركة داخل هذا الملف
let voskModel: any = null;
let voskRecognizer: any = null;

/**
 * دالة التعرف على الصوت المحدثة لتجلب البيانات أوفلاين بالكامل عبر Vosk
 */
export async function listenAndRecognizeOffline(
  onTextCaptured: (text: string) => void,
  onComplete: (matchedName: string | null) => void
): Promise<void> {
  try {
    // 1. تهيئة الـ AudioContext بتردد 16000 هرتز الإجباري لـ Vosk
    if (!audioCtx || audioCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtx = new AudioCtxClass({ sampleRate: 16000 });
    }
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    // 2. تحميل نموذج Vosk محلياً من ملف الـ tar.gz في مجلد public
    if (!voskModel) {
      onTextCaptured('جاري تحميل محرك الذكاء الاصطناعي المحلي أوفلاين...');
      const Vosk = await import('vosk-browser');
      voskModel = await Vosk.createModel('/vosk-model-ar-mgb2-0.4.tar.gz');
    }

    if (!voskRecognizer && voskModel) {
      voskRecognizer = new voskModel.KaldiRecognizer(16000);
    }

    // 3. تشغيل الميكروفون وسحب الصوت
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    const source = audioCtx.createMediaStreamSource(mediaStream);
    
    processor = audioCtx.createScriptProcessor(4096, 1, 1);
    source.connect(processor);
    processor.connect(audioCtx.destination);

    onTextCaptured('المحرك المحلي جاهز، تحدث الآن...');

    // معالجة تدفق الكلمات الفورية (Interim Results)
    voskRecognizer.on("partialresult", (message: any) => {
      if (message.result && message.result.partial) {
        // تحديث الواجهة بالكلمة اللحظية أثناء نطقها
        onTextCaptured(message.result.partial);
      }
    });

    // معالجة النص النهائي عند التوقف عن الكلام (Final Result)
    voskRecognizer.on("result", (message: any) => {
      if (message.result && message.result.text) {
        const finalTranscript = message.result.text.trim();
        onTextCaptured(finalTranscript);

        // مطابقة الكلمة مع قاعدة البيانات الخاصة بك
        const found = KNOWN_NAME_PATTERNS.find((p) => finalTranscript.includes(p.name));
        
        // إيقاف التسجيل تلقائياً بعد التقاط الجملة النهائية
        stopAllAudioTracks();
        onComplete(found ? found.name : null);
      }
    });

    // ضخ البيانات الصوتية إلى Vosk
    processor.onaudioprocess = (e) => {
      if (!voskRecognizer) return;
      const inputData = e.inputBuffer.getChannelData(0);
      voskRecognizer.acceptWaveform(inputData);
    };

  } catch (error) {
    console.error(error);
    onTextCaptured('خطأ: تعذر تشغيل التعرف المحلي (تأكد من الملف والميكروفون)');
    stopAllAudioTracks();
    onComplete(null);
  }
}

/**
 * دالة حساب التردد الرياضي (AutoCorrelate) المدمجة لديك
 */
function autoCorrelate(buffer: Float32Array, sampleRate: number): number {
  let SIZE = buffer.length;
  let rms = 0;

  for (let i = 0; i < SIZE; i++) {
    let val = buffer[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1;

  let r1 = 0, r2 = SIZE - 1, thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buffer[i]) < thres) { r1 = i; break; }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buffer[SIZE - i]) < thres) { r2 = SIZE - i; break; }
  }

  buffer = buffer.slice(r1, r2);
  SIZE = buffer.length;

  let c = new Float32Array(SIZE);
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE - i; j++) {
      c[i] = c[i] + buffer[j] * buffer[j + i];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1]) d++;
  let maxval = -1, maxpos = -1;
  for (let i = d; i < SIZE; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }
  let T0 = maxpos;
  if (T0 === -1) return -1;

  return sampleRate / T0;
}

/**
 * دالة فحص جودة الإشارة والمايك (KWS Test)
 */
export async function runKwsTest(
  onUpdateMetrics: (m: SignalMetrics) => void,
  onComplete: (res: KwsTestResult) => void
): Promise<void> {
  try {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioCtxClass({ sampleRate: 16000 }); // موحد ليتوافق مع تردد اختبار Vosk
    }
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    const currentSampleRate = audioCtx.sampleRate;

    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: true,
      },
      video: false,
    });

    const source = audioCtx.createMediaStreamSource(mediaStream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    const timeBuffer = new Float32Array(analyser.fftSize);

    let startTime = 0;
    let validFramesCount = 0;
    let maxRms = 0;
    let bestFreqRatio = 0;
    let lastPitchHz = 0;
    let matchedPattern: NamePattern | null = null;
    let isListening = true;

    const interval = setInterval(() => {
      if (!analyser || !isListening) return;

      analyser.getFloatTimeDomainData(timeBuffer);

      let sumSquares = 0;
      for (let i = 0; i < timeBuffer.length; i++) {
        sumSquares += timeBuffer[i] * timeBuffer[i];
      }
      const rms = Math.sqrt(sumSquares / timeBuffer.length);
      const hasVoice = rms > 0.015;

      if (hasVoice) {
        if (startTime === 0) startTime = Date.now();
        validFramesCount++;
        if (rms > maxRms) maxRms = rms;

        const pitchHz = autoCorrelate(timeBuffer, currentSampleRate);

        if (pitchHz > 80 && pitchHz < 600) {
          lastPitchHz = pitchHz;
          const freqRatio = Math.min(pitchHz / 2000, 1);
          bestFreqRatio = freqRatio;

          const found = KNOWN_NAME_PATTERNS.find(
            (p) => freqRatio >= p.minFreqRatio && freqRatio <= p.maxFreqRatio
          );
          if (found) matchedPattern = found;
        }
      }

      const speechDurationMs = startTime > 0 ? Date.now() - startTime : 0;

      onUpdateMetrics({
        rms,
        hasVoice,
        speechDurationMs,
        validFramesCount,
        freqRatio: bestFreqRatio,
        pitchHz: lastPitchHz,
      });
    }, 50);

    setTimeout(() => {
      isListening = false;
      clearInterval(interval);
      stopAllAudioTracks();

      const finalDuration = startTime > 0 ? Date.now() - startTime : 0;
      const metrics: SignalMetrics = {
        rms: maxRms,
        hasVoice: validFramesCount > 0,
        speechDurationMs: finalDuration,
        validFramesCount,
        freqRatio: bestFreqRatio,
        pitchHz: lastPitchHz,
      };

      if (validFramesCount === 0) {
        onComplete({ detectedName: null, matchedPattern: null, metrics, status: 'SILENCE' });
      } else if (finalDuration < 300) {
        onComplete({ detectedName: null, matchedPattern: null, metrics, status: 'TOO_SHORT' });
      } else if (matchedPattern) {
        onComplete({
          detectedName: matchedPattern.name,
          matchedPattern,
          metrics,
          status: 'MATCHED',
        });
      } else {
        onComplete({ detectedName: null, matchedPattern: null, metrics, status: 'NO_MATCH' });
      }
    }, 4000);

  } catch (err) {
    stopAllAudioTracks();
    onComplete({
      detectedName: null,
      matchedPattern: null,
      metrics: { rms: 0, hasVoice: false, speechDurationMs: 0, validFramesCount: 0, freqRatio: 0, pitchHz: 0 },
      status: 'NO_MIC',
    });
  }
}

/**
 * إيقاف كافة قنوات الصوت وتحرير الذاكرة لمنع تعليق المايك
 */
function stopAllAudioTracks() {
  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop());
    mediaStream = null;
  }
  if (processor) {
    processor.disconnect();
    processor = null;
  }
  if (analyser) {
    analyser.disconnect();
    analyser = null;
  }
}
