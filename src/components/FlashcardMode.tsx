import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Volume2,
  CheckCircle,
  Star,
  Sparkles,
} from 'lucide-react';
import {
  FOCUS_1_ERROR_WORDS,
  FOCUS_2_CONFUSED_WORDS,
  FOCUS_3_SIMILAR_WORDS,
  FOCUS_4_IDIOM_PHONETICS,
  FOCUS_5_FOOD_PHONETICS,
  FOCUS_6_POLYPHONIC_WORDS,
  FOCUS_7_LIFE_PHONETICS,
  FOCUS_8_CLASSICAL_PARTICLES,
  FOCUS_9_LOAN_WORDS,
} from '../data';
import { speakText } from '../utils/speech';

interface FlashcardItem {
  id: string;
  source: string;
  frontTitle: string;
  frontSubtitle: string;
  frontHint?: string;
  backMainChar: string;
  backZhuyin: string;
  backPhrase: string;
  backMeaning: string;
  backTrap?: string;
  mnemonic?: string;
}

interface FlashcardModeProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  mastered: string[];
  onToggleMastered: (id: string) => void;
}

export const FlashcardMode: React.FC<FlashcardModeProps> = ({
  favorites,
  onToggleFavorite,
  mastered,
  onToggleMastered,
}) => {
  const [category, setCategory] = useState<string>('focus1');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Prepare card items based on category
  const cardItems = useMemo<FlashcardItem[]>(() => {
    if (category === 'focus1') {
      return FOCUS_1_ERROR_WORDS.map((w) => ({
        id: w.id,
        source: '焦點一：易寫錯的字',
        frontTitle: w.charWithParens.replace(/\([^\)]+\)/g, '（ ❓ ）'),
        frontSubtitle: `注音：【${w.zhuyin}】`,
        frontHint: `提示：${w.meaning.slice(0, 30)}...`,
        backMainChar: w.targetChar,
        backZhuyin: w.zhuyin,
        backPhrase: w.fullPhrase,
        backMeaning: w.meaning,
        backTrap: w.commonMistake ? `常見錯誤寫法：【${w.commonMistake}】` : undefined,
      }));
    } else if (category === 'focus2') {
      const items: FlashcardItem[] = [];
      FOCUS_2_CONFUSED_WORDS.forEach((g) => {
        g.examples.forEach((ex, idx) => {
          items.push({
            id: `${g.id}-${idx}`,
            source: '焦點二：常誤用字辨析',
            frontTitle: `【${g.chars.join(' vs ')}】辨析`,
            frontSubtitle: `請填入正確字：「${ex.phrase.replace(new RegExp(ex.char, 'g'), '（ ❓ ）')}」`,
            frontHint: ex.explanation,
            backMainChar: ex.char,
            backZhuyin: '',
            backPhrase: ex.phrase,
            backMeaning: ex.explanation || '',
            backTrap: `對比字組：${g.chars.filter((c) => c !== ex.char).join('、')}`,
          });
        });
      });
      return items;
    } else if (category === 'focus3') {
      const items: FlashcardItem[] = [];
      FOCUS_3_SIMILAR_WORDS.forEach((g) => {
        g.entries.forEach((e, idx) => {
          items.push({
            id: `${g.id}-${idx}`,
            source: '焦點三：形近字全集',
            frontTitle: `形近字辨析：「${e.example}」`,
            frontSubtitle: `釋義：${e.meaning}`,
            frontHint: g.mnemonic ? `口訣提示：${g.mnemonic}` : undefined,
            backMainChar: e.char,
            backZhuyin: e.zhuyin,
            backPhrase: e.example,
            backMeaning: e.meaning,
            mnemonic: g.mnemonic,
          });
        });
      });
      return items;
    } else if (category === 'focus4') {
      return FOCUS_4_IDIOM_PHONETICS.map((item) => ({
        id: item.id,
        source: '焦點四：成語字音精選',
        frontTitle: item.phrase,
        frontSubtitle: `請回答「${item.targetChar}」的正確注音`,
        frontHint: item.explanation,
        backMainChar: item.targetChar,
        backZhuyin: item.zhuyin,
        backPhrase: item.phrase,
        backMeaning: item.explanation || '',
      }));
    } else if (category === 'focus5') {
      return FOCUS_5_FOOD_PHONETICS.map((item) => ({
        id: item.id,
        source: '焦點五：日常美食料理讀音',
        frontTitle: item.foodName,
        frontSubtitle: `請回答「${item.targetChar}」字審定音`,
        frontHint: item.note,
        backMainChar: item.targetChar,
        backZhuyin: item.zhuyin,
        backPhrase: `${item.foodName}（${item.fullZhuyin || item.zhuyin}）`,
        backMeaning: item.note || '',
      }));
    } else if (category === 'focus6') {
      return FOCUS_6_POLYPHONIC_WORDS.map((item) => ({
        id: item.id,
        source: '焦點六：一字多音破音字',
        frontTitle: `「${item.char}」多音字辨析`,
        frontSubtitle: `共有 ${item.readings.length} 種破音讀法`,
        frontHint: item.mnemonic || `詞例：${item.readings.map((r) => r.examples[0]).join('、')}`,
        backMainChar: item.char,
        backZhuyin: item.readings.map((r) => r.zhuyin).join(' / '),
        backPhrase: item.readings.map((r) => `【${r.zhuyin}】：${r.examples.slice(0, 2).join('、')}`).join('；'),
        backMeaning: item.readings.map((r) => `${r.zhuyin}（${r.meaning}）`).join('；'),
        mnemonic: item.mnemonic,
      }));
    } else if (category === 'focus7') {
      return FOCUS_7_LIFE_PHONETICS.map((item) => ({
        id: item.id,
        source: '焦點七：生活與常考語音',
        frontTitle: item.phrase,
        frontSubtitle: `請回答「${item.targetChar}」字教育部審定音`,
        frontHint: item.note,
        backMainChar: item.targetChar,
        backZhuyin: item.zhuyin,
        backPhrase: `${item.phrase}（${item.zhuyin}）`,
        backMeaning: item.note || '',
      }));
    } else if (category === 'focus8') {
      return FOCUS_8_CLASSICAL_PARTICLES.map((item) => ({
        id: item.id,
        source: '焦點八：文言虛詞多義',
        frontTitle: `文言虛詞「${item.char}」`,
        frontSubtitle: `共有 ${item.usages.length} 種義項詞性用法`,
        frontHint: item.mnemonic || `例句：${item.usages[0].examples[0]}`,
        backMainChar: item.char,
        backZhuyin: '',
        backPhrase: item.usages.map((u) => `【${u.meaning}】：${u.examples[0]}`).join('；'),
        backMeaning: item.usages.map((u, i) => `${i + 1}. ${u.meaning}`).join('\n'),
        mnemonic: item.mnemonic,
      }));
    } else {
      return FOCUS_9_LOAN_WORDS.map((item) => ({
        id: item.id,
        source: '焦點九：會考重要通假字',
        frontTitle: `「${item.originalChar}」字（通假考點）`,
        frontSubtitle: `出處：${item.source}；請回答其通字與讀音`,
        frontHint: `例句：${item.examples[0]}`,
        backMainChar: item.targetChar,
        backZhuyin: item.zhuyin,
        backPhrase: `「${item.originalChar}」通「${item.targetChar}」【${item.zhuyin}】`,
        backMeaning: `${item.meaning}（出自：${item.source}）${item.note ? `\n提示：${item.note}` : ''}`,
      }));
    }
  }, [category]);

  const [activeCards, setActiveCards] = useState<FlashcardItem[]>(cardItems);

  useEffect(() => {
    setActiveCards(cardItems);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [cardItems]);

  const currentCard = activeCards[currentIndex] || activeCards[0];

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1 < activeCards.length ? prev + 1 : 0));
  }, [activeCards.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 >= 0 ? prev - 1 : activeCards.length - 1));
  }, [activeCards.length]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...activeCards].sort(() => Math.random() - 0.5);
    setActiveCards(shuffled);
    setCurrentIndex(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev]);

  if (!currentCard) {
    return <div className="text-center py-12 text-stone-500">暫無卡片資料</div>;
  }

  const isFav = favorites.includes(currentCard.id);
  const isMast = mastered.includes(currentCard.id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Category selector */}
      <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setCategory('focus1')}
          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            category === 'focus1' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          易寫錯字形
        </button>
        <button
          onClick={() => setCategory('focus2')}
          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            category === 'focus2' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          誤用字辨析
        </button>
        <button
          onClick={() => setCategory('focus3')}
          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            category === 'focus3' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          形近字口訣
        </button>
        <button
          onClick={() => setCategory('focus4')}
          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            category === 'focus4' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          成語易誤讀
        </button>
        <button
          onClick={() => setCategory('focus5')}
          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            category === 'focus5' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          美食料理音
        </button>
        <button
          onClick={() => setCategory('focus6')}
          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            category === 'focus6' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          一字多音字
        </button>
        <button
          onClick={() => setCategory('focus7')}
          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            category === 'focus7' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          生活常考音
        </button>
        <button
          onClick={() => setCategory('focus8')}
          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            category === 'focus8' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          文言虛詞
        </button>
        <button
          onClick={() => setCategory('focus9')}
          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            category === 'focus9' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          重要通假字
        </button>
      </div>

      {/* Progress & Top Bar */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-2">
        <span className="font-semibold text-stone-700">
          第 <strong className="text-amber-700 text-base">{currentIndex + 1}</strong> / {activeCards.length} 張字卡
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1 text-stone-600 hover:text-stone-900 bg-white px-2.5 py-1 rounded-lg border border-stone-200 cursor-pointer transition hover:bg-stone-50"
          >
            <Shuffle className="w-3.5 h-3.5" />
            隨機洗牌
          </button>
        </div>
      </div>

      {/* Main Flashcard Container */}
      <div
        onClick={handleFlip}
        className={`w-full min-h-[360px] rounded-3xl p-6 sm:p-8 cursor-pointer border-2 transition-all duration-300 flex flex-col justify-between select-none relative ${
          isFlipped
            ? 'bg-amber-50/90 border-amber-300 shadow-md ring-4 ring-amber-100'
            : 'bg-white border-stone-200 shadow-xs hover:border-amber-300 hover:shadow-sm'
        }`}
      >
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
            {currentCard.source}
          </span>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => speakText(currentCard.backPhrase || currentCard.frontTitle)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
              title="語音朗讀"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleFavorite(currentCard.id)}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isFav ? 'text-amber-500' : 'text-stone-300 hover:text-stone-500'
              }`}
            >
              <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={() => onToggleMastered(currentCard.id)}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isMast ? 'text-emerald-600' : 'text-stone-300 hover:text-stone-500'
              }`}
            >
              <CheckCircle className={`w-4 h-4 ${isMast ? 'fill-emerald-100' : ''}`} />
            </button>
          </div>
        </div>

        {/* Center Card Body */}
        <div className="my-auto text-center py-6">
          {!isFlipped ? (
            /* FRONT: Question / Mask */
            <div className="space-y-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-serif-tc tracking-wider">
                {currentCard.frontTitle}
              </div>
              <div className="text-base sm:text-lg font-bold text-amber-800 font-serif-tc">
                {currentCard.frontSubtitle}
              </div>
              {currentCard.frontHint && (
                <div className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto line-clamp-2">
                  {currentCard.frontHint}
                </div>
              )}
              <div className="pt-4">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full animate-pulse">
                  <Sparkles className="w-3 h-3" />
                  點擊翻牌查看答案（或按空白鍵 Space）
                </span>
              </div>
            </div>
          ) : (
            /* BACK: Revealed Answer */
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <span className="text-5xl sm:text-6xl font-extrabold text-amber-900 font-serif-tc bg-white px-4 py-2 rounded-2xl shadow-sm border border-amber-200">
                  {currentCard.backMainChar}
                </span>
                {currentCard.backZhuyin && (
                  <span className="text-2xl sm:text-3xl font-extrabold text-amber-800 font-serif-tc px-3 py-1 bg-amber-100 rounded-xl border border-amber-200">
                    {currentCard.backZhuyin}
                  </span>
                )}
              </div>

              <div className="text-xl font-bold text-stone-900 font-serif-tc">
                完整詞語：{currentCard.backPhrase}
              </div>

              {currentCard.mnemonic && (
                <div className="text-sm font-bold text-amber-900 bg-white/80 p-2.5 rounded-xl border border-amber-200 max-w-md mx-auto">
                  記憶口訣：『{currentCard.mnemonic}』
                </div>
              )}

              {currentCard.backTrap && (
                <div className="text-xs font-bold text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200 max-w-sm mx-auto">
                  {currentCard.backTrap}
                </div>
              )}

              <div className="text-xs sm:text-sm text-stone-700 max-w-lg mx-auto bg-white/60 p-3 rounded-xl border border-stone-200/60 leading-relaxed text-left">
                <span className="font-bold text-stone-500">詳細釋義：</span>
                {currentCard.backMeaning}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Card Footer */}
        <div className="flex items-center justify-between text-xs text-stone-400 pt-3 border-t border-stone-100/80">
          <span>{isFlipped ? '點擊翻回正面' : '點擊翻面查看詳細字義'}</span>
          <span>支援鍵盤 ◀ / ▶ 與 空白鍵 翻牌</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          className="flex-1 py-3 px-4 rounded-2xl bg-white border border-stone-200 hover:border-amber-400 font-bold text-stone-700 hover:text-stone-900 transition flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:bg-stone-50"
        >
          <ChevronLeft className="w-5 h-5 text-stone-500" />
          <span>上一張 (◀)</span>
        </button>

        <button
          onClick={handleFlip}
          className="py-3 px-6 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>翻面 (Space)</span>
        </button>

        <button
          onClick={handleNext}
          className="flex-1 py-3 px-4 rounded-2xl bg-white border border-stone-200 hover:border-amber-400 font-bold text-stone-700 hover:text-stone-900 transition flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:bg-stone-50"
        >
          <span>下一張 (▶)</span>
          <ChevronRight className="w-5 h-5 text-stone-500" />
        </button>
      </div>

      {/* Quick Mark status on card */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={() => {
            onToggleMastered(currentCard.id);
            handleNext();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
            isMast
              ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
              : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
          }`}
        >
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          {isMast ? '已熟練掌握 (點擊下一張)' : '我記住了！標記掌握並下一張'}
        </button>
      </div>
    </div>
  );
};
