import React, { useState } from 'react';
import { Printer, X, FileText, CheckSquare } from 'lucide-react';
import {
  FOCUS_1_ERROR_WORDS,
  FOCUS_2_CONFUSED_WORDS,
  FOCUS_3_SIMILAR_WORDS,
  FOCUS_4_IDIOM_PHONETICS,
  FOCUS_5_FOOD_PHONETICS,
} from '../data';

interface PrintSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintSheetModal: React.FC<PrintSheetModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [printMode, setPrintMode] = useState<'study_guide' | 'blank_test'>('blank_test');
  const [selectedInitial, setSelectedInitial] = useState<string>('all');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const errorWords = selectedInitial === 'all'
    ? FOCUS_1_ERROR_WORDS
    : FOCUS_1_ERROR_WORDS.filter((w) => w.category === selectedInitial);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Container */}
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header (hidden in print) */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-700" />
            <h2 className="font-bold text-lg text-stone-900">
              產生列印單 / 挖空練習考卷
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Config (hidden in print) */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-700">模式選擇：</span>
            <button
              onClick={() => setPrintMode('blank_test')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer border ${
                printMode === 'blank_test'
                  ? 'bg-amber-700 text-white border-amber-700'
                  : 'bg-white text-stone-700 border-stone-300'
              }`}
            >
              挖空練習考卷（手寫測驗）
            </button>
            <button
              onClick={() => setPrintMode('study_guide')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer border ${
                printMode === 'study_guide'
                  ? 'bg-amber-700 text-white border-amber-700'
                  : 'bg-white text-stone-700 border-stone-300'
              }`}
            >
              完整複習講義（解答對照）
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>立即列印 (A4)</span>
            </button>
          </div>
        </div>

        {/* Printable Paper Preview Content */}
        <div className="p-6 sm:p-10 overflow-y-auto font-serif-tc text-stone-900 space-y-6 print:p-0 print:overflow-visible">
          {/* Header of Test Paper */}
          <div className="text-center pb-4 border-b-2 border-stone-900 space-y-2">
            <h1 className="text-2xl font-black tracking-wider">
              國中教育會考國文科 易錯字形字音註釋專題複習卷
            </h1>
            <div className="flex items-center justify-between text-sm pt-2 text-stone-700 max-w-lg mx-auto">
              <span>班級：__________</span>
              <span>座號：______</span>
              <span>姓名：__________</span>
              <span>得分：______</span>
            </div>
            <div className="text-xs text-stone-500 italic">
              {printMode === 'blank_test'
                ? '【說明】：請在下列括號中填入正確國字或注音，並熟悉課本釋義。'
                : '【說明】：完整會考重點講義與正確字詞釋義對照表。'}
            </div>
          </div>

          {/* Section 1: Focus 1 Words */}
          <div className="space-y-3">
            <h2 className="text-base font-bold bg-stone-100 p-2 rounded text-stone-900 border-l-4 border-amber-700">
              壹、焦點一：易寫錯的字與詞語釋義
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs leading-relaxed">
              {errorWords.slice(0, 80).map((w, idx) => (
                <div key={w.id} className="border-b border-stone-200 pb-1.5 flex items-start gap-2">
                  <span className="font-sans font-bold text-stone-400 w-5 shrink-0">
                    {idx + 1}.
                  </span>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-stone-900">
                      {printMode === 'blank_test' ? (
                        <span>
                          {w.charWithParens.replace(/\([^\)]+\)/g, '（　　）')}
                          <span className="ml-2 font-normal text-xs text-stone-600">
                            【{w.zhuyin}】
                          </span>
                        </span>
                      ) : (
                        <span>
                          {w.fullPhrase}
                          <span className="ml-2 font-normal text-xs text-amber-800">
                            【{w.zhuyin}】
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-600 mt-0.5">
                      釋義：{w.meaning}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Focus 2 Confused Words */}
          <div className="space-y-3 pt-4">
            <h2 className="text-base font-bold bg-stone-100 p-2 rounded text-stone-900 border-l-4 border-amber-700">
              貳、焦點二：常誤用字詞對比辨析
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {FOCUS_2_CONFUSED_WORDS.slice(0, 10).map((g) => (
                <div key={g.id} className="border border-stone-200 p-3 rounded-lg bg-stone-50/50">
                  <div className="font-bold text-sm mb-1 text-amber-950">
                    【{g.chars.join(' vs ')}】
                  </div>
                  <div className="space-y-1">
                    {g.examples.map((ex, i) => (
                      <div key={i}>
                        <strong className="text-stone-900">
                          {printMode === 'blank_test' ? '（　）：' : `【${ex.char}】：`}
                        </strong>
                        <span>
                          {printMode === 'blank_test'
                            ? ex.phrase.replace(new RegExp(ex.char, 'g'), '（　）')
                            : ex.phrase}
                        </span>
                        {ex.explanation && (
                          <div className="text-[11px] text-stone-500 pl-2">
                            → {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Focus 4 & 5 Phonetics */}
          <div className="space-y-3 pt-4">
            <h2 className="text-base font-bold bg-stone-100 p-2 rounded text-stone-900 border-l-4 border-amber-700">
              參、焦點四與五：成語與生活料理易誤讀字音
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {FOCUS_4_IDIOM_PHONETICS.slice(0, 16).map((item) => (
                <div key={item.id} className="p-2 border border-stone-200 rounded">
                  <div className="font-bold text-stone-900">{item.phrase}</div>
                  <div className="text-stone-600 mt-1">
                    「{item.targetChar}」音：
                    {printMode === 'blank_test' ? '［　　］' : item.zhuyin}
                  </div>
                </div>
              ))}

              {FOCUS_5_FOOD_PHONETICS.slice(0, 8).map((food) => (
                <div key={food.id} className="p-2 border border-stone-200 rounded">
                  <div className="font-bold text-stone-900">{food.foodName}</div>
                  <div className="text-stone-600 mt-1">
                    「{food.targetChar}」音：
                    {printMode === 'blank_test' ? '［　　］' : food.zhuyin}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
