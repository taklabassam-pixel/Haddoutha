import React from 'react';

// تعريف نوع الخصائص (Props) لتتطابق مع TypeScript
interface StoriesListScreenProps {
  onBack: () => void;
  stories?: Array<{ id: number | string; title: string; desc?: string; coverImage?: string }>;
  onSelectStory?: (story: any) => void;
}

export default function StoriesListScreen({ onBack, stories: externalStories, onSelectStory }: StoriesListScreenProps) {
  // نموذج تجريبي افتراضي في حال لم يتم تمرير القائمة من الخارج
  const defaultStories = [
    { id: 1, title: "العُصْفُورُ الصَّغِيرُ وَالسَّمَكَةُ", desc: "رحلة صداقة عجيبة بين السماء والماء." },
    { id: 2, title: "سَارِقَا الْجَزَرِ", desc: "مغامرة لطيفة ومسلية في الحديقة." }
  ];

  const storiesToDisplay = externalStories && externalStories.length > 0 ? externalStories : defaultStories;

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 p-6 overflow-y-auto" dir="rtl">
      {/* رأس الصفحة مع زر الرجوع */}
      <div className="flex items-center justify-between mb-8 max-w-4xl mx-auto w-full">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl shadow-sm hover:bg-gray-100 transition-colors font-semibold"
        >
          ← رجوع للرئيسية
        </button>
        <h2 className="text-2xl font-bold text-gray-800">قائمة القصص المتاحة</h2>
        <div className="w-20"></div> {/* مساحة للتوازن البصري */}
      </div>

      {/* شبكة عرض القصص */}
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        {storiesToDisplay.map((story) => (
          <div 
            key={story.id} 
            className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xl font-bold text-indigo-900 mb-2">{story.title}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {'desc' in story ? story.desc : "قصة تفاعلية مخصصة للأطفال"}
              </p>
            </div>
            <button 
              onClick={() => {
                if (onSelectStory) {
                  onSelectStory(story);
                } else {
                  alert(`قريباً: فتح قصة ${story.title}`);
                }
              }}
              className="self-start py-2 px-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white font-medium rounded-xl transition-all duration-300"
            >
              قراءة القصة
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}