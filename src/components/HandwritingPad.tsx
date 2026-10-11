import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, PenTool, Send, Check, X, Sparkles } from 'lucide-react';

interface HandwritingPadProps {
  correctAnswer: string;
  isAnswered: boolean;
  selectedOption: string | null;
  onSubmitAnswer: (answer: string, isCorrectOverride?: boolean) => void;
  onOverrideGrade?: (isCorrect: boolean) => void;
  onSwitchToChoiceMode: () => void;
}

const ZHUYIN_KEYS = [
  'ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ',
  'ㄍ', 'ㄎ', 'ㄏ', 'ㄐ', 'ㄑ', 'ㄒ', 'ㄓ', 'ㄔ',
  'ㄕ', 'ㄖ', 'ㄗ', 'ㄘ', 'ㄙ', 'ㄧ', 'ㄨ', 'ㄩ',
  'ㄚ', 'ㄛ', 'ㄜ', 'ㄝ', 'ㄞ', 'ㄟ', 'ㄠ', 'ㄡ',
  'ㄢ', 'ㄣ', 'ㄤ', 'ㄥ', 'ㄦ', 'ˊ', 'ˇ', 'ˋ', '˙',
];

export const HandwritingPad: React.FC<HandwritingPadProps> = ({
  correctAnswer,
  isAnswered,
  selectedOption,
  onSubmitAnswer,
  onOverrideGrade,
  onSwitchToChoiceMode,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [showCanvas, setShowCanvas] = useState<boolean>(true);
  const [showZhuyinKeys, setShowZhuyinKeys] = useState<boolean>(false);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize and redraw Mizige background on canvas
  const drawMizige = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Warm rice paper background
    ctx.fillStyle = '#fffdfa';
    ctx.fillRect(0, 0, width, height);

    // Outer border
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, width - 8, height - 8);

    // Grid lines (faint dashed lines)
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 1;

    // Horizontal & vertical center lines
    ctx.moveTo(4, height / 2);
    ctx.lineTo(width - 4, height / 2);
    ctx.moveTo(width / 2, 4);
    ctx.lineTo(width / 2, height - 4);

    // Diagonal cross lines
    ctx.moveTo(4, 4);
    ctx.lineTo(width - 4, height - 4);
    ctx.moveTo(width - 4, 4);
    ctx.lineTo(4, height - 4);

    ctx.stroke();
    ctx.setLineDash([]); // Reset dashed line
  };

  // Reset or initialize canvas when question changes
  useEffect(() => {
    setInputText('');
    setHasDrawn(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const displayWidth = rect.width || 240;
    const displayHeight = rect.height || 240;

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    ctx.scale(dpr, dpr);

    drawMizige(ctx, displayWidth, displayHeight);
  }, [correctAnswer]);

  // Clear drawing
  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    drawMizige(ctx, rect.width, rect.height);
    setHasDrawn(false);
  };

  // Get pointer coordinates relative to canvas
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else if ('clientX' in e) {
      return {
        x: (e as React.MouseEvent).clientX - rect.left,
        y: (e as React.MouseEvent).clientY - rect.top,
      };
    }
    return { x: 0, y: 0 };
  };

  // Drawing mouse/touch handlers
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (isAnswered) return;
    if ('touches' in e) {
      // Prevent screen scroll while drawing on mobile
      e.stopPropagation();
    }
    isDrawingRef.current = true;
    lastPosRef.current = getCoordinates(e);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current || isAnswered) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if ('touches' in e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const currentPos = getCoordinates(e);
    const lastPos = lastPosRef.current;

    if (lastPos) {
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.strokeStyle = '#1c1917'; // Ink color
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    lastPosRef.current = currentPos;
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  // Check answers
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnswered) return;

    const trimmed = inputText.trim();
    const finalAnswer = trimmed || (hasDrawn ? '（手寫板作答）' : '');

    if (!finalAnswer) {
      // If nothing entered or drawn, prompt user
      return;
    }

    // Auto check logic:
    // Normalize string: remove spaces and compare
    const normUser = trimmed.replace(/\s+/g, '').toLowerCase();
    const normCorrect = correctAnswer.replace(/\s+/g, '').toLowerCase();

    const isMatch =
      normUser.length > 0 &&
      (normUser === normCorrect ||
        normCorrect.includes(normUser) ||
        normUser.includes(normCorrect));

    onSubmitAnswer(finalAnswer, isMatch);
  };

  // Insert Zhuyin symbol
  const handleInsertZhuyin = (char: string) => {
    setInputText((prev) => prev + char);
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Top Banner: Mode indicator and switch */}
      <div className="flex items-center justify-between text-xs text-stone-500 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60">
        <div className="flex items-center gap-1.5 font-bold text-amber-900">
          <PenTool className="w-3.5 h-3.5 text-amber-700" />
          <span>手寫／打字填空模式（用寫的）</span>
        </div>
        <button
          type="button"
          onClick={onSwitchToChoiceMode}
          className="text-stone-600 hover:text-amber-800 underline font-semibold cursor-pointer"
        >
          切換回四選一選項 →
        </button>
      </div>

      {/* Main input and handwriting area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* Left Column: Typing Input & Zhuyin keyboard */}
        <div className="space-y-3">
          <form onSubmit={handleSubmit} className="space-y-2">
            <label className="text-xs font-bold text-stone-700 block">
              1. 請輸入您的答案：
            </label>
            <div className="relative">
              <input
                type="text"
                disabled={isAnswered}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="在此輸入國字或注音..."
                className="w-full px-4 py-3 text-lg font-bold font-serif-tc bg-white border-2 border-stone-300 rounded-2xl focus:border-amber-600 focus:outline-none shadow-xs disabled:bg-stone-100 disabled:text-stone-500"
                autoFocus
              />
              {inputText && !isAnswered && (
                <button
                  type="button"
                  onClick={() => setInputText('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick buttons */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowZhuyinKeys(!showZhuyinKeys)}
                className="text-xs font-semibold text-amber-800 bg-amber-100/70 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 cursor-pointer transition"
              >
                {showZhuyinKeys ? '收起注音小鍵盤 ▲' : '注音符號小鍵盤 ▼'}
              </button>

              {!isAnswered && (
                <button
                  type="submit"
                  disabled={!inputText.trim() && !hasDrawn}
                  className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:bg-stone-300 text-white font-bold text-sm shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  確認送出
                </button>
              )}
            </div>
          </form>

          {/* Quick Zhuyin Keypad */}
          {showZhuyinKeys && !isAnswered && (
            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 space-y-1.5 animate-fadeIn">
              <div className="text-[11px] font-bold text-stone-500">
                點擊符號快速輸入注音與聲調：
              </div>
              <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto">
                {ZHUYIN_KEYS.map((char) => (
                  <button
                    key={char}
                    type="button"
                    onClick={() => handleInsertZhuyin(char)}
                    className="w-7 h-7 bg-white hover:bg-amber-100 border border-stone-200 rounded text-xs font-bold text-stone-800 flex items-center justify-center font-serif-tc cursor-pointer shadow-2xs transition"
                  >
                    {char}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Mizige Handwriting Canvas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <span>2. 米字格手寫臨摹板</span>
              <span className="text-[11px] text-stone-400 font-normal">（可用滑鼠或手指書寫）</span>
            </label>
            {!isAnswered && hasDrawn && (
              <button
                type="button"
                onClick={handleClearCanvas}
                className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                清除
              </button>
            )}
          </div>

          <div className="flex flex-col items-center justify-center p-3 bg-stone-100 rounded-2xl border border-stone-200">
            <div className="relative rounded-xl overflow-hidden border-2 border-stone-300 shadow-inner bg-[#fffdfa] touch-none">
              <canvas
                ref={canvasRef}
                style={{ width: 220, height: 220 }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="cursor-crosshair"
              />
            </div>
            <div className="mt-2 text-[11px] text-stone-400">
              提示：在九宮米字格中手寫筆劃，再點擊送出作答
            </div>
          </div>
        </div>
      </div>

      {/* Answer feedback and manual verification card */}
      {isAnswered && (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2">
            <div>
              <span className="text-xs font-bold text-stone-500">您的作答：</span>
              <span className="text-base font-extrabold text-stone-900 font-serif-tc ml-1">
                {selectedOption || '（手寫板作答）'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-stone-500">正確答案：</span>
              <span className="text-lg font-black text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-lg font-serif-tc border border-amber-300">
                {correctAnswer}
              </span>
            </div>
          </div>

          {/* Self-check verification buttons for handwriting */}
          {onOverrideGrade && (
            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-stone-200">
              <div className="text-xs text-stone-600">
                <span className="font-bold">比對您的手寫字：</span>
                您寫的與正確答案相符嗎？
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOverrideGrade(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  我寫對了 (+1分)
                </button>
                <button
                  type="button"
                  onClick={() => onOverrideGrade(false)}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition"
                >
                  <X className="w-3.5 h-3.5" />
                  我寫錯了
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
