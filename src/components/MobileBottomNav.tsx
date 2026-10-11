import React from 'react';
import {
  BookOpen,
  Layers,
  HelpCircle,
  Bookmark,
  Star,
  Lock,
} from 'lucide-react';
import { ActiveTab } from './Header';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isQuizLocked?: boolean;
  mistakeCount: number;
  favoriteCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  isQuizLocked = false,
  mistakeCount,
  favoriteCount,
}) => {
  const tabs = [
    { id: 'review' as ActiveTab, label: '精讀', icon: BookOpen },
    { id: 'flashcards' as ActiveTab, label: '字卡', icon: Layers },
    { id: 'quiz' as ActiveTab, label: '測驗', icon: HelpCircle, isLocked: isQuizLocked },
    { id: 'mistakes' as ActiveTab, label: '錯題', icon: Bookmark, badge: mistakeCount },
    { id: 'favorites' as ActiveTab, label: '收藏', icon: Star, badge: favoriteCount },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] print:hidden pb-[env(safe-area-inset-bottom)]"
      aria-label="手機端底部快速導覽"
    >
      <div className="grid grid-cols-5 h-15 max-w-lg mx-auto px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 transition-all relative cursor-pointer select-none ${
                isActive
                  ? 'text-amber-700 font-bold scale-105'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'stroke-[2.4] text-amber-700' : 'stroke-[1.8]'
                  }`}
                />
                {tab.isLocked && (
                  <span className="absolute -top-1 -right-2 p-0.5 bg-rose-500 text-white rounded-full">
                    <Lock className="w-2 h-2" />
                  </span>
                )}
                {tab.badge !== undefined && tab.badge > 0 && !tab.isLocked && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-rose-600 text-white text-[9px] font-bold rounded-full leading-none">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] mt-0.5 tracking-tight ${
                  isActive ? 'font-bold text-amber-900' : 'text-stone-600 font-medium'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="w-6 h-0.5 bg-amber-600 rounded-full mt-0.5 animate-fade-in" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
