import React, { useState, useMemo } from 'react';
import {
  Eye,
  EyeOff,
  Volume2,
  Star,
  CheckCircle,
  Filter,
  Sparkles,
  BookOpen,
  HelpCircle,
  RotateCcw,
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

interface ReviewModeProps {
  searchQuery: string;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  mastered: string[];
  onToggleMastered: (id: string) => void;
  onStartCustomQuiz: (category: string, itemId?: string) => void;
}

type SectionKey = 'focus1' | 'focus2' | 'focus3' | 'focus4' | 'focus5' | 'focus6' | 'focus7' | 'focus8' | 'focus9';

const ZHUYIN_INITIALS = [
  '全部', 'ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ',
  'ㄍ', 'ㄎ', 'ㄏ', 'ㄐ', 'ㄑ', 'ㄒ', 'ㄓ', 'ㄔ', 'ㄕ',
  'ㄖ', 'ㄗ', 'ㄘ', 'ㄙ', 'ㄧ', 'ㄨ', 'ㄩ'
];

export const ReviewMode: React.FC<ReviewModeProps> = ({
  searchQuery,
  favorites,
  onToggleFavorite,
  mastered,
  onToggleMastered,
  onStartCustomQuiz,
}) => {
  const [activeSection, setActiveSection] = useState<SectionKey>('focus1');
  const [selectedInitial, setSelectedInitial] = useState<string>('全部');
  const [frequentOnly, setFrequentOnly] = useState<boolean>(false);

  // Masking states
  const [maskChar, setMaskChar] = useState<boolean>(false);
  const [maskZhuyin, setMaskZhuyin] = useState<boolean>(false);
  const [maskMeaning, setMaskMeaning] = useState<boolean>(false);

  // Revealed items cache for individual clicks
  const [revealedItems, setRevealedItems] = useState<Record<string, { char?: boolean; zhuyin?: boolean; meaning?: boolean }>>({});

  const toggleReveal = (id: string, field: 'char' | 'zhuyin' | 'meaning') => {
    setRevealedItems((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: !prev[id]?.[field],
      },
    }));
  };

  const resetReveals = () => {
    setRevealedItems({});
  };

  // Filter Focus 1 items
  const filteredFocus1 = useMemo(() => {
    return FOCUS_1_ERROR_WORDS.filter((item) => {
      if (selectedInitial !== '全部' && item.category !== selectedInitial) return false;
      if (frequentOnly && !item.isFrequent) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return (
          item.fullPhrase.includes(q) ||
          item.targetChar.includes(q) ||
          item.zhuyin.includes(q) ||
          item.meaning.includes(q) ||
          (item.commonMistake && item.commonMistake.includes(q))
        );
      }
      return true;
    });
  }, [selectedInitial, frequentOnly, searchQuery]);

  // Filter Focus 2 items
  const filteredFocus2 = useMemo(() => {
    return FOCUS_2_CONFUSED_WORDS.filter((item) => {
      if (frequentOnly && !item.isFrequent) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return (
          item.chars.some((c) => c.includes(q)) ||
          item.examples.some((e) => e.phrase.includes(q) || (e.explanation && e.explanation.includes(q)))
        );
      }
      return true;
    });
  }, [frequentOnly, searchQuery]);

  // Filter Focus 3 items
  const filteredFocus3 = useMemo(() => {
    return FOCUS_3_SIMILAR_WORDS.filter((group) => {
      if (frequentOnly && !group.isFrequent) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return (
          (group.mnemonic && group.mnemonic.includes(q)) ||
          group.entries.some(
            (e) =>
              e.char.includes(q) ||
              e.zhuyin.includes(q) ||
              e.meaning.includes(q) ||
              e.example.includes(q)
          )
        );
      }
      return true;
    });
  }, [frequentOnly, searchQuery]);

  // Filter Focus 4 items
  const filteredFocus4 = useMemo(() => {
    return FOCUS_4_IDIOM_PHONETICS.filter((item) => {
      if (selectedInitial !== '全部' && item.category !== selectedInitial) return false;
      if (frequentOnly && !item.isFrequent) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return (
          item.phrase.includes(q) ||
          item.targetChar.includes(q) ||
          item.zhuyin.includes(q) ||
          (item.explanation && item.explanation.includes(q))
        );
      }
      return true;
    });
  }, [selectedInitial, frequentOnly, searchQuery]);

  // Filter Focus 5 items
  const filteredFocus5 = useMemo(() => {
    return FOCUS_5_FOOD_PHONETICS.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return (
          item.foodName.includes(q) ||
          item.targetChar.includes(q) ||
          item.zhuyin.includes(q) ||
          (item.note && item.note.includes(q))
        );
      }
      return true;
    });
  }, [searchQuery]);

  const filteredFocus6 = useMemo(() => {
    return FOCUS_6_POLYPHONIC_WORDS.filter((item) => {
      if (frequentOnly && !item.isFrequent) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return (
          item.char.includes(q) ||
          (item.mnemonic && item.mnemonic.includes(q)) ||
          item.readings.some((r) => r.zhuyin.includes(q) || r.meaning.includes(q) || r.examples.some((ex) => ex.includes(q)))
        );
      }
      return true;
    });
  }, [searchQuery, frequentOnly]);

  const filteredFocus7 = useMemo(() => {
    return FOCUS_7_LIFE_PHONETICS.filter((item) => {
      if (frequentOnly && !item.isFrequent) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return (
          item.phrase.includes(q) ||
          item.targetChar.includes(q) ||
          item.zhuyin.includes(q) ||
          (item.note && item.note.includes(q))
        );
      }
      return true;
    });
  }, [searchQuery, frequentOnly]);

  const filteredFocus8 = useMemo(() => {
    return FOCUS_8_CLASSICAL_PARTICLES.filter((item) => {
      if (frequentOnly && !item.isFrequent) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return (
          item.char.includes(q) ||
          (item.mnemonic && item.mnemonic.includes(q)) ||
          item.usages.some(
            (u) =>
              u.meaning.includes(q) ||
              (u.explanation && u.explanation.includes(q)) ||
              u.examples.some((ex) => ex.includes(q))
          )
        );
      }
      return true;
    });
  }, [searchQuery, frequentOnly]);

  const filteredFocus9 = useMemo(() => {
    return FOCUS_9_LOAN_WORDS.filter((item) => {
      if (frequentOnly && !item.isFrequent) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return (
          item.originalChar.includes(q) ||
          item.targetChar.includes(q) ||
          item.zhuyin.includes(q) ||
          item.meaning.includes(q) ||
          item.source.includes(q) ||
          (item.note && item.note.includes(q)) ||
          item.examples.some((ex) => ex.includes(q))
        );
      }
      return true;
    });
  }, [searchQuery, frequentOnly]);

  return (
    <div className="space-y-6">
      {/* Section Sub-Navigation Tabs */}
      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        {/* Mobile Dropdown Select for Fast Navigation on Phones */}
        <div className="md:hidden flex items-center gap-2">
          <label htmlFor="mobile-section-select" className="text-xs font-bold text-stone-600 shrink-0">
            切換焦點：
          </label>
          <select
            id="mobile-section-select"
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value as any)}
            className="flex-1 bg-stone-50 border border-stone-300 text-stone-900 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
          >
            <option value="focus1">焦點一：易寫錯的字與釋義 ({FOCUS_1_ERROR_WORDS.length})</option>
            <option value="focus2">焦點二：常誤用字辨析 ({FOCUS_2_CONFUSED_WORDS.length})</option>
            <option value="focus3">焦點三：形近字全集口訣 ({FOCUS_3_SIMILAR_WORDS.length}組)</option>
            <option value="focus4">焦點四：成語字音精選 ({FOCUS_4_IDIOM_PHONETICS.length})</option>
            <option value="focus5">焦點五：美食料理讀音 ({FOCUS_5_FOOD_PHONETICS.length})</option>
            <option value="focus6">焦點六：一字多音破音字 ({FOCUS_6_POLYPHONIC_WORDS.length})</option>
            <option value="focus7">焦點七：生活與常考語音 ({FOCUS_7_LIFE_PHONETICS.length})</option>
            <option value="focus8">焦點八：文言虛詞多義 ({FOCUS_8_CLASSICAL_PARTICLES.length})</option>
            <option value="focus9">焦點九：重要通假字 ({FOCUS_9_LOAN_WORDS.length})</option>
          </select>
        </div>

        {/* Desktop / Tablet Horizontal Scroll Tab Bar */}
        <div className="hidden md:flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full md:w-auto scrollbar-none">
          <button
            onClick={() => setActiveSection('focus1')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'focus1'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <span>焦點一：易寫錯的字與釋義</span>
            <span className="text-[11px] opacity-80">({FOCUS_1_ERROR_WORDS.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('focus2')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'focus2'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <span>焦點二：常誤用字辨析</span>
            <span className="text-[11px] opacity-80">({FOCUS_2_CONFUSED_WORDS.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('focus3')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'focus3'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <span>焦點三：形近字全集口訣</span>
            <span className="text-[11px] opacity-80">({FOCUS_3_SIMILAR_WORDS.length}組)</span>
          </button>

          <button
            onClick={() => setActiveSection('focus4')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'focus4'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <span>焦點四：成語字音精選</span>
            <span className="text-[11px] opacity-80">({FOCUS_4_IDIOM_PHONETICS.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('focus5')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'focus5'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <span>焦點五：美食料理讀音</span>
            <span className="text-[11px] opacity-80">({FOCUS_5_FOOD_PHONETICS.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('focus6')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'focus6'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <span>焦點六：一字多音破音字</span>
            <span className="text-[11px] opacity-80">({FOCUS_6_POLYPHONIC_WORDS.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('focus7')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'focus7'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <span>焦點七：生活與常考語音</span>
            <span className="text-[11px] opacity-80">({FOCUS_7_LIFE_PHONETICS.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('focus8')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'focus8'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <span>焦點八：文言虛詞多義</span>
            <span className="text-[11px] opacity-80">({FOCUS_8_CLASSICAL_PARTICLES.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('focus9')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'focus9'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <span>焦點九：重要通假字</span>
            <span className="text-[11px] opacity-80">({FOCUS_9_LOAN_WORDS.length})</span>
          </button>
        </div>

        {/* High frequency filter */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFrequentOnly(!frequentOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              frequentOnly
                ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs'
                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${frequentOnly ? 'text-amber-600' : 'text-stone-400'}`} />
            只看常考標記
          </button>
        </div>
      </div>

      {/* Recitation Masking Control Bar (會考背誦神器) */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 text-stone-700 font-bold">
          <BookOpen className="w-4 h-4 text-amber-700" />
          <span>背誦遮蔽工具（點擊隱藏項目可隨時揭示）：</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setMaskChar(!maskChar);
              resetReveals();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
              maskChar
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
            }`}
          >
            {maskChar ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-stone-500" />}
            {maskChar ? '已遮蔽國字' : '遮蔽國字'}
          </button>

          <button
            onClick={() => {
              setMaskZhuyin(!maskZhuyin);
              resetReveals();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
              maskZhuyin
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
            }`}
          >
            {maskZhuyin ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-stone-500" />}
            {maskZhuyin ? '已遮蔽注音' : '遮蔽注音'}
          </button>

          <button
            onClick={() => {
              setMaskMeaning(!maskMeaning);
              resetReveals();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
              maskMeaning
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
            }`}
          >
            {maskMeaning ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-stone-500" />}
            {maskMeaning ? '已遮蔽釋義' : '遮蔽釋義'}
          </button>

          {(maskChar || maskZhuyin || maskMeaning) && (
            <button
              onClick={() => {
                setMaskChar(false);
                setMaskZhuyin(false);
                setMaskMeaning(false);
                resetReveals();
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-amber-100/60 transition flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              全部顯示
            </button>
          )}
        </div>
      </div>

      {/* Zhuyin Initials jump bar for Focus 1 & Focus 4 */}
      {(activeSection === 'focus1' || activeSection === 'focus4') && (
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-stone-500">
            <Filter className="w-3.5 h-3.5" />
            <span>依注音聲母快速跳轉：</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {ZHUYIN_INITIALS.map((init) => (
              <button
                key={init}
                onClick={() => setSelectedInitial(init)}
                className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedInitial === init
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {init}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 1 CONTENT: FOCUS 1 ERROR WORDS */}
      {activeSection === 'focus1' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 px-1">
            <span>顯示 {filteredFocus1.length} 個詞條</span>
            <span>點擊 🔊 朗讀 ｜ 點擊 ⭐ 收藏 ｜ 點擊 ✔ 標記熟練</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredFocus1.map((item) => {
              const isFav = favorites.includes(item.id);
              const isMast = mastered.includes(item.id);
              const itemRev = revealedItems[item.id] || {};

              // Display logic for Character
              const showChar = !maskChar || itemRev.char;
              // Display logic for Zhuyin
              const showZhu = !maskZhuyin || itemRev.zhuyin;
              // Display logic for Meaning
              const showMean = !maskMeaning || itemRev.meaning;

              return (
                <div
                  key={item.id}
                  className={`relative bg-white rounded-2xl p-4 border transition duration-150 flex flex-col justify-between hover:border-amber-400 hover:shadow-sm ${
                    isMast
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-stone-200'
                  }`}
                >
                  {/* Top row: Word phrase, Zhuyin, and badges */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Target Phrase with highlight */}
                        <div className="text-lg font-bold text-stone-900 tracking-wide font-serif-tc">
                          {showChar ? (
                            <span>
                              {(item.charWithParens.match(/\([^\)]+\)|[^\(\)]+/g) || [item.fullPhrase]).map((part, pIdx) => {
                                if (part.startsWith('(') && part.endsWith(')')) {
                                  return (
                                    <span
                                      key={pIdx}
                                      className="text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200 font-extrabold mx-0.5"
                                    >
                                      {part.slice(1, -1)}
                                    </span>
                                  );
                                }
                                return <span key={pIdx}>{part}</span>;
                              })}
                            </span>
                          ) : (
                            <button
                              onClick={() => toggleReveal(item.id, 'char')}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-900 text-amber-300 font-extrabold text-sm cursor-pointer shadow-xs hover:bg-stone-800"
                              title="點擊刮開答案"
                            >
                              <span>{item.charWithParens.replace(/\([^\)]+\)/g, '（ ❓ ）')}</span>
                            </button>
                          )}
                        </div>

                        {/* Zhuyin badge */}
                        <div>
                          {showZhu ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100/80 text-amber-900 border border-amber-200 font-serif-tc">
                              {item.zhuyin}
                            </span>
                          ) : (
                            <button
                              onClick={() => toggleReveal(item.id, 'zhuyin')}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-stone-200 text-stone-600 hover:bg-stone-300 cursor-pointer"
                              title="點擊顯示注音"
                            >
                              [注音遮蔽]
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => speakText(item.fullPhrase)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                          title="語音朗讀"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onToggleFavorite(item.id)}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            isFav
                              ? 'text-amber-500 hover:bg-amber-50'
                              : 'text-stone-300 hover:text-stone-500 hover:bg-stone-100'
                          }`}
                          title={isFav ? '取消收藏' : '加入收藏'}
                        >
                          <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                        </button>
                        <button
                          onClick={() => onToggleMastered(item.id)}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            isMast
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-stone-300 hover:text-stone-500 hover:bg-stone-100'
                          }`}
                          title={isMast ? '標記為未熟練' : '標記為已掌握'}
                        >
                          <CheckCircle className={`w-4 h-4 ${isMast ? 'fill-emerald-100' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Common Mistake Alert */}
                    {item.commonMistake && (
                      <div className="mt-2 text-xs flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200/60">
                        <span className="font-bold">常誤寫為：</span>
                        <span className="font-extrabold line-through text-rose-700 text-sm">
                          {item.commonMistake}
                        </span>
                      </div>
                    )}

                    {/* Meaning / Definition */}
                    <div className="mt-2.5 text-xs text-stone-700 leading-relaxed bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      <div className="font-semibold text-stone-500 mb-0.5">釋義：</div>
                      {showMean ? (
                        <p>{item.meaning}</p>
                      ) : (
                        <button
                          onClick={() => toggleReveal(item.id, 'meaning')}
                          className="text-stone-500 italic hover:text-amber-700 cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>[釋義已遮蔽，點擊顯示]</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card bottom: tags */}
                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span className="text-stone-400">聲母：{item.category}</span>
                    {item.isFrequent && (
                      <span className="inline-flex items-center text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        ⭐ 會考高頻考點
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2 CONTENT: FOCUS 2 CONFUSED WORDS */}
      {activeSection === 'focus2' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 px-1">
            <span>收錄 {filteredFocus2.length} 組常誤用字詞精選辨析</span>
            <span>對比區分詞義、形近與部首用法</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFocus2.map((group) => {
              const isFav = favorites.includes(group.id);
              const isMast = mastered.includes(group.id);

              return (
                <div
                  key={group.id}
                  className="bg-white rounded-2xl p-5 border border-stone-200 hover:border-amber-400 transition shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Chars comparison */}
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                          {group.number}
                        </span>
                        <div className="flex items-center gap-1.5 text-xl font-bold font-serif-tc text-stone-900">
                          {group.chars.map((c, idx) => (
                            <React.Fragment key={c}>
                              <span className="px-2 py-0.5 bg-stone-100 text-stone-900 rounded-lg border border-stone-200 font-extrabold">
                                {c}
                              </span>
                              {idx < group.chars.length - 1 && (
                                <span className="text-stone-400 text-sm font-sans">vs</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                        {group.isFrequent && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                            ⭐ 常考
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onToggleFavorite(group.id)}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            isFav ? 'text-amber-500' : 'text-stone-300 hover:text-stone-500'
                          }`}
                        >
                          <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                        </button>
                        <button
                          onClick={() => onToggleMastered(group.id)}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            isMast ? 'text-emerald-600' : 'text-stone-300 hover:text-stone-500'
                          }`}
                        >
                          <CheckCircle className={`w-4 h-4 ${isMast ? 'fill-emerald-100' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Detailed list of examples */}
                    <div className="mt-3.5 space-y-3">
                      {group.examples.map((ex, i) => (
                        <div
                          key={i}
                          className="bg-stone-50 rounded-xl p-3 border border-stone-100 text-xs text-stone-800"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="font-extrabold text-amber-800 text-base font-serif-tc bg-amber-100/70 px-2 py-0.5 rounded">
                              【{ex.char}】
                            </span>
                            <button
                              onClick={() => speakText(ex.phrase)}
                              className="text-stone-400 hover:text-stone-600 cursor-pointer"
                              title="語音示範"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="font-medium text-stone-900 mb-1 leading-relaxed">
                            <strong className="text-stone-500">詞例：</strong>
                            {ex.phrase}
                          </div>
                          {ex.explanation && (
                            <div className="text-stone-600 leading-relaxed">
                              <strong className="text-stone-500">釋義辨析：</strong>
                              {ex.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 flex items-center justify-end">
                    <button
                      onClick={() => onStartCustomQuiz('confused_words', group.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-900 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      測驗此組辨析題
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3 CONTENT: FOCUS 3 SIMILAR WORDS & MNEMONICS */}
      {activeSection === 'focus3' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 px-1">
            <span>收錄 {filteredFocus3.length} 組形近字家族（含經典記憶口訣）</span>
            <span>「橫戌點戍戊中空，十字交叉便是戎」等會考必考口訣</span>
          </div>

          <div className="space-y-4">
            {filteredFocus3.map((group) => {
              const isFav = favorites.includes(group.id);
              const isMast = mastered.includes(group.id);

              return (
                <div
                  key={group.id}
                  className="bg-white rounded-2xl p-5 border border-stone-200 hover:border-amber-400 transition shadow-xs"
                >
                  {/* Mnemonic Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
                        {group.number}
                      </span>
                      {group.mnemonic && (
                        <div className="px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-sm sm:text-base font-serif-tc flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>口訣：『{group.mnemonic}』</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 self-end sm:self-auto">
                      <button
                        onClick={() => onToggleFavorite(group.id)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          isFav ? 'text-amber-500' : 'text-stone-300 hover:text-stone-500'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                      </button>
                      <button
                        onClick={() => onToggleMastered(group.id)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          isMast ? 'text-emerald-600' : 'text-stone-300 hover:text-stone-500'
                        }`}
                      >
                        <CheckCircle className={`w-4 h-4 ${isMast ? 'fill-emerald-100' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Entries Grid */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {group.entries.map((entry, idx) => (
                      <div
                        key={idx}
                        className="bg-stone-50 rounded-xl p-3 border border-stone-100 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="text-2xl font-bold font-serif-tc text-stone-900 bg-white px-2.5 py-0.5 rounded-lg border border-stone-200 shadow-xs">
                              {entry.char}
                            </span>
                            <span className="text-xs font-bold font-serif-tc px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                              {entry.zhuyin}
                            </span>
                            <button
                              onClick={() => speakText(`${entry.char}，${entry.example}`)}
                              className="text-stone-400 hover:text-stone-600 cursor-pointer p-1"
                              title="朗讀"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-xs text-stone-700 mt-2">
                            <div className="font-semibold text-stone-500">字義辨析：</div>
                            <p className="mt-0.5 leading-relaxed">{entry.meaning}</p>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-stone-200/60 text-xs text-stone-800">
                          <span className="font-semibold text-stone-500">詞例：</span>
                          <span className="font-medium text-amber-900">{entry.example}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 4 CONTENT: FOCUS 4 IDIOMS PHONETICS */}
      {activeSection === 'focus4' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 px-1">
            <span>收錄 {filteredFocus4.length} 個常考成語易誤讀字音精選</span>
            <span>圖窮匕現、剛愎自用、暴虎馮河、否極泰來、沆瀣一氣...</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredFocus4.map((item) => {
              const isFav = favorites.includes(item.id);
              const isMast = mastered.includes(item.id);
              const itemRev = revealedItems[item.id] || {};
              const showZhu = !maskZhuyin || itemRev.zhuyin;
              const showMean = !maskMeaning || itemRev.meaning;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-stone-200 hover:border-amber-400 transition shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-lg font-bold text-stone-900 font-serif-tc tracking-wide">
                          {item.phrase}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-stone-500">
                            「{item.targetChar}」讀音：
                          </span>
                          {showZhu ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 font-serif-tc">
                              {item.zhuyin}
                            </span>
                          ) : (
                            <button
                              onClick={() => toggleReveal(item.id, 'zhuyin')}
                              className="text-xs font-bold text-stone-500 bg-stone-200 px-2 py-0.5 rounded cursor-pointer"
                            >
                              [注音遮蔽]
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => speakText(item.phrase)}
                          className="p-1.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                          title="朗讀成語"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onToggleFavorite(item.id)}
                          className={`p-1.5 cursor-pointer ${isFav ? 'text-amber-500' : 'text-stone-300 hover:text-stone-500'}`}
                        >
                          <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                        </button>
                        <button
                          onClick={() => onToggleMastered(item.id)}
                          className={`p-1.5 cursor-pointer ${isMast ? 'text-emerald-600' : 'text-stone-300 hover:text-stone-500'}`}
                        >
                          <CheckCircle className={`w-4 h-4 ${isMast ? 'fill-emerald-100' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {item.explanation && (
                      <div className="mt-3 text-xs text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-100 leading-relaxed">
                        <div className="font-semibold text-stone-500 mb-0.5">釋義：</div>
                        {showMean ? (
                          <p>{item.explanation}</p>
                        ) : (
                          <button
                            onClick={() => toggleReveal(item.id, 'meaning')}
                            className="text-stone-500 italic hover:text-amber-700 cursor-pointer"
                          >
                            [釋義已遮蔽，點擊顯示]
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                    <span>聲母：{item.category}</span>
                    <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                      常誤讀成語
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 5 CONTENT: FOCUS 5 FOOD PHONETICS */}
      {activeSection === 'focus5' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-stone-700 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white font-bold flex items-center justify-center shrink-0">
              食
            </div>
            <div>
              <div className="font-bold text-amber-950 text-sm">焦點五：日常生活美食料理常誤讀字音</div>
              <p className="mt-0.5 text-stone-600">
                P.172 下半部特別收錄：汆燙、骰子牛、牛腱、味噌、蛤蜊、荸薺等大考極易誤讀的生活料理讀音！
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredFocus5.map((item) => {
              const isFav = favorites.includes(item.id);
              const isMast = mastered.includes(item.id);
              const itemRev = revealedItems[item.id] || {};
              const showZhu = !maskZhuyin || itemRev.zhuyin;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-stone-200 hover:border-amber-400 transition shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 font-bold text-xs flex items-center justify-center">
                          {item.number}
                        </span>
                        <div className="text-lg font-bold font-serif-tc text-stone-900">
                          {item.foodName}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => speakText(item.foodName)}
                          className="p-1.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                          title="朗讀"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onToggleFavorite(item.id)}
                          className={`p-1.5 cursor-pointer ${isFav ? 'text-amber-500' : 'text-stone-300 hover:text-stone-500'}`}
                        >
                          <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                        </button>
                        <button
                          onClick={() => onToggleMastered(item.id)}
                          className={`p-1.5 cursor-pointer ${isMast ? 'text-emerald-600' : 'text-stone-300 hover:text-stone-500'}`}
                        >
                          <CheckCircle className={`w-4 h-4 ${isMast ? 'fill-emerald-100' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Phonetics box */}
                    <div className="mt-2.5 p-2.5 bg-amber-50/70 border border-amber-200/70 rounded-xl flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-600">
                        「{item.targetChar}」字審定音：
                      </span>
                      {showZhu ? (
                        <span className="text-base font-extrabold text-amber-900 font-serif-tc">
                          {item.zhuyin}
                        </span>
                      ) : (
                        <button
                          onClick={() => toggleReveal(item.id, 'zhuyin')}
                          className="text-xs font-bold text-stone-500 bg-stone-200 px-2 py-0.5 rounded cursor-pointer"
                        >
                          [點擊查看]
                        </button>
                      )}
                    </div>

                    {/* Note & Trap */}
                    {item.note && (
                      <div className="mt-2 text-xs text-stone-600 leading-relaxed bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                        {item.note}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                    <span>全詞讀音：{item.fullZhuyin || item.zhuyin}</span>
                    <button
                      onClick={() => onStartCustomQuiz('food_phonetic', item.id)}
                      className="text-amber-700 hover:text-amber-900 font-bold cursor-pointer"
                    >
                      測驗此道料理 →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 6 CONTENT: FOCUS 6 POLYPHONIC WORDS */}
      {activeSection === 'focus6' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-stone-700 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white font-bold flex items-center justify-center shrink-0">
              音
            </div>
            <div>
              <div className="font-bold text-amber-950 text-sm">焦點六：會考一字多音（破音審定字）大統整</div>
              <p className="mt-0.5 text-stone-600">
                P.173~P.178 完整收錄：咽、乘、創、差、冠、扁、荷、哄、省、塞、著、艾等歷屆會考基測高頻考點！
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFocus6.map((item) => {
              const isFav = favorites.includes(item.id);
              const isMast = mastered.includes(item.id);
              const itemRev = revealedItems[item.id] || {};
              const showZhu = !maskZhuyin || itemRev.zhuyin;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 hover:border-amber-400 transition shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-2xl font-black font-serif-tc text-amber-900 shadow-inner">
                          {item.char}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base text-stone-900 font-serif-tc">
                              「{item.char}」字多音解析
                            </span>
                            {item.isFrequent && (
                              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                <Sparkles className="w-3 h-3" /> 常考
                              </span>
                            )}
                          </div>
                          {item.mnemonic && (
                            <p className="text-xs text-amber-800/90 font-medium mt-0.5">
                              {item.mnemonic}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => speakText(item.char)}
                          className="p-1.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                          title="朗讀"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onToggleFavorite(item.id)}
                          className={`p-1.5 cursor-pointer ${isFav ? 'text-amber-500' : 'text-stone-300 hover:text-stone-500'}`}
                        >
                          <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                        </button>
                        <button
                          onClick={() => onToggleMastered(item.id)}
                          className={`p-1.5 cursor-pointer ${isMast ? 'text-emerald-600' : 'text-stone-300 hover:text-stone-500'}`}
                        >
                          <CheckCircle className={`w-4 h-4 ${isMast ? 'fill-emerald-100' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Readings list */}
                    <div className="mt-3.5 space-y-2.5">
                      {item.readings.map((r, rIdx) => (
                        <div
                          key={rIdx}
                          className="bg-stone-50/80 rounded-xl p-3 border border-stone-100 flex flex-col gap-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {showZhu ? (
                                <span className="text-sm font-extrabold text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded-lg font-serif-tc shadow-xs">
                                  {r.zhuyin}
                                </span>
                              ) : (
                                <button
                                  onClick={() => toggleReveal(item.id, 'zhuyin')}
                                  className="text-xs font-bold text-stone-500 bg-stone-200 px-2 py-0.5 rounded cursor-pointer"
                                >
                                  [點擊揭示讀音]
                                </button>
                              )}
                              <span className="text-xs text-stone-500 font-medium">
                                {r.meaning}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {r.examples.map((ex, exIdx) => (
                              <span
                                key={exIdx}
                                className="bg-white border border-stone-200 text-stone-800 text-xs font-semibold px-2 py-0.5 rounded-md"
                              >
                                {ex}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                    <span>共有 {item.readings.length} 種讀音</span>
                    <button
                      onClick={() => onStartCustomQuiz('polyphonic_choice', item.id)}
                      className="text-amber-700 hover:text-amber-900 font-bold cursor-pointer"
                    >
                      測驗此字破音 →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 7 CONTENT: FOCUS 7 LIFE PHONETICS */}
      {activeSection === 'focus7' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-stone-700 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white font-bold flex items-center justify-center shrink-0">
              常
            </div>
            <div>
              <div className="font-bold text-amber-950 text-sm">焦點七：日常生活與專有名詞易錯讀音</div>
              <p className="mt-0.5 text-stone-600">
                收錄龜裂、莘莘學子、狡黠、呼天搶地、枵腹從公、心寬體胖、吐蕃、龜茲、齲齒等常考陷阱！
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredFocus7.map((item) => {
              const isFav = favorites.includes(item.id);
              const isMast = mastered.includes(item.id);
              const itemRev = revealedItems[item.id] || {};
              const showZhu = !maskZhuyin || itemRev.zhuyin;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-stone-200 hover:border-amber-400 transition shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-lg font-bold font-serif-tc text-stone-900">
                        {item.phrase}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => speakText(item.phrase)}
                          className="p-1.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                          title="朗讀"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onToggleFavorite(item.id)}
                          className={`p-1.5 cursor-pointer ${isFav ? 'text-amber-500' : 'text-stone-300 hover:text-stone-500'}`}
                        >
                          <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                        </button>
                        <button
                          onClick={() => onToggleMastered(item.id)}
                          className={`p-1.5 cursor-pointer ${isMast ? 'text-emerald-600' : 'text-stone-300 hover:text-stone-500'}`}
                        >
                          <CheckCircle className={`w-4 h-4 ${isMast ? 'fill-emerald-100' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Phonetics box */}
                    <div className="mt-2.5 p-2.5 bg-amber-50/70 border border-amber-200/70 rounded-xl flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-600">
                        「{item.targetChar}」字審定音：
                      </span>
                      {showZhu ? (
                        <span className="text-base font-extrabold text-amber-900 font-serif-tc">
                          {item.zhuyin}
                        </span>
                      ) : (
                        <button
                          onClick={() => toggleReveal(item.id, 'zhuyin')}
                          className="text-xs font-bold text-stone-500 bg-stone-200 px-2 py-0.5 rounded cursor-pointer"
                        >
                          [點擊查看]
                        </button>
                      )}
                    </div>

                    {/* Note & Trap */}
                    {item.note && (
                      <div className="mt-2 text-xs text-stone-600 leading-relaxed bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                        {item.note}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                    <span className="capitalize">分類：{item.category === 'daily' ? '生活語詞' : item.category === 'proper_noun' ? '地名專名' : item.category === 'medical' ? '醫學人體' : '自然天文'}</span>
                    <button
                      onClick={() => onStartCustomQuiz('zhuyin_choice', item.id)}
                      className="text-amber-700 hover:text-amber-900 font-bold cursor-pointer"
                    >
                      測驗此詞讀音 →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FOCUS 8: Classical particles & polysemy */}
      {activeSection === 'focus8' && (
        <div className="space-y-4">
          <div className="bg-amber-100/60 border border-amber-200 rounded-2xl p-4 text-xs flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-amber-800 shrink-0" />
            <div>
              <div className="font-bold text-amber-950 text-sm">焦點八：文言常考虛詞與一字多義</div>
              <p className="mt-0.5 text-stone-600">
                收錄國中會考核心虛詞：而、之、以、於、其、為、乃、與。包含詞性、義項辨析、課文經典例句與記憶口訣！
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFocus8.map((item) => {
              const isFav = favorites.includes(item.id);
              const isMast = mastered.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-5 border transition shadow-xs flex flex-col justify-between ${
                    isMast ? 'border-emerald-200 bg-emerald-50/20' : 'border-stone-200 hover:border-amber-400'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-700 text-white flex items-center justify-center text-2xl font-bold font-serif-tc shadow-sm">
                          {item.char}
                        </div>
                        <div>
                          <div className="text-base font-bold text-stone-900 font-serif-tc flex items-center gap-2">
                            <span>文言虛詞「{item.char}」</span>
                            {item.isFrequent && (
                              <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                                ⭐ 會考高頻
                              </span>
                            )}
                          </div>
                          {item.mnemonic && (
                            <div className="text-xs text-amber-800 font-serif-tc mt-0.5">
                              💡 {item.mnemonic}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => speakText(`文言虛詞，${item.char}`)}
                          className="p-1.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                          title="朗讀"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onToggleFavorite(item.id)}
                          className={`p-1.5 cursor-pointer ${isFav ? 'text-amber-500' : 'text-stone-300 hover:text-stone-500'}`}
                        >
                          <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                        </button>
                        <button
                          onClick={() => onToggleMastered(item.id)}
                          className={`p-1.5 cursor-pointer ${isMast ? 'text-emerald-600' : 'text-stone-300 hover:text-stone-500'}`}
                        >
                          <CheckCircle className={`w-4 h-4 ${isMast ? 'fill-emerald-100' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Usages list */}
                    <div className="mt-4 space-y-3">
                      {item.usages.map((usage, uIdx) => (
                        <div
                          key={uIdx}
                          className="bg-stone-50/80 rounded-xl p-3 border border-stone-200/80 hover:bg-amber-50/40 transition"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                              {uIdx + 1}
                            </span>
                            <span className="text-xs font-bold text-stone-900">
                              {usage.meaning}
                            </span>
                          </div>

                          {usage.explanation && (
                            <p className="text-[11px] text-stone-500 mt-1 pl-7">
                              {usage.explanation}
                            </p>
                          )}

                          <div className="mt-2 pl-7 space-y-1">
                            {usage.examples.map((ex, exIdx) => (
                              <div key={exIdx} className="text-xs text-stone-800 font-serif-tc flex items-start gap-1">
                                <span className="text-amber-600 font-sans">▪</span>
                                <span>{ex}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                    <span>收錄 {item.usages.length} 種義項詞性</span>
                    <button
                      onClick={() => onStartCustomQuiz('classical_choice', item.id)}
                      className="text-amber-700 hover:text-amber-900 font-bold cursor-pointer"
                    >
                      測驗此字虛詞用法 →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FOCUS 9: Loan Words */}
      {activeSection === 'focus9' && (
        <div className="space-y-4">
          <div className="bg-amber-100/60 border border-amber-200 rounded-2xl p-4 text-xs flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-800 shrink-0" />
            <div>
              <div className="font-bold text-amber-950 text-sm">焦點九：國中會考重要通假字全彙整</div>
              <p className="mt-0.5 text-stone-600">
                收錄會考高頻通假字：說/悅、蚤/早、誌/志、誓/逝、女/汝、被/披、錯/措、屬/囑、具/俱、亡/無、直/值等，考點全掌握！
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredFocus9.map((item) => {
              const isFav = favorites.includes(item.id);
              const isMast = mastered.includes(item.id);
              const itemRev = revealedItems[item.id] || {};
              const showCharReveal = !maskChar || itemRev.char;
              const showZhuReveal = !maskZhuyin || itemRev.zhuyin;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-4 border transition shadow-xs flex flex-col justify-between ${
                    isMast ? 'border-emerald-200 bg-emerald-50/20' : 'border-stone-200 hover:border-amber-400'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-extrabold font-serif-tc text-stone-900">
                          「{item.originalChar}」
                        </span>
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          通
                        </span>
                        {showCharReveal ? (
                          <span className="text-xl font-extrabold font-serif-tc text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-lg border border-amber-300">
                            「{item.targetChar}」
                          </span>
                        ) : (
                          <button
                            onClick={() => toggleReveal(item.id, 'char')}
                            className="text-xs font-bold bg-stone-900 text-amber-300 px-2 py-1 rounded cursor-pointer hover:bg-stone-800"
                          >
                            [點擊查看通字]
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => speakText(`${item.originalChar}，通${item.targetChar}，讀作${item.zhuyin}`)}
                          className="p-1.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                          title="朗讀"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onToggleFavorite(item.id)}
                          className={`p-1.5 cursor-pointer ${isFav ? 'text-amber-500' : 'text-stone-300 hover:text-stone-500'}`}
                        >
                          <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                        </button>
                        <button
                          onClick={() => onToggleMastered(item.id)}
                          className={`p-1.5 cursor-pointer ${isMast ? 'text-emerald-600' : 'text-stone-300 hover:text-stone-500'}`}
                        >
                          <CheckCircle className={`w-4 h-4 ${isMast ? 'fill-emerald-100' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Zhuyin & Meaning */}
                    <div className="mt-3 p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/60 flex items-center justify-between">
                      <div className="text-xs font-bold text-stone-700">
                        審定讀音：
                        {showZhuReveal ? (
                          <span className="text-sm font-extrabold text-amber-900 font-serif-tc ml-1">
                            【{item.zhuyin}】
                          </span>
                        ) : (
                          <button
                            onClick={() => toggleReveal(item.id, 'zhuyin')}
                            className="text-xs font-bold bg-stone-200 px-2 py-0.5 rounded cursor-pointer ml-1"
                          >
                            [看讀音]
                          </button>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200">
                        {item.source}
                      </span>
                    </div>

                    {/* Definition */}
                    <div className="mt-2.5 text-xs text-stone-700 leading-relaxed bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      <span className="font-bold text-stone-900">釋義：</span>
                      {item.meaning}
                    </div>

                    {/* Example sentence */}
                    <div className="mt-2.5 space-y-1">
                      <div className="text-[11px] font-bold text-stone-500">典籍例句：</div>
                      {item.examples.map((ex, exIdx) => (
                        <div key={exIdx} className="text-xs font-serif-tc text-stone-900 bg-amber-50/30 p-2 rounded-lg border border-amber-100/50">
                          {ex}
                        </div>
                      ))}
                    </div>

                    {item.note && (
                      <div className="mt-2 text-[11px] text-amber-800 bg-amber-50/50 p-2 rounded-lg">
                        📌 {item.note}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                    <span>會考通假字精選</span>
                    <button
                      onClick={() => onStartCustomQuiz('classical_choice', item.id)}
                      className="text-amber-700 hover:text-amber-900 font-bold cursor-pointer"
                    >
                      測驗此通假字 →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
