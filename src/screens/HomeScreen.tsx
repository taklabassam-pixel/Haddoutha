import React from 'react';

// تعريف نوع الخصائص (Props) الخاصة بالمكون لتتوافق مع TypeScript
interface HomeScreenProps {
  onNavigate: () => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 p-6 text-center">
      <div className="max-w-md bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white">
        <h1 className="text-3xl font-extrabold text-indigo-900 mb-4">
          عالم الحكايات والقصص
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          مرحباً بك في تطبيق القصص التفاعلي. استمتع بأجمل الحكايات المرئية والصوتية المصممة بعناية فائقة.
        </p>
        <button
          onClick={onNavigate}
          className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          تصفح قائمة القصص
        </button>
      </div>
    </div>
  );
}