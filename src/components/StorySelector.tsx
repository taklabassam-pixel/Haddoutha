import React from 'react';
import { STORIES_LIST, FullStory } from '../data/stories'; // أو استيراد StoryMeta إذا كانت معرفة هناك
import { StoryMeta } from '../types/types';

interface StorySelectorProps {
  selectedStoryId: string | null;
  onSelectStory: (story: StoryMeta) => void;
}

export const StorySelector: React.FC<StorySelectorProps> = ({
  selectedStoryId,
  onSelectStory,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 dir-rtl">
      {/* عنوان الشاشة */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-amber-300 drop-shadow-md mb-2">
          📚 اختَر قِصَّةَ اليَوْمِ
        </h2>
        <p className="text-slate-200 text-sm md:text-base font-medium">
          اضغط على القصة التي تريد الاستماع إليها
        </p>
      </div>

      {/* شبكة البطاقات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {STORIES_LIST.map((story) => {
          const isSelected = selectedStoryId === story.id;

          return (
            <div
              key={story.id}
              onClick={() => onSelectStory(story)}
              className={`group relative cursor-pointer rounded-3xl p-4 transition-all duration-300 transform hover:-translate-y-2 border-4 ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-400 shadow-2xl shadow-amber-500/30 scale-105'
                  : 'bg-slate-800/80 border-slate-700/60 hover:border-amber-300/50 hover:shadow-xl'
              } backdrop-blur-md flex flex-col justify-between overflow-hidden`}
            >
              {/* صورة الغلاف */}
              <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-4 bg-slate-900">
                <img
                  src={story.coverImage}
                  alt={story.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    // صورة بديلة في حال تعذر تحميل الغلاف
                    (e.target as HTMLImageElement).src = '/audio/static/default_cover.png';
                  }}
                />
                
                {/* شارة المدة الزمنية */}
                <div className="absolute top-3 left-3 bg-slate-950/80 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/30 backdrop-blur-sm dir-ltr">
                  ⏱️ {Math.ceil(story.duration / 60)} دقائق
                </div>
              </div>

              {/* تفاصيل القصة */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-amber-300 transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed line-clamp-2 mb-4">
                    {story.description}
                  </p>
                </div>

                {/* زر الاختيار */}
                <button
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 shadow-md ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                      : 'bg-slate-700 text-slate-200 group-hover:bg-amber-400 group-hover:text-slate-950'
                  }`}
                >
                  {isSelected ? '✓ القصة المختارة' : 'استمع للقصة 🎧'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};