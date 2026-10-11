import React from 'react';
import {
  Bookmark,
  Trash2,
  CheckCircle,
  HelpCircle,
  Volume2,
} from 'lucide-react';
import { MistakeRecord } from '../utils/storage';
import { speakText } from '../utils/speech';

interface MistakesModeProps {
  mistakes: MistakeRecord[];
  onRemoveMistake: (id: string) => void;
  onClearMistakes: () => void;
  onStartQuiz: () => void;
}

export const MistakesMode: React.FC<MistakesModeProps> = ({
  mistakes,
  onRemoveMistake,
  onClearMistakes,
  onStartQuiz,
}) => {
  if (mistakes.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-stone-900">
          太棒了！目前沒有任何錯題記錄
        </h3>
        <p className="text-sm text-stone-500 max-w-sm mx-auto">
          在模擬測驗中答錯的題目會自動歸納收錄於此，助你各個擊破、徹底掌握！
        </p>
        <button
          onClick={onStartQuiz}
          className="mt-4 px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold transition inline-flex items-center gap-2 cursor-pointer shadow-xs text-sm"
        >
          <HelpCircle className="w-4 h-4" />
          <span>立即參加模擬測驗</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              錯題複習筆記本
            </h2>
            <p className="text-xs text-stone-500">
              已累積 {mistakes.length} 道錯題，熟練後可點選「已掌握消除」
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onStartQuiz}
            className="px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>進行模擬測驗</span>
          </button>

          <button
            onClick={onClearMistakes}
            className="px-3 py-2 rounded-xl border border-stone-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-stone-600 text-xs font-medium transition flex items-center gap-1 cursor-pointer"
            title="清空錯題本"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>清空記錄</span>
          </button>
        </div>
      </div>

      {/* List of mistakes */}
      <div className="space-y-3.5">
        {mistakes.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-200 shadow-xs space-y-2.5 relative"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                  {m.category || '易錯重點'}
                </span>
                <div className="mt-1.5 text-base sm:text-lg font-bold text-stone-900 font-serif-tc">
                  {m.question}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => speakText(m.question)}
                  className="p-1.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                  title="朗讀"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onRemoveMistake(m.id)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition cursor-pointer flex items-center gap-1"
                  title="我已熟練，移出錯題本"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>已學會</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-rose-700 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200 font-bold">
                曾作答：{m.userAnswer}
              </span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 font-extrabold">
                正確答案：{m.correctAnswer}
              </span>
            </div>

            <div className="mt-2 text-xs text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-100 leading-relaxed">
              <strong className="text-stone-500">解析與釋義：</strong>
              {m.explanation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
