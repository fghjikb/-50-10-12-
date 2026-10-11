import React, { useState } from 'react';
import {
  BookOpen,
  Layers,
  HelpCircle,
  Bookmark,
  Star,
  Printer,
  Search,
  CheckCircle2,
  Sparkles,
  Cloud,
  LogIn,
  LogOut,
  Users,
  User as UserIcon,
  KeyRound,
} from 'lucide-react';
import { DATA_STATS } from '../data';
import { AppUser } from '../services/firebaseService';

export type ActiveTab = 'review' | 'flashcards' | 'quiz' | 'mistakes' | 'favorites';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  favoriteCount: number;
  mistakeCount: number;
  masteredCount: number;
  onOpenPrint: () => void;
  currentUser: AppUser | null;
  isFirebaseConnected: boolean;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  onOpenTeacherDashboard: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  favoriteCount,
  mistakeCount,
  masteredCount,
  onOpenPrint,
  currentUser,
  isFirebaseConnected,
  onOpenLoginModal,
  onLogout,
  onOpenTeacherDashboard,
}) => {
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Top brand bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
              國
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-stone-900 tracking-tight font-serif-tc">
                  國文會考字音字形註釋複習系統
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                  <Sparkles className="w-3 h-3 mr-1 text-amber-600" />
                  會考教材全收錄
                </span>
              </div>
              <p className="text-xs text-stone-500">
                收錄完整會考教材：易錯字釋義、誤用字辨析、形近字口訣、成語精選、美食讀音、破音字、生活常考語音、文言虛詞通假字 (共 {DATA_STATS.totalItems} 項)
              </p>
            </div>
          </div>

          {/* Quick stats, Print, Cloud Sync, and User Account */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            {/* Cloud Sync Status */}
            <div
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
                isFirebaseConnected
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                  : 'bg-stone-100 border-stone-200 text-stone-500'
              }`}
              title={isFirebaseConnected ? 'Firebase 雲端資料庫已連線' : '本機模式'}
            >
              <Cloud className={`w-3.5 h-3.5 ${isFirebaseConnected ? 'text-emerald-600' : 'text-stone-400'}`} />
              <span>{isFirebaseConnected ? 'Firebase 雲端已連線' : '離線模式'}</span>
            </div>

            <div className="hidden lg:flex items-center gap-3 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200">
              <span className="flex items-center text-stone-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                已掌握: <strong className="ml-1 text-emerald-700">{masteredCount}</strong>
              </span>
              <span className="text-stone-300">|</span>
              <span className="flex items-center text-stone-600">
                <Star className="w-3.5 h-3.5 text-amber-500 mr-1" />
                收藏: <strong className="ml-1 text-amber-700">{favoriteCount}</strong>
              </span>
              <span className="text-stone-300">|</span>
              <span className="flex items-center text-stone-600">
                <Bookmark className="w-3.5 h-3.5 text-rose-500 mr-1" />
                錯題: <strong className="ml-1 text-rose-700">{mistakeCount}</strong>
              </span>
            </div>

            <button
              onClick={onOpenPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-medium transition cursor-pointer"
              title="列印複習單或挖空練習卷"
            >
              <Printer className="w-4 h-4 text-stone-600" />
              <span className="hidden sm:inline">列印考卷/講義</span>
            </button>

            {/* Teacher Dashboard trigger */}
            <button
              onClick={onOpenTeacherDashboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50/80 hover:bg-amber-100/80 text-amber-900 font-bold transition cursor-pointer"
              title="查看全班學習進度與帳號管理"
            >
              <Users className="w-4 h-4 text-amber-700" />
              <span>教學管理與名冊</span>
            </button>

            {/* User Account / Student Sign In */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-bold transition cursor-pointer"
                >
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.displayName}
                      className="w-5 h-5 rounded-full"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px]">
                      {currentUser.seatNumber || currentUser.displayName.slice(0, 1)}
                    </div>
                  )}
                  <span className="max-w-[110px] truncate text-xs">
                    {currentUser.displayName}
                    {currentUser.seatNumber ? ` (${currentUser.seatNumber}號)` : ''}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 text-xs animate-fade-in">
                    <div className="p-2 border-b border-stone-100">
                      <div className="font-bold text-stone-900">{currentUser.displayName}</div>
                      <div className="text-[11px] text-stone-400 truncate">
                        {currentUser.username ? `帳號：${currentUser.username}` : (currentUser.email || '學生帳號')}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                          {currentUser.role === 'admin' ? '國文召集教師' : '會考衝刺學生'}
                        </span>
                        {currentUser.seatNumber && (
                          <span className="text-[10px] font-semibold text-stone-500">
                            座號: {currentUser.seatNumber}
                          </span>
                        )}
                      </div>
                    </div>
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenTeacherDashboard();
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-stone-50 flex items-center gap-2 text-stone-700 cursor-pointer mt-1"
                      >
                        <Users className="w-3.5 h-3.5 text-stone-500" />
                        全班學情與帳號管理
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-rose-50 flex items-center gap-2 text-rose-700 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      登出帳號
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold transition cursor-pointer shadow-xs"
                title="登入老師發放之學生帳號"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>學生／教師登入</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs and Search */}
        <div className="mt-3 pt-2 border-t border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <nav className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'review', label: '教材精讀總覽', icon: BookOpen },
              { id: 'flashcards', label: '字卡翻牌背誦', icon: Layers },
              { id: 'quiz', label: '會考全真測驗', icon: HelpCircle },
              { id: 'mistakes', label: '錯題本解析', icon: Bookmark, badge: mistakeCount },
              { id: 'favorites', label: '精選標記', icon: Star, badge: favoriteCount },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-amber-800 text-amber-100'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick search input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋國字、注音、釋義..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:bg-white focus:border-amber-600 focus:ring-1 focus:ring-amber-500 outline-hidden transition"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
