import React from 'react';
import { Story } from '../../data/stories';

interface StoryIntroPlayerProps {
  relation?: string;
  childGender?: 'male' | 'female' | 'boy' | 'girl';
  storyId?: string;
  story?: Story | null;
  childName?: string;
  onIntroComplete?: () => void;
}

const StoryIntroPlayer: React.FC<StoryIntroPlayerProps> = ({ 
  story,
  storyId,
  onIntroComplete 
}) => {
  // هذا المكون تم إيقاف استخدامه بعد الاعتماد على التشغيل المباشر لمشغل القصة
  return (
    <div className="w-full text-center p-4">
      <button 
        onClick={() => {
          if (onIntroComplete) onIntroComplete();
        }}
        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 px-4 rounded-xl shadow"
      >
        الانتقال للقصة
      </button>
    </div>
  );
};

export default StoryIntroPlayer;