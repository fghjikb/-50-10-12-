import React, { useRef, useState, useEffect, useCallback } from 'react';
import { RotateCcw, Undo2, Check, Sparkles, Eye, EyeOff, PenTool } from 'lucide-react';

interface HandwritingCanvasProps {
  targetChar?: string;
  expectedAnswer?: string;
  onSubmit?: (writtenCharOrData?: string) => void;
  onConfirm?: () => void;
  charPrompt?: string;
  disabled?: boolean;
}

export const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({
  targetChar = '',
  expectedAnswer = '',
  onSubmit,
  onConfirm,
  charPrompt,
  disabled = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasStrokes, setHasStrokes] = useState<boolean>(false);
  const [showHintGhost, setShowHintGhost] = useState<boolean>(false);
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);

  const displayChar = targetChar || (expectedAnswer ? expectedAnswer[0] : '');

  // Setup canvas with high DPI and redraw background
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    // Background
    ctx.fillStyle = '#fffdfa';
    ctx.fillRect(0, 0, width, height);

    // Outer border (Traditional red Tian-Zi-Ge)
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, width - 8, height - 8);

    // Inner dashed cross lines
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);

    // Horizontal center line
    ctx.beginPath();
    ctx.moveTo(4, height / 2);
    ctx.lineTo(width - 4, height / 2);
    ctx.stroke();

    // Vertical center line
    ctx.beginPath();
    ctx.moveTo(width / 2, 4);
    ctx.lineTo(width / 2, height - 4);
    ctx.stroke();

    ctx.restore();
  }, []);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width || 280;
    const height = rect.height || 280;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.scale(dpr, dpr);
    drawGrid(ctx, width, height);
    setStrokeHistory([]);
    setHasStrokes(false);
  }, [drawGrid]);

  useEffect(() => {
    initCanvas();
  }, [initCanvas, displayChar]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      initCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvas]);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setStrokeHistory((prev) => [...prev.slice(-15), imgData]);
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveState();

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setHasStrokes(true);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#1c1917'; // Rich traditional Chinese ink
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.closePath();
    ctx.restore();
    setIsDrawing(false);
  };

  const handleClear = () => {
    if (disabled) return;
    initCanvas();
  };

  const handleUndo = () => {
    if (disabled || strokeHistory.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nextHistory = [...strokeHistory];
    const previousState = nextHistory.pop();
    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
      setStrokeHistory(nextHistory);
      if (nextHistory.length === 0) {
        setHasStrokes(false);
      }
    }
  };

  const handleSubmit = () => {
    if (disabled || !hasStrokes) return;
    if (onConfirm) {
      onConfirm();
    }
    if (onSubmit) {
      onSubmit(displayChar);
    }
  };

  return (
    <div className="w-full bg-amber-50/40 rounded-2xl p-4 sm:p-5 border border-amber-200/80 shadow-inner flex flex-col items-center select-none animate-fade-in">
      {/* Title & Controls Bar */}
      <div className="w-full flex items-center justify-between mb-3 pb-2 border-b border-amber-200/60">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-amber-700 text-white">
            <PenTool className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-stone-800">田字格手寫作答板</span>
            <span className="hidden sm:inline-block ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold border border-amber-300">
              支援滑鼠／觸控筆書寫
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowHintGhost(!showHintGhost)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 border ${
              showHintGhost
                ? 'bg-amber-200/80 border-amber-400 text-amber-950'
                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
            title="開關微透字形描摹提示"
          >
            {showHintGhost ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{showHintGhost ? '隱藏描摹' : '透視描摹'}</span>
          </button>
        </div>
      </div>

      {/* The Tian-Zi-Ge Canvas Container */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-1 touch-none shadow-md rounded-xl overflow-hidden border-2 border-red-600 bg-[#fffdfa]">
        {/* Optional Ghost/Trace Character for Practice */}
        {showHintGhost && displayChar && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
            <span className="font-serif-tc text-[150px] sm:text-[170px] text-red-200/50 font-black leading-none">
              {displayChar}
            </span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          onPointerCancel={stopDrawing}
          className="w-full h-full cursor-crosshair relative z-10"
          style={{ touchAction: 'none' }}
        />
      </div>

      <p className="text-[11px] text-stone-500 text-center mt-2">
        請在上方紅線田字格中親手書寫正確國字，加深筆順與字形記憶。
      </p>

      {/* Action Buttons */}
      <div className="w-full max-w-xs flex items-center justify-between gap-2 mt-3 pt-2">
        <button
          type="button"
          disabled={disabled || !hasStrokes}
          onClick={handleUndo}
          className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-stone-100 disabled:opacity-40 text-stone-700 text-xs font-bold border border-stone-300 transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span>上一步</span>
        </button>

        <button
          type="button"
          disabled={disabled || !hasStrokes}
          onClick={handleClear}
          className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-rose-50 disabled:opacity-40 text-rose-700 text-xs font-bold border border-rose-200 transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>重寫清空</span>
        </button>

        <button
          type="button"
          disabled={disabled || !hasStrokes}
          onClick={handleSubmit}
          className="flex-1 py-2 px-3 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:bg-stone-300 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 shadow-sm"
        >
          <Check className="w-3.5 h-3.5" />
          <span>完成送出</span>
        </button>
      </div>
    </div>
  );
};
