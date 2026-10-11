import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Delete, RotateCcw, Check, Keyboard as KeyboardIcon, Sparkles } from 'lucide-react';
import { FOCUS_2_CONFUSED_WORDS, FOCUS_3_SIMILAR_WORDS } from '../data';

interface CustomQuizKeyboardProps {
  mode: 'char' | 'zhuyin';
  targetChar?: string;
  expectedAnswer?: string;
  currentInput: string;
  onInputChange: (newVal: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

// 37 Standard Zhuyin symbols
const ZHUYIN_CONSONANTS = ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ', 'ㄍ', 'ㄎ', 'ㄏ', 'ㄐ', 'ㄑ', 'ㄒ', 'ㄓ', 'ㄔ', 'ㄕ', 'ㄖ', 'ㄗ', 'ㄘ', 'ㄙ'];
const ZHUYIN_MEDIALS = ['ㄧ', 'ㄨ', 'ㄩ'];
const ZHUYIN_RHYMES = ['ㄚ', 'ㄛ', 'ㄜ', 'ㄝ', 'ㄞ', 'ㄟ', 'ㄠ', 'ㄡ', 'ㄢ', 'ㄣ', 'ㄤ', 'ㄥ', 'ㄦ'];
const ZHUYIN_TONES = [
  { label: '一聲 (無調)', value: '' },
  { label: '二聲 ˊ', value: 'ˊ' },
  { label: '三聲 ˇ', value: 'ˇ' },
  { label: '四聲 ˋ', value: 'ˋ' },
  { label: '輕聲 ˙', value: '˙' },
];

// Common high-frequency distractor characters in Chinese entrance exams
const COMMON_DISTRACTOR_CHARS = [
  '抱', '暴', '報', '豹', '鮑', '瀑', '爆', '跋', '拔', '撥', '駁', '波', '婆', '坡', '破',
  '璧', '壁', '碧', '避', '闢', '僻', '癖', '卑', '埤', '脾', '牌', '俾', '婢', '稗',
  '部', '步', '簿', '佈', '捕', '哺', '埔', '溥', '補', '樸', '僕', '撲', '璞', '噗',
  '幅', '輻', '蝠', '福', '富', '副', '符', '付', '附', '府', '俯', '撫', '腑', '腐', '負',
  '度', '渡', '鍍', '踱', '鐸', '惰', '墮', '舵', '妥', '橢', '唾', '拓', '魄', '落',
  '戊', '戌', '戍', '戎', '戒', '式', '貳', '戈', '弋', '矛', '戔', '或', '咸', '戚', '截',
  '蜜', '密', '秘', '冪', '謐', '灸', '炙', '災', '炎', '疚', '咎', '究', '糾', '赳',
  '汆', '水', '油', '炸', '烹', '煮', '蒸', '燉', '燜', '燴', '燙', '膾',
  '板', '版', '闆', '反', '飯', '返', '扳', '阪', '坂', '販', '叛', '伴', '拌', '絆',
];

export const CustomQuizKeyboard: React.FC<CustomQuizKeyboardProps> = ({
  mode: initialMode,
  targetChar = '',
  expectedAnswer = '',
  currentInput,
  onInputChange,
  onSubmit,
  disabled = false,
}) => {
  const [activeTab, setActiveTab] = useState<'char' | 'zhuyin'>(initialMode);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Sync tab with initial mode when question changes
  useEffect(() => {
    setActiveTab(initialMode);
  }, [initialMode, targetChar, expectedAnswer]);

  // Generate randomized character pool containing targetChar + realistic distractors
  const charPool = useMemo(() => {
    const chars = new Set<string>();

    // 1. Add target character and expected answer characters
    if (targetChar) chars.add(targetChar);
    if (expectedAnswer) {
      for (const c of expectedAnswer) {
        if (/[\u4e00-\u9fa5]/.test(c)) chars.add(c);
      }
    }

    // 2. Add characters from confused and similar words data
    const relatedFromConfused = FOCUS_2_CONFUSED_WORDS
      .filter((w) => w.chars.some((c) => c === targetChar || targetChar.includes(c)))
      .flatMap((w) => w.chars);
    relatedFromConfused.forEach((c) => chars.add(c));

    const relatedFromSimilar = FOCUS_3_SIMILAR_WORDS
      .filter((g) => g.entries.some((item) => item.char === targetChar))
      .flatMap((g) => g.entries.map((item) => item.char));
    relatedFromSimilar.forEach((c) => chars.add(c));

    // 3. Fill up to 18 characters using curated distractors
    const shuffledDistractors = [...COMMON_DISTRACTOR_CHARS].sort(() => Math.random() - 0.5);
    for (const d of shuffledDistractors) {
      if (chars.size >= 18) break;
      chars.add(d);
    }

    // Convert to array and shuffle
    return Array.from(chars).sort(() => Math.random() - 0.5);
  }, [targetChar, expectedAnswer]);

  const handleCharClick = (char: string) => {
    if (disabled) return;
    onInputChange(currentInput + char);
  };

  const handleBackspace = () => {
    if (disabled || currentInput.length === 0) return;
    onInputChange(currentInput.slice(0, -1));
  };

  const handleClear = () => {
    if (disabled) return;
    onInputChange('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentInput.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="w-full bg-stone-100 rounded-2xl p-3 sm:p-4 border border-stone-200 shadow-inner select-none animate-fade-in">
      {/* Keyboard Header / Mode Tabs */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-stone-200">
        <div className="flex items-center gap-1.5">
          <KeyboardIcon className="w-4 h-4 text-amber-700" />
          <span className="text-xs font-bold text-stone-700">自製防猜答虛擬鍵盤</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold border border-amber-200">
            可點擊按鍵或鍵盤直接打字
          </span>
        </div>

        <div className="flex items-center gap-1 bg-stone-200/80 p-0.5 rounded-lg text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('char')}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'char'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>國字矩陣</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('zhuyin')}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'zhuyin'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>注音鍵盤</span>
          </button>
        </div>
      </div>

      {/* Answer Input Box: Both interactive input AND preview */}
      <div className="mb-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-stone-300 shadow-2xs">
        <div className="flex-1 flex items-center gap-2">
          <label htmlFor="quiz-answer-input" className="text-xs font-bold text-stone-500 shrink-0">
            作答輸入：
          </label>
          <input
            id="quiz-answer-input"
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="點選下方按鍵或由鍵盤直接輸入..."
            className="flex-1 py-1.5 px-2 bg-stone-50 hover:bg-white focus:bg-white border border-stone-200 focus:border-amber-600 rounded-lg text-lg font-bold font-serif-tc text-amber-950 tracking-wider outline-hidden transition"
          />
        </div>

        <div className="flex items-center justify-end gap-1.5 shrink-0">
          <button
            type="button"
            disabled={disabled || !currentInput}
            onClick={handleBackspace}
            className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-40 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
            title="倒退刪除"
          >
            <Delete className="w-3.5 h-3.5" />
            <span>倒退</span>
          </button>

          <button
            type="button"
            disabled={disabled || !currentInput}
            onClick={handleClear}
            className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-40 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
            title="清除全部"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>清空</span>
          </button>

          <button
            type="button"
            disabled={disabled || !currentInput.trim()}
            onClick={onSubmit}
            className="px-3.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 disabled:bg-stone-300 text-white font-bold transition cursor-pointer flex items-center gap-1 text-xs shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>送出作答</span>
          </button>
        </div>
      </div>

      {/* 1. HANZI MATRIX KEYBOARD */}
      {activeTab === 'char' && (
        <div className="space-y-2">
          <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5 sm:gap-2">
            {charPool.map((char, idx) => (
              <button
                key={`${char}-${idx}`}
                type="button"
                disabled={disabled}
                onClick={() => handleCharClick(char)}
                className="h-12 sm:h-13 rounded-xl bg-white hover:bg-amber-50 active:bg-amber-200 border border-stone-200 hover:border-amber-400 font-serif-tc font-bold text-xl text-stone-900 shadow-2xs hover:shadow-xs transition transform active:scale-90 cursor-pointer flex items-center justify-center touch-manipulation"
              >
                {char}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-stone-500 text-center pt-1">
            提示：本矩陣混入高頻形近字與同音字，可直接點選或使用電腦／手機鍵盤輸入。
          </p>
        </div>
      )}

      {/* 2. ZHUYIN VIRTUAL KEYBOARD */}
      {activeTab === 'zhuyin' && (
        <div className="space-y-2">
          {/* Consonants */}
          <div className="bg-white p-2 rounded-xl border border-stone-200">
            <div className="text-[10px] font-bold text-stone-400 mb-1">聲母 (21個)</div>
            <div className="grid grid-cols-7 sm:grid-cols-11 gap-1 sm:gap-1.5">
              {ZHUYIN_CONSONANTS.map((zh) => (
                <button
                  key={zh}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleCharClick(zh)}
                  className="h-10 sm:h-11 rounded-lg bg-stone-50 hover:bg-amber-50 active:bg-amber-200 border border-stone-200 font-bold text-base text-stone-800 shadow-2xs transition active:scale-90 cursor-pointer flex items-center justify-center font-serif-tc touch-manipulation"
                >
                  {zh}
                </button>
              ))}
            </div>
          </div>

          {/* Medials and Rhymes */}
          <div className="bg-white p-2 rounded-xl border border-stone-200">
            <div className="text-[10px] font-bold text-stone-400 mb-1">介音與韻母 (16個)</div>
            <div className="grid grid-cols-8 sm:grid-cols-8 gap-1 sm:gap-1.5">
              {[...ZHUYIN_MEDIALS, ...ZHUYIN_RHYMES].map((zh) => (
                <button
                  key={zh}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleCharClick(zh)}
                  className="h-10 sm:h-11 rounded-lg bg-stone-50 hover:bg-amber-50 active:bg-amber-200 border border-stone-200 font-bold text-base text-stone-800 shadow-2xs transition active:scale-90 cursor-pointer flex items-center justify-center font-serif-tc touch-manipulation"
                >
                  {zh}
                </button>
              ))}
            </div>
          </div>

          {/* Tones bar */}
          <div className="bg-white p-2 rounded-xl border border-stone-200 flex items-center justify-between gap-1 flex-wrap">
            <div className="text-[10px] font-bold text-stone-400 w-full sm:w-auto">聲調鍵：</div>
            <div className="grid grid-cols-5 gap-1.5 flex-1">
              {ZHUYIN_TONES.map((tone) => (
                <button
                  key={tone.label}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleCharClick(tone.value)}
                  className="h-10 rounded-lg bg-amber-50 hover:bg-amber-100 active:bg-amber-200 border border-amber-200 font-bold text-xs text-amber-950 shadow-2xs transition active:scale-90 cursor-pointer flex items-center justify-center touch-manipulation"
                >
                  {tone.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
