import { useRef } from 'react';

export const useStoryAudio = () => {
  const audioCtxRef = useRef(null);

  /**
   * تشغيل التسلسل الصوتي المعتمد الجديد للقصة
   * @param {Object} config - إعدادات الجلسة
   * @param {'female'|'male'} config.childGender - جنس الطفل
   * @param {string} config.storyId - معرف القصة
   * @param {string} config.childName - اسم الطفل
   */
  const playSeamlessIntro = async ({ childGender, storyId, childName }) => {
    try {
      // 1. تهيئة Web Audio API Context
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // تحديد مسارات الملفات بناءً على التسلسل الجديد المعتمد
      const confirmAudioPath = '/audio/static/confirm_story.mp3';
      const titleAudioPath = `/audio/stories/${storyId}/title.wav`;
      
      const transitionFileName = childGender === 'female' ? 'transition_girl.mp3' : 'transition_boy.mp3';
      const transitionAudioPath = `/audio/static/${transitionFileName}`;
      
      const formattedChildName = childName ? childName.trim().replace(/\s+/g, '_') : 'default';
      const nameAudioPath = `/audio/ahlan_names/اهلاَ_يا_${formattedChildName}.wav`;
      
      const introP3Path = '/audio/static/intro_p3.wav';

      // 2. بناء مصفوفة المسارات بالتسلسل الصحيح والجديد
      const audioUrls = [
        confirmAudioPath,
        titleAudioPath,
        transitionAudioPath,
        nameAudioPath,
        introP3Path
      ];

      // 3. تحميل كافة المقاطع بالتوازي (Parallel Fetch & Decode)
      const buffers = await Promise.all(
        audioUrls.map(async (url) => {
          const res = await fetch(url);
          if (!res.ok) {
            throw new Error(`تعذر تحميل الملف الصوتي: ${url}`);
          }
          const arrayBuffer = await res.arrayBuffer();
          return await ctx.decodeAudioData(arrayBuffer);
        })
      );

      // 4. جدولة التشغيل المتتابع المليمترية (Zero-Gap Scheduling)
      let startTime = ctx.currentTime + 0.05;

      buffers.forEach((buffer, index) => {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(startTime);

        // فواصل زمنية بسيطة وطبيعية بين المقاطع
        const pauseOffset = 0.03;
        startTime += buffer.duration + pauseOffset;
      });

    } catch (error) {
      console.error("⚠️ خطأ أثناء تشغيل التسلسل الصوتي المعتمد:", error);
    }
  };

  return { playSeamlessIntro };
};