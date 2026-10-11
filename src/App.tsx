/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { ReviewMode } from './components/ReviewMode';
import { FlashcardMode } from './components/FlashcardMode';
import { QuizMode } from './components/QuizMode';
import { MistakesMode } from './components/MistakesMode';
import { FavoritesMode } from './components/FavoritesMode';
import { PrintSheetModal } from './components/PrintSheetModal';
import { QuizType } from './types';
import {
  getFavorites,
  toggleFavorite,
  getMastered,
  toggleMastered,
  getMistakes,
  removeMistake,
  clearMistakes,
  MistakeRecord,
} from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('review');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Persistent user state
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mastered, setMastered] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);

  // Print modal
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false);

  // Custom quiz trigger
  const [quizInitialType, setQuizInitialType] = useState<QuizType>('comprehensive');

  // Load from local storage
  useEffect(() => {
    setFavorites(getFavorites());
    setMastered(getMastered());
    setMistakes(getMistakes());
  }, []);

  const handleToggleFavorite = (id: string) => {
    const next = toggleFavorite(id);
    setFavorites([...next]);
  };

  const handleToggleMastered = (id: string) => {
    const next = toggleMastered(id);
    setMastered([...next]);
  };

  const handleRemoveMistake = (id: string) => {
    const next = removeMistake(id);
    setMistakes([...next]);
  };

  const handleClearMistakes = () => {
    const next = clearMistakes();
    setMistakes([...next]);
  };

  const handleStartCustomQuiz = (category: string) => {
    if (category === 'confused_words') {
      setQuizInitialType('confused_choice');
    } else if (category === 'food_phonetic' || category === 'idioms_phonetic') {
      setQuizInitialType('zhuyin_choice');
    } else {
      setQuizInitialType('char_choice');
    }
    setActiveTab('quiz');
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans selection:bg-amber-200 selection:text-amber-900">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        favoriteCount={favorites.length}
        mistakeCount={mistakes.length}
        masteredCount={mastered.length}
        onOpenPrint={() => setIsPrintOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'review' && (
          <ReviewMode
            searchQuery={searchQuery}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            mastered={mastered}
            onToggleMastered={handleToggleMastered}
            onStartCustomQuiz={handleStartCustomQuiz}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardMode
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            mastered={mastered}
            onToggleMastered={handleToggleMastered}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizMode
            initialType={quizInitialType}
            onGoToReview={() => setActiveTab('review')}
            onGoToMistakes={() => {
              setMistakes(getMistakes());
              setActiveTab('mistakes');
            }}
          />
        )}

        {activeTab === 'mistakes' && (
          <MistakesMode
            mistakes={mistakes}
            onRemoveMistake={handleRemoveMistake}
            onClearMistakes={handleClearMistakes}
            onStartQuiz={() => {
              setQuizInitialType('comprehensive');
              setActiveTab('quiz');
            }}
          />
        )}

        {activeTab === 'favorites' && (
          <FavoritesMode
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onGoToReview={() => setActiveTab('review')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-stone-200 bg-white/60 text-center text-xs text-stone-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-medium text-stone-600">
            國中教育會考國文科 易寫錯字・常誤用字・形近字口訣・成語美食字音 專題複習系統
          </p>
          <p className="mt-1 text-stone-400">
            完全遵照課本教材一字不漏忠實收錄 ｜ 支援即時遮蔽背誦、字卡翻牌與會考全真測驗題庫
          </p>
        </div>
      </footer>

      {/* Printable Sheet Modal */}
      <PrintSheetModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
      />
    </div>
  );
}
