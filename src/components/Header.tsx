import React from 'react';
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
} from 'lucide-react';
import { DATA_STATS } from '../data';

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
}) => {
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
                <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                  國文會考字音字形註釋複習系統
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                  <Sparkles className="w-3 h-3 mr-1 text-amber-600" />
                  會考教材一字不漏
                </span>
              </div>
              <p className="text-xs text-stone-500">
                收錄完整會考教材：易錯字釋義、誤用字辨析、形近字口訣、成語精選、美食讀音、一字多音破音字、生活常考語音、文言虛詞多義、通假字彙整 (共 {DATA_STATS.totalItems} 項)
              </p>
            </div>
          </div>

          {/* Quick stats and Print button */}
          <div className="flex items-center gap-2 text-xs">
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
              <span>列印考卷 / 講義</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs and Search */}
        <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-stone-100 pt-3">
          <nav className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('review')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'review'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              課文完整複習
            </button>

            <button
              onClick={() => setActiveTab('flashcards')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'flashcards'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              字卡翻牌背誦
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'quiz'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              模擬測驗題庫
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                測驗
              </span>
            </button>

            <button
              onClick={() => setActiveTab('mistakes')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'mistakes'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              錯題筆記本
              {mistakeCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-200 text-stone-700 font-bold">
                  {mistakeCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'favorites'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Star className="w-4 h-4" />
              重點收藏
              {favoriteCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
                  {favoriteCount}
                </span>
              )}
            </button>
          </nav>

          {/* Search bar */}
          <div className="relative min-w-[220px] max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="搜尋國字、注音、釋義..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-stone-100 hover:bg-stone-50 focus:bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
