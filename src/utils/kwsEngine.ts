import { createModel, Recognizer } from 'vosk-browser';
import { KNOWN_NAME_PATTERNS, NEUTRAL_TITLES } from '../data/namesDatabase';

export interface KWSResult {
  name: string | null;
}

let audioCtx: AudioContext | null = null;
let mediaStream: MediaStream | null = null;
let processor: ScriptProcessorNode | null = null;
let isListeningActive = false;

let voskModel: any = null;
let voskRecognizer: any = null;

// الملف الرسمي المتاح بحجم 318MB
const OFFICIAL_MODEL_URL = '/vosk-model-ar-mgb2-0.4.tar.gz';
const CACHE_NAME = 'vosk-mgb2-cache-v1';

async function getOfflineModelUrl(url: string): Promise<string> {
  const cache = await caches.open(CACHE_NAME);
  let response = await cache.match(url);

  if (!response) {
    console.log('🌐 [VOSK KWS]: تنزيل النموذج العربي المتاح وحفظه أوفلاين...');
    response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    await cache.put(url, response.clone());
  } else {
    console.log('⚡ [VOSK KWS]: تم تحميل النموذج أوفلاين من الكاش المحلي.');
  }

  const modelBlob = await response.blob();
  return URL.createObjectURL(modelBlob);
}

export async function initKWSEngine(): Promise<boolean> {
  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtx = new AudioCtxClass({ sampleRate: 16000 });
    }
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    if (!voskModel) {
      console.log('📦 [VOSK OFFLINE]: جاري استيراد المكتبة محلياً...');
      const Vosk = await import('vosk-browser');
      
      const localModelUrl = await getOfflineModelUrl(OFFICIAL_MODEL_URL);
      voskModel = await Vosk.createModel(localModelUrl);
      console.log('✅ [VOSK OFFLINE]: تم تحميل النموذج العربي بنجاح.');
    }

    if (!voskRecognizer && voskModel) {
      const allowedNames = KNOWN_NAME_PATTERNS.map((p) => p.name);
      const grammarList = [...allowedNames, '[unk]'];
      
      console.log('🎯 [VOSK KWS]: تقييد البحث للأسماء المحددة فقط:', grammarList);
      voskRecognizer = new voskModel.KaldiRecognizer(16000, JSON.stringify(grammarList));
    }

    return true;
  } catch (error) {
    console.error('❌ [LOCAL AUDIO ENGINE ERROR]: تعذر تهيئة محرك Vosk محلياً ->', error);
    return false;
  }
}

export async function listenForKeyword(
  onMatch: (result: KWSResult) => void
): Promise<void> {
  const isReady = await initKWSEngine();
  if (!isReady || !audioCtx || !voskRecognizer) {
    onMatch({ name: null });
    return;
  }

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    const source = audioCtx.createMediaStreamSource(mediaStream);
    
    processor = audioCtx.createScriptProcessor(4096, 1, 1);
    source.connect(processor);
    processor.connect(audioCtx.destination);

    isListeningActive = true;
    let detectedName: string | null = null;

    processor.onaudioprocess = (e) => {
      if (!isListeningActive || !voskRecognizer) return;
      const inputData = e.inputBuffer.getChannelData(0);
      voskRecognizer.acceptWaveform(inputData);
    };

    voskRecognizer.on("result", (message: any) => {
      if (message.result && message.result.text) {
        const textFound = message.result.text.trim();
        if (textFound && textFound !== '[unk]') {
          console.log(`🎯 [VOSK MATCH]: النص الملتقط: "${textFound}"`);

          const matchedPattern = KNOWN_NAME_PATTERNS.find((p) => 
            textFound.includes(p.name)
          );

          if (matchedPattern) {
            detectedName = matchedPattern.name;
            console.log(`🔥 [SUCCESS]: تم العثور على اسم متطابق: ${detectedName}`);
          }
        }
      }
    });

    voskRecognizer.on("partialresult", (message: any) => {
      if (message.result && message.result.partial) {
        const partial = message.result.partial.trim();
        if (partial && partial !== '[unk]') {
          console.log("⏳ تحليل فوري أوفلاين:", partial);
        }
      }
    });

    setTimeout(async () => {
      if (isListeningActive) {
        await stopKWSListening();
        onMatch({ name: detectedName });
      }
    }, 5000);

  } catch (err) {
    console.error('❌ [OFFLINE MIC ERROR]: تعذر تشغيل الميكروفون محلياً ->', err);
    await stopKWSListening();
    onMatch({ name: null });
  }
}

export async function stopKWSListening(): Promise<void> {
  isListeningActive = false;

  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }

  if (processor) {
    processor.disconnect();
    processor = null;
  }

  console.log('🛑 [OFFLINE ENGINE]: تم إيقاف الميكروفون وتحرير الموارد محلياً.');
}

export function getFallbackTitle(gender: 'boy' | 'girl'): string {
  return NEUTRAL_TITLES[gender] || NEUTRAL_TITLES.generic;
}