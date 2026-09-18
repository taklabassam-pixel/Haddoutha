import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { RecordScreen } from './components/pages/RecordScreen';
import { KNOWN_NAME_PATTERNS } from './data/namesDatabase';
import StoryIntroPlayer from './components/player/StoryIntroPlayer';
import StoryPlayer from './components/player/StoryPlayer';
import { Screen, DialogueState, StoryMeta} from './types/types';
import { STORIES_LIST } from './data/stories';
import { OwlAvatar } from './components/OwlAvatar';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [dialogueState, setDialogueState] = useState<DialogueState>('ASK_GENDER');

  const [savedAudios, setSavedAudios] = useState<Record<string, string>>({});
  const [childName, setChildName] = useState<string>('');
  const [childGender, setChildGender] = useState<'boy' | 'girl' | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const [selectedStory, setSelectedStory] = useState<StoryMeta | null>(null);

  const [owlSpeech, setOwlSpeech] = useState<string | null>(null);
  const [isIntroFinished, setIsIntroFinished] = useState<boolean>(false);
  
  const [audioSrc, setAudioSrc] = useState<string | undefined>(undefined);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  // حالة للتحكم بظهور شاشة اختيار الجنس تلقائياً بعد انتهاء الترحيب الصوتي الأول
  const [isIntroAudioFinished, setIsIntroAudioFinished] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // خلفية النجوم
  const stars = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      scale: 0.5 + Math.random() * 1.5,
    }));
  }, []);

  // حساب الحروف المتاحة بحسب الجنس
  const availableLetters = useMemo(() => {
    if (!childGender) return [];
    const genderNames = KNOWN_NAME_PATTERNS.filter((p) => p.gender === childGender);
    const lettersSet = new Set<string>();
    genderNames.forEach((item) => {
      const firstChar = item.name.trim().charAt(0);
      const normalizedChar = ['أ', 'إ', 'آ'].includes(firstChar) ? 'أ' : firstChar;
      lettersSet.add(normalizedChar);
    });
    return Array.from(lettersSet).sort((a, b) => a.localeCompare(a, 'ar'));
  }, [childGender]);

  // حساب الأسماء المفلترة
  const filteredNames = useMemo<string[]>(() => {
    if (!selectedLetter || !childGender) return [];
    return KNOWN_NAME_PATTERNS
      .filter((p) => p.gender === childGender)
      .map((p) => p.name)
      .filter((nameVal: string) => {
        const firstChar = nameVal.trim().charAt(0);
        const normalizedChar = ['أ', 'إ', 'آ'].includes(firstChar) ? 'أ' : firstChar;
        return normalizedChar === selectedLetter;
      });
  }, [childGender, selectedLetter]);

  // 1. اختيار الجنس
  const handleSelectGender = (gender: 'boy' | 'girl') => {
    setChildGender(gender);
    setSelectedLetter('');
    setDialogueState('ASK_LETTER');
  };

  // 2. اختيار الحرف
  const handleSelectLetter = (letter: string) => {
    setSelectedLetter(letter);
    setDialogueState('ASK_NAME');
  };

  // 3. اختيار الاسم -> الانتقال لمرحلة WELCOME لتشغيل الملف المدمج من مجلد Ahlan Names
  const handleSelectName = (name: string) => {
    setChildName(name);
    setDialogueState('WELCOME');
  };

  // 4. اختيار القصة
 const handleStartStory = (story: StoryMeta) => {
  // 1. تعيين القصة المختارة وتحديث حالة الحوار
  setSelectedStory(story);
  setIsIntroFinished(false);
  setDialogueState('CONFIRMED');
};

  // نص كلام البومة التفاعلي
  const getOwlSpeech = useCallback((): string => {
    if (owlSpeech) return owlSpeech;

    const isGirl = childGender === 'girl';
    const lieDownText = isGirl ? 'تسطحي' : 'تسطح';
    const shatraText = isGirl ? 'يا شاطرة' : 'يا شاطر';
    const esmekText = isGirl ? 'اسمِك' : 'اسمَك';
    const chooseActionText = isGirl ? 'اختاري' : 'اختار';

    switch (dialogueState) {
      case 'ASK_GENDER':
        return 'أهلاً وسهلاً يا حلوين، أنا البومة  كوكو!، اشتقتلكن... قولولي! مين بده يسمع القصة اليوم؟ إنتَ أو انتِ؟';

      case 'ASK_LETTER':
        return `شو أول حرف من ${esmekText} ${shatraText}؟`;

      case 'ASK_NAME':
        return  ` ممتاز يللّا! ${chooseActionText} ${esmekText} الحلو`;

      case 'WELCOME':
        return `أهلاً يا ${childName}!  أيَّ حدوثة بدنا نسمع اليوم؟`;

      case 'CONFIRMED': {
        const storyTitle = selectedStory?.title || '';
        // return `يلا ${lieDownText} يا ${childName || ''} لنسمع قصة ${storyTitle}!`;
        return `ممتاز! بدنا نتعرّف اليوم على ${storyTitle}`;
      }

      default:
        return '';
    }
  }, [childGender, childName, dialogueState, owlSpeech, selectedStory]);

 // تشغيل الصوت المباشر وتسلسل الصوت التلقائي للمراحل
  useEffect(() => {
    let activeAudio: HTMLAudioElement | null = null;
    let isCancelled = false;

    const playAudioSequence = async () => {
      if (dialogueState === 'ASK_LETTER' && childGender) {
        const fileName = childGender === 'girl' ? 'Shou_ya_shatra.mp3' : 'Shou_ya_shater.mp3';
        activeAudio = new Audio(`/audio/static/${fileName}`);

        setIsAudioPlaying(true);
        activeAudio.play().catch((err) => console.error('خطأ في تشغيل الصوت:', err));
        activeAudio.onended = () => {
          if (!isCancelled) setIsAudioPlaying(false);
        };

      } else if (dialogueState === 'ASK_NAME' && childGender) {
        const fileName = childGender === 'girl' ? 'Yalla_esmek.mp3' : 'Yalla_esmak.mp3';
        activeAudio = new Audio(`/audio/static/${fileName}`);

        setIsAudioPlaying(true);
        activeAudio.play().catch((err) => console.error('خطأ في تشغيل الصوت:', err));
        activeAudio.onended = () => {
          if (!isCancelled) setIsAudioPlaying(false);
        };

      } else if (dialogueState === 'WELCOME' && childName) {
        // تسلسل الترحيب: تشغيل صوت اسم الطفل أولاً، ثم صوت Which_story
        const fileName = `اهلاَ_يا_${childName}.wav`;
        const nameAudioPath = `/audio/ahlan_names/${fileName}`;
        const storyAudioPath = `/audio/static/which_story.mp3`;

        setIsAudioPlaying(true);
        const nameAudio = new Audio(nameAudioPath);
        activeAudio = nameAudio;

        nameAudio.play().then(() => {
          nameAudio.onended = () => {
            if (isCancelled) return;
            const storyAudio = new Audio(storyAudioPath);
            activeAudio = storyAudio;
            
            storyAudio.play().catch((err) => console.error('خطأ في تشغيل صوت Which_story:', err));
            
            storyAudio.onended = () => {
              if (!isCancelled) setIsAudioPlaying(false);
            };
          };
        }).catch((err) => {
          console.warn(`لم يتم العثور على ملف الاسم (${nameAudioPath})، التشغيل الاحتياطي المباشر:`, err);
          if (!isCancelled) {
            const fallbackAudio = new Audio(storyAudioPath);
            activeAudio = fallbackAudio;
            fallbackAudio.play().catch((e) => console.error(e));
            fallbackAudio.onended = () => {
              if (!isCancelled) setIsAudioPlaying(false);
            };
          }
        });

      } else if (dialogueState === 'CONFIRMED' && selectedStory) {
        // التسلسل عند التأكيد: صوت التأكيد -> عنوان القصة -> الانتقال للمشغل مباشرة
        const confirmAudioPath = '/audio/static/confirm_story.mp3';
        const titleAudioPath = `/audio/stories/${selectedStory.id}/title.wav`;

        setIsAudioPlaying(true);
        
        // 1. تشغيل صوت التأكيد
        const confirmAudio = new Audio(confirmAudioPath);
        activeAudio = confirmAudio;

        confirmAudio.play().then(() => {
          confirmAudio.onended = () => {
            if (isCancelled) return;
            
            // 2. تشغيل عنوان القصة ثم الانتقال للمشغل النهائي مباشرة
            const titleAudio = new Audio(titleAudioPath);
            activeAudio = titleAudio;
            
            titleAudio.play().then(() => {
              titleAudio.onended = () => {
                if (!isCancelled) {
                  setIsAudioPlaying(false);
                  if (typeof setIsIntroFinished === 'function') {
                    setIsIntroFinished(true);
                  }
                }
              };
            }).catch((err) => {
              console.error('خطأ في تشغيل عنوان القصة، الانتقال للمشغل مباشرة:', err);
              if (!isCancelled) {
                setIsAudioPlaying(false);
                if (typeof setIsIntroFinished === 'function') setIsIntroFinished(true);
              }
            });
          };
        }).catch((err) => {
          console.error('خطأ في تشغيل صوت التأكيد:', err);
          if (!isCancelled) {
            setIsAudioPlaying(false);
            if (typeof setIsIntroFinished === 'function') setIsIntroFinished(true);
          }
        });

      } else {
        setIsAudioPlaying(false);
      }
    };

    playAudioSequence();

    return () => {
      isCancelled = true;
      setIsAudioPlaying(false);
      if (activeAudio) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
      }
    };
  }, [dialogueState, childGender, childName, selectedStory]);
  // تشغيل صوت الترحيب الأول عند النقر على البومة
  const playOwlWelcomeAndListen = () => {
    setIsListening(true);
    setIsAudioPlaying(true);

    if (audioRef.current) {
      audioRef.current.src = "/audio/static/ahlan_wasahlan.mp3";
      audioRef.current.currentTime = 0;

      audioRef.current.play().catch((error) => {
        console.error("خطأ في تشغيل الصوت:", error);
        setIsListening(false);
        setIsAudioPlaying(false);
        setIsIntroAudioFinished(true);
      });

      audioRef.current.onended = () => {
        setIsListening(false);
        setIsAudioPlaying(false);
        setIsIntroAudioFinished(true);
      };
    } else {
      setTimeout(() => {
        setIsListening(false);
        setIsAudioPlaying(false);
        setIsIntroAudioFinished(true);
      }, 3000);
    }
  };

  const handleSaveAudio = (owner: string, file: File) => {
    const audioUrl = URL.createObjectURL(file);
    setSavedAudios((prev) => {
      if (prev[owner]) URL.revokeObjectURL(prev[owner]);
      return { ...prev, [owner]: audioUrl };
    });
    setCurrentScreen('home');
  };

  const resetToHome = () => {
    setSelectedStory(null);
    setChildGender(null);
    setDialogueState('ASK_GENDER');
    setIsIntroFinished(false);
    setIsIntroAudioFinished(false);
    setCurrentScreen('home');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden select-none flex flex-col justify-between" dir="rtl">
      
      {/* عنصر الصوت الرئيسي */}
      <audio
        ref={audioRef}
        src={audioSrc}
        onPlay={() => setIsAudioPlaying(true)}
        onPause={() => setIsAudioPlaying(false)}
        onEnded={() => setIsAudioPlaying(false)}
      />

      {/* خلفية النجوم */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full animate-pulse opacity-100 pointer-events-none"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.scale * 3}px`,
            height: `${star.scale * 3}px`,
          }}
        />
      ))}

      {/* الهيدر */}
      <header className="relative z-20 flex justify-between items-center p-4 md:px-8 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={resetToHome}>
          <span className="text-3xl animate-pulse">🌙</span>
          <span className="text-2xl font-black bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 bg-clip-text text-transparent">
            حدوثة
          </span>
        </div>

        <nav className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setCurrentScreen('stories')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              currentScreen === 'stories' ? 'bg-amber-400 text-slate-900 shadow-lg scale-105' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            📚 القصص
          </button>
          <button
            onClick={() => setCurrentScreen('record')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              currentScreen === 'record' ? 'bg-amber-400 text-slate-900 shadow-lg scale-105' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            🎙️ تسجيل صوت
          </button>
          
          <button
            onClick={resetToHome}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/10 text-white hover:bg-white/20 transition-all flex items-center gap-1"
            title="العودة للبداية"
          >
            ↩️ عودة
          </button>
        </nav>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 text-center">
        
        {/* صورة القمر */}
        <div className="absolute top-6 right-8 md:top-10 md:right-16 z-0 pointer-events-none select-none">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-slate-100 via-white to-amber-50 shadow-[0_0_50px_rgba(255,255,255,0.6)] relative overflow-hidden opacity-95">
            <div className="absolute top-3 left-4 w-5 h-5 rounded-full bg-slate-200/40" />
            <div className="absolute bottom-5 right-6 w-8 h-8 rounded-full bg-slate-200/30" />
          </div>
        </div>

        {/* الشاشة الرئيسية */}
        {currentScreen === 'home' && (
          <div className="flex flex-col items-center gap-5 max-w-2xl w-full relative z-10">
            
            {/* البومة التفاعلية */}
            <div className="w-36 h-36 md:w-44 md:h-44 relative flex items-center justify-center">
              <OwlAvatar
                imageSrc="/images/owl.png" 
                videoSrc="/videos/koko_welcome.mp4"
                isPlaying={isAudioPlaying}
                isListening={isListening}
                onOwlClick={playOwlWelcomeAndListen}
              />
            </div>

            {/* فقاعة كلام البومة الأصلي */}
            <div className="bg-purple-950/90 border border-amber-400/40 px-6 py-4 rounded-2xl text-amber-100 font-bold text-base md:text-lg shadow-2xl backdrop-blur-md max-w-md mx-auto">
              "{getOwlSpeech()}"
            </div>

            {/* اختيار الجنس */}
            {dialogueState === 'ASK_GENDER' && isIntroAudioFinished && (
              <div className="mt-3 flex flex-col items-center gap-4 animate-fade-in w-full">
                <div className="flex items-center justify-center gap-6 md:gap-10 w-full max-w-md">
                  <div
                    onClick={() => handleSelectGender('boy')}
                    className="group cursor-pointer bg-slate-900/80 hover:bg-slate-800 border-2 border-blue-500/40 hover:border-blue-400 p-4 rounded-3xl transition-all duration-300 transform hover:scale-105 shadow-xl flex flex-col items-center gap-3 w-36 md:w-44"
                  >
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-blue-950/50 border border-blue-400/30 flex items-center justify-center p-1">
                      <img
                        src="/images/he.png"
                        alt="ولد"
                        className="w-full h-full object-contain group-hover:scale-110 transition duration-300"
                      />
                    </div>
                    <span className="font-extrabold text-blue-300 text-lg group-hover:text-blue-200">أنا </span>
                  </div>

                  <div
                    onClick={() => handleSelectGender('girl')}
                    className="group cursor-pointer bg-slate-900/80 hover:bg-slate-800 border-2 border-pink-500/40 hover:border-pink-400 p-4 rounded-3xl transition-all duration-300 transform hover:scale-105 shadow-xl flex flex-col items-center gap-3 w-36 md:w-44"
                  >
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-pink-950/50 border border-pink-400/30 flex items-center justify-center p-1">
                      <img
                        src="/images/she.png"
                        alt="بنت"
                        className="w-full h-full object-contain group-hover:scale-110 transition duration-300"
                      />
                    </div>
                    <span className="font-extrabold text-pink-300 text-lg group-hover:text-pink-200">أنا </span>
                  </div>
                </div>
              </div>
            )}

            {/* اختيار الحرف الأول */}
            {dialogueState === 'ASK_LETTER' && (
              <div className="flex flex-col items-center gap-2 mt-2">
                <div className="grid grid-cols-5 gap-2 max-h-52 overflow-y-auto p-2 w-full max-w-xs">
                  {availableLetters.map((char) => (
                    <button
                      key={char}
                      onClick={() => handleSelectLetter(char)}
                      className="p-3 bg-slate-900/90 hover:bg-amber-400 hover:text-slate-950 font-black text-lg rounded-xl transition border border-white/10 shadow-md"
                    >
                      {char}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setDialogueState('ASK_GENDER')}
                  className="text-xs text-amber-300 underline mt-1"
                >
                  ↩️ تغيير الاختيار
                </button>
              </div>
            )}

            {/* اختيار الاسم */}
            {dialogueState === 'ASK_NAME' && (
              <div className="flex flex-col gap-2 max-h-52 overflow-y-auto p-2 w-full max-w-xs mt-2">
                {filteredNames.map((personName, i) => (
                  <button
                    key={`${personName}-${i}`}
                    onClick={() => handleSelectName(personName)}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl transition text-base text-slate-950 shadow-md"
                  >
                    {personName}
                  </button>
                ))}
                <button
                  onClick={() => setDialogueState('ASK_LETTER')}
                  className="text-xs text-amber-300 underline mt-1"
                >
                  تغيير الحرف 🔄
                </button>
              </div>
            )}

            {/* مرحلة اختيار القصة بعد النقر على الاسم */}
            {dialogueState === 'WELCOME' && (
              <div className="w-full mt-2">
                <h3 className="text-lg font-bold text-amber-300 mb-3 text-center">📖 القصص المتاحة:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-h-80 overflow-y-auto p-1">
                  {STORIES_LIST.map((story) => (
                    <div
                      key={story.id}
                      onClick={() => handleStartStory(story)}
                      className="bg-slate-900/90 border border-purple-500/40 hover:border-amber-400 p-3 rounded-2xl cursor-pointer transition transform hover:scale-105 flex flex-col items-center gap-2 shadow-xl group"
                    >
                      <div className="w-full h-32 rounded-xl overflow-hidden bg-purple-950 border border-amber-400/30 flex items-center justify-center">
                        {story.coverImage ? (
                          <img
                            src={story.coverImage}
                            alt={story.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                          />
                        ) : (
                          <span className="text-4xl">📖</span>
                        )}
                      </div>
                      <span className="font-bold text-amber-200 text-sm group-hover:text-amber-400 transition">{story.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

{/* مشغل القصة المختارة */}
            {dialogueState === 'CONFIRMED' && selectedStory && (
              <div className="w-full flex justify-center">
                <StoryPlayer 
                  storyId={selectedStory.id}
                  childName={childName || ''}
                  onBack={() => {
                    setIsIntroFinished(false);
                    setDialogueState('WELCOME');
                  }}
                  onFinish={resetToHome}
                />
              </div>
            )}

          </div>
        )}

        {/* شاشة مكتبة القصص */}
        {currentScreen === 'stories' && (
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-amber-400/30 backdrop-blur-md max-w-md w-full shadow-2xl flex flex-col items-center gap-4">
            <h2 className="text-2xl font-black text-amber-300">📚 مكتبة القصص</h2>
            
            <div className="grid grid-cols-1 gap-3 w-full max-h-72 overflow-y-auto">
              {STORIES_LIST.map((story) => (
                <div key={story.id} className="bg-purple-950/60 p-3 rounded-2xl border border-purple-500/30 flex items-center gap-4 text-right">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-purple-900 border border-amber-400/40 flex-shrink-0">
                    {story.coverImage ? (
                      <img 
                        src={story.coverImage} 
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">📖</div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{story.title}</h3>
                    <p className="text-xs text-purple-200/80 mt-1">قصة تفاعلية مخصصة</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={resetToHome}
              className="px-6 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm transition shadow-md mt-2"
            >
              العودة للرئيسية
            </button>
          </div>
        )}

        {/* شاشة التسجيل */}
        {currentScreen === 'record' && (
          <RecordScreen
            onBack={resetToHome}
            onSaveAudio={handleSaveAudio}
          />
        )}
      </main>

      {/* الفوتر */}
      <footer className="relative z-20 py-3 text-center text-xs text-purple-300/60 bg-slate-950/80 border-t border-white/5">
        تطبيق حدوثة &copy; {new Date().getFullYear()} - تجربة قصصية عائلية دافئة
      </footer>
    </div>
  );
}