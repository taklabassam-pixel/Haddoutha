import React, { ReactNode } from 'react';

// تعريف الأنواع (Types) للخصائص التي يستقبلها المكون
interface ScreenWrapperProps {
  children: ReactNode;
  isActive: boolean;
}

export default function ScreenWrapper({ children, isActive }: ScreenWrapperProps) {
  return (
    <div
      className={`absolute inset-0 w-full h-full transition-all duration-300 ease-in-out transform ${
        isActive 
          ? "opacity-100 translate-y-0 pointer-events-auto z-10" 
          : "opacity-0 translate-y-3 pointer-events-none z-0"
      }`}
    >
      {children}
    </div>
  );
}