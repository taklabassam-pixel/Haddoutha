import { useState, useRef, useEffect, FC, ChangeEvent } from 'react';
import { playAudioSegment, playHybridSequence } from '../../services/owlAudio'; // تم تصحيح المسار وإزالة React غير المستغلة

interface RecordScreenProps {
  onBack: () => void;
  onSaveAudio?: (owner: string, file: File) => void;
}

export const RecordScreen: FC<RecordScreenProps> = ({ onBack, onSaveAudio }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [voiceOwner, setVoiceOwner] = useState<string>('ماما');
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [deviceOs, setDeviceOs] = useState<'ios' | 'android' | 'windows'>('ios');
  const [audioDuration, setAudioDuration] = useState<number | null>(null);

  const [isOwlInteracting, setIsOwlInteracting] = useState<boolean>(false);
  const [owlStatus, setOwlStatus] = useState<string>('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const processFile = (file: File) => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    const blob = new Blob([file], { type: file.type || 'audio/mp3' });
    const url = URL.createObjectURL(blob);
    setSelectedFile(file);
    setAudioUrl(url);
    setIsPlaying(false);
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) processFile(file);
};

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(Math.round(audioRef.current.duration));
    }
  };

  const togglePlay = async () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        audioRef.current.load();
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        setIsPlaying(false);
      }
    }
  };

  const handleRemoveFile = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setSelectedFile(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setAudioDuration(null);
  };

  const handleSave = () => {
    if (!selectedFile) return;
    if (onSaveAudio) {
      onSaveAudio(voiceOwner, selectedFile);
    } else {
      alert(`تم اختيار صوت (${voiceOwner}) بنجاح! جاهز للمرحلة القادمة ❤️`);
    }
  };

  const formatSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const startOwlGreetingSequence = async () => {
    setIsOwlInteracting(true);
    setOwlStatus('البومة كوكو تتحدث...');

    await playAudioSegment('/audio/owl_welcome.mp3');
    listenToChildName();
  };

  const listenToChildName = async () => {
    setOwlStatus('كوكو تستمع إليك.. قول اسمك بصوت واضح!');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const childNameBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setOwlStatus('جاري الترحب بك...');
        await playHybridSequence(childNameBlob);
        setOwlStatus('اختر الآن من قائمة العائلة من سيقرأ لك القصة!');
        setIsOwlInteracting(false);
      };

      mediaRecorderRef.current.start();

      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 2500);
    } catch (err) {
      setOwlStatus('تعذر الوصول للميكروفون، يمكنك اختيار الراوي مباشرة.');
      setIsOwlInteracting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-slate-900/80 backdrop-blur-lg border border-purple-500/20 rounded-3xl p-6 md:p-8 text-right text-white shadow-2xl relative">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-all flex items-center gap-2"
        >
          <span>➡️</span> رجوع
        </button>
        <h2 className="text-2xl md:text-3xl font-extrabold text-amber-300">
          📁 إضافة صوت العيلة
        </h2>
      </div>

      <div className="mb-6 bg-purple-950/50 p-4 rounded-2xl border border-purple-500/30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🦉</span>
          <div>
            <h4 className="font-bold text-amber-300 text-sm">البومة كوكو</h4>
            <p className="text-xs text-purple-200">
              {owlStatus || 'اضغط لبدء التحديث وسؤال الطفل عن اسمه'}
            </p>
          </div>
        </div>
        <button
          onClick={startOwlGreetingSequence}
          disabled={isOwlInteracting}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
        >
          {isOwlInteracting ? 'جاري التفاعل...' : 'بدء الترحيب الصوتى 🎙️'}
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm text-purple-200 mb-2 font-semibold">
          صوت مين عم نضيف هلق؟
        </label>
        <div className="flex flex-wrap gap-2">
          {['ماما', 'بابا', 'التيتا', 'الجدو'].map((owner) => (
            <button
              key={owner}
              onClick={() => setVoiceOwner(owner)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                voiceOwner === owner
                  ? 'bg-purple-600 text-white shadow-lg border border-purple-400'
                  : 'bg-slate-800 text-purple-300 border border-white/5 hover:bg-slate-700'
              }`}
            >
              {owner}
            </button>
          ))}
        </div>
      </div>

      {!selectedFile ? (
        <div className="bg-slate-950/80 p-6 md:p-8 rounded-2xl border-2 border-dashed border-amber-500/30 mb-6 text-center transition-all relative">
          <div className="flex justify-center mb-3">
            <button
              onClick={() => setShowInstructions(true)}
              className="text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-full transition-all flex items-center gap-1"
            >
              💡 كيف بأسجّل وبأحفظ الملف ع الجهاز؟
            </button>
          </div>

          <p className="text-purple-200 text-sm mb-4">
            سجّل الصوت عبر جهازك بصيغة <span className="text-amber-300 font-bold">MP3</span>، ثم ارفع الملف من هنا:
          </p>

          <label className="inline-block cursor-pointer px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5">
            📁 اختيار ملف الصوت (MP3)
            <input
              type="file"
              accept="audio/*,.mp3"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="bg-slate-950/90 p-5 rounded-2xl border border-emerald-500/30 mb-6 space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="text-2xl">🎵</span>
              <div className="text-right truncate">
                <h4 className="font-bold text-emerald-400 text-sm md:text-base truncate">
                  صوت {voiceOwner} جاهز!
                </h4>
                <p className="text-xs text-purple-300 font-mono truncate">
                  {selectedFile.name} ({formatSize(selectedFile.size)})
                  {audioDuration !== null && ` • ${audioDuration} ثانية`}
                </p>
              </div>
            </div>

            <button
              onClick={handleRemoveFile}
              className="text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-xl transition-all border border-rose-500/20"
            >
              تغيير الملف 🔄
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              onClick={togglePlay}
              className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2"
            >
              <span>{isPlaying ? '⏸️' : '▶️'}</span>
              <span>{isPlaying ? 'إيقاف الاستماع' : 'استماع للصوت'}</span>
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>💾</span>
              <span>اعتماد وحفظ الصوت</span>
            </button>
          </div>
        </div>
      )}

      {showInstructions && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 max-w-lg w-full text-right space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-xl font-bold text-amber-300">📱 خطوات التسجيل والحفظ</h3>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-purple-300 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs text-purple-200 mb-2 font-semibold">1️⃣ اختر الجهاز الذي تسجّل منه:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setDeviceOs('ios')}
                  className={`py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                    deviceOs === 'ios'
                      ? 'bg-amber-500 text-slate-900 shadow-lg'
                      : 'bg-slate-800 text-purple-200 hover:bg-slate-700'
                  }`}
                >
                  🍎 iPhone
                </button>
                <button
                  onClick={() => setDeviceOs('android')}
                  className={`py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                    deviceOs === 'android'
                      ? 'bg-amber-500 text-slate-900 shadow-lg'
                      : 'bg-slate-800 text-purple-200 hover:bg-slate-700'
                  }`}
                >
                  🤖 Android
                </button>
                <button
                  onClick={() => setDeviceOs('windows')}
                  className={`py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                    deviceOs === 'windows'
                      ? 'bg-amber-500 text-slate-900 shadow-lg'
                      : 'bg-slate-800 text-purple-200 hover:bg-slate-700'
                  }`}
                >
                  💻 Windows
                </button>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 text-sm text-purple-100">
              <span className="text-xs text-purple-300 font-bold block mb-3">2️⃣ خطوات التسجيل والحفظ:</span>
              
              {deviceOs === 'ios' && (
                <ol className="list-decimal list-inside space-y-3 text-xs md:text-sm">
                  <li>افتح تطبيق <strong>"مذكرات صوتية" (Voice Memos)</strong>.</li>
                  <li>
                    اضغط على <strong>الزر الأحمر</strong> واقرأ بوضوح:
                    <div className="my-2 p-3 bg-purple-950/40 border border-amber-500/30 rounded-xl text-amber-200 font-serif text-sm leading-relaxed">
                      "كان يا ما كان، بأديم الزمان، كان في أمَر صغير عم يبتسم لَلولاد الحلوين أبل ما يناموا براحة وأمان..."
                    </div>
                  </li>
                  <li>اضغط على <strong>الزر الأحمر</strong> عند انتهاء القراءة لإيقاف التسجيل.</li>
                  <li>اضغط على النقاط الثلاث <code>...</code> بجانب التسجيل واضغط على <strong>"حفظ في الملفات" (Save to Files)</strong>.</li>
                  <li>سمِّ الملف <code>صوت_{voiceOwner}.mp3</code> واحتفظ به في مجلد Downloads.</li>
                </ol>
              )}

              {deviceOs === 'android' && (
                <ol className="list-decimal list-inside space-y-3 text-xs md:text-sm">
                  <li>افتح تطبيق <strong>"مسجل الصوت" (Voice Recorder)</strong>.</li>
                  <li>
                    اضغط على <strong>زر التسجيل</strong> واقرأ بوضوح:
                    <div className="my-2 p-3 bg-purple-950/40 border border-amber-500/30 rounded-xl text-amber-200 font-serif text-sm leading-relaxed">
                      "كان يا ما كان، بأديم الزمان، كان في أمَر صغير عم يبتسم لَلولاد الحلوين أبل ما يناموا براحة وأمان..."
                    </div>
                  </li>
                  <li>اضغط على <strong>الزر الأحمر (إيقاف)</strong> عند انتهاء القراءة.</li>
                  <li>اضغط على <strong>حفظ</strong> واكتب اسم الملف <code>صوت_{voiceOwner}.mp3</code> ليُحفظ في مجلد Audio أو Downloads.</li>
                </ol>
              )}

              {deviceOs === 'windows' && (
                <ol className="list-decimal list-inside space-y-3 text-xs md:text-sm">
                  <li>افتح موقع تسجل مباشر مثل <strong>online-voice-recorder.com</strong> في المتصفح.</li>
                  <li>
                    اضغط على <strong>زر الميكروفون الأحمر</strong> واقرأ بوضوح:
                    <div className="my-2 p-3 bg-purple-950/40 border border-amber-500/30 rounded-xl text-amber-200 font-serif text-sm leading-relaxed">
                      "كان يا ما كان، بأديم الزمان، كان في أمَر صغير عم يبتسم لَلولاد الحلوين أبل ما يناموا براحة وأمان..."
                    </div>
                  </li>
                  <li>اضغط على <strong>زر الإيقاف</strong> عند الانتهاء من القراءة.</li>
                  <li>اضغط على <strong>Save (حفظ)</strong> سيتم تحميل الملف فوراً بصيغة <strong>MP3</strong>.</li>
                </ol>
              )}
            </div>

            <div className="bg-purple-950/40 p-3.5 rounded-xl border border-purple-500/20 text-xs text-purple-200">
              <span className="font-bold text-amber-300 block mb-1">3️⃣ تحميل الملف في التطبيق:</span>
              اغلق هذه النافذة، واضغط على <strong>"📁 اختيار ملف الصوت (MP3)"</strong>، ثم حدد الملف المُسجّل.
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white transition-all mt-2"
            >
              فهمت الخطوات 👍
            </button>
          </div>
        </div>
      )}
    </div>
  );
};