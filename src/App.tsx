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
import { TeacherDashboardModal } from './components/TeacherDashboardModal';
import { StudentLoginModal } from './components/StudentLoginModal';
import { QuizType } from './types';
import { MistakeRecord, QuizHistoryRecord } from './utils/storage';
import { useAuth } from './context/AuthContext';
import {
  subscribeFavorites,
  saveFavoriteToFirestore,
  subscribeMastered,
  saveMasteredToFirestore,
  subscribeMistakes,
  saveMistakeToFirestore,
  deleteMistakeFromFirestore,
  clearAllMistakesInFirestore,
  saveQuizHistoryToFirestore,
} from './services/firebaseService';
import { ShieldAlert, LogIn, KeyRound } from 'lucide-react';

export default function App() {
  const { currentUser, isFirebaseConnected, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>('review');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Persistent user state (Loaded purely from Firestore when user logs in)
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mastered, setMastered] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);

  // Modals
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false);
  const [isTeacherDashboardOpen, setIsTeacherDashboardOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Custom quiz trigger
  const [quizInitialType, setQuizInitialType] = useState<QuizType>('comprehensive');

  // Realtime sync with Firestore when currentUser is logged in (No localStorage for educational records!)
  useEffect(() => {
    if (!currentUser) {
      setFavorites([]);
      setMastered([]);
      setMistakes([]);
      return;
    }

    // Listen to Favorites in Firestore
    const unsubFav = subscribeFavorites(currentUser.id, (cloudFavs) => {
      setFavorites(cloudFavs);
    });

    // Listen to Mastered in Firestore
    const unsubMast = subscribeMastered(currentUser.id, (cloudMast) => {
      setMastered(cloudMast);
    });

    // Listen to Mistakes in Firestore
    const unsubMist = subscribeMistakes(currentUser.id, (cloudMist) => {
      setMistakes(cloudMist);
    });

    return () => {
      unsubFav();
      unsubMast();
      unsubMist();
    };
  }, [currentUser]);

  // Actions with Firestore sync
  const handleToggleFavorite = (id: string) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    const isCurrentlyFav = favorites.includes(id);
    const next = isCurrentlyFav
      ? favorites.filter((item) => item !== id)
      : [...favorites, id];
    setFavorites(next);
    saveFavoriteToFirestore(currentUser.id, id, !isCurrentlyFav);
  };

  const handleToggleMastered = (id: string) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    const isCurrentlyMastered = mastered.includes(id);
    const next = isCurrentlyMastered
      ? mastered.filter((item) => item !== id)
      : [...mastered, id];
    setMastered(next);
    saveMasteredToFirestore(currentUser.id, id, !isCurrentlyMastered);
  };

  const handleRemoveMistake = (id: string) => {
    if (!currentUser) return;
    const next = mistakes.filter((m) => m.id !== id);
    setMistakes(next);
    deleteMistakeFromFirestore(currentUser.id, id);
  };

  const handleClearMistakes = () => {
    if (!currentUser) return;
    setMistakes([]);
    clearAllMistakesInFirestore(currentUser.id);
  };

  const handleRecordMistake = (created: MistakeRecord) => {
    if (currentUser) {
      saveMistakeToFirestore(currentUser.id, created);
    }
  };

  const handleSaveQuizHistory = (created: QuizHistoryRecord) => {
    if (currentUser) {
      saveQuizHistoryToFirestore(currentUser.id, created);
    }
  };

  const handleStartCustomQuiz = (category: string) => {
    if (category === 'confused_words') {
      setQuizInitialType('confused_choice');
    } else if (category === 'food_phonetic' || category === 'idioms_phonetic') {
      setQuizInitialType('zhuyin_choice');
    } else if (category === 'classical_choice') {
      setQuizInitialType('classical_choice');
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
        currentUser={currentUser}
        isFirebaseConnected={isFirebaseConnected}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={logout}
        onOpenTeacherDashboard={() => setIsTeacherDashboardOpen(true)}
      />

      {/* Account Requirement Notice if not logged in */}
      {!currentUser && (
        <div className="bg-amber-500/10 border-b border-amber-300/60 px-4 py-2.5 text-xs text-amber-950 flex flex-col sm:flex-row items-center justify-between gap-2 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>班級專屬管制：</strong>本系統學習記錄與測驗成績存於 Firebase 雲端，請以老師發放之<strong>學生帳號與密碼</strong>登入，確保作答成果不流失。
            </span>
          </div>
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="px-3 py-1 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold transition cursor-pointer shrink-0 flex items-center gap-1 shadow-2xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>立即登入帳號</span>
          </button>
        </div>
      )}

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
            onGoToMistakes={() => setActiveTab('mistakes')}
            onRecordMistake={handleRecordMistake}
            onSaveQuizHistory={handleSaveQuizHistory}
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
            國中教育會考國文科 易寫錯字・常誤用字・形近字口訣・成語美食字音・文言虛詞通假 專題複習系統
          </p>
          <p className="mt-1 text-stone-400">
            完全遵照課本教材忠實收錄 ｜ 支援自製防猜答虛擬鍵盤、四選一測驗與 Firebase 雲端帳號管理
          </p>
        </div>
      </footer>

      {/* Printable Sheet Modal */}
      <PrintSheetModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
      />

      {/* Teacher & Classroom Dashboard Modal */}
      <TeacherDashboardModal
        isOpen={isTeacherDashboardOpen}
        onClose={() => setIsTeacherDashboardOpen(false)}
        isFirebaseConnected={isFirebaseConnected}
      />

      {/* Student & Teacher Login Modal */}
      <StudentLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
