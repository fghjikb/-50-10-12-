import React, { useState, useEffect, useRef } from 'react';
import {
  HelpCircle,
  Clock,
  Award,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Flame,
  Volume2,
  Sparkles,
} from 'lucide-react';
import { QuizType } from '../types';
import { generateQuizQuestions, QuizQuestion } from '../utils/quizGenerator';
import { triggerSuccessConfetti, triggerPerfectConfetti } from '../utils/confetti';
import { speakText } from '../utils/speech';
import { addMistake, addQuizHistory } from '../utils/storage';

interface QuizModeProps {
  onGoToReview: () => void;
  onGoToMistakes: () => void;
  initialType?: QuizType;
}

export const QuizMode: React.FC<QuizModeProps> = ({
  onGoToReview,
  onGoToMistakes,
  initialType = 'comprehensive',
}) => {
  // Config states
  const [quizType, setQuizType] = useState<QuizType>(initialType);
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [timerEnabled, setTimerEnabled] = useState<boolean>(true);
  const [secondsPerQuestion] = useState<number>(20);

  // Active quiz states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<{
    question: QuizQuestion;
    userAnswer: string;
    isCorrect: boolean;
  }[]>([]);

  // Timer states
  const [timeLeft, setTimeLeft] = useState<number>(secondsPerQuestion);
  const [totalTimeSpent, setTotalTimeSpent] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  // Result state
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Start new quiz
  const startQuiz = (type: QuizType = quizType, count: number = questionCount) => {
    const generated = generateQuizQuestions(type, count);
    setQuestions(generated);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setUserAnswers([]);
    setTotalTimeSpent(0);
    setTimeLeft(secondsPerQuestion);
    setIsFinished(false);
    setIsPlaying(true);
  };

  // Timer countdown hook
  useEffect(() => {
    if (!isPlaying || isFinished || isAnswered || !timerEnabled) return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timeout, auto answer wrong
          handleSelectOption('（逾時未作答）', true);
          return 0;
        }
        return prev - 1;
      });
      setTotalTimeSpent((t) => t + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isFinished, isAnswered, timerEnabled, currentIndex]);

  // Handle option click
  const handleSelectOption = (option: string, isTimeout: boolean = false) => {
    if (isAnswered) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const currentQ = questions[currentIndex];
    const isCorrect = !isTimeout && option === currentQ.correctAnswer;

    setSelectedOption(option);
    setIsAnswered(true);

    if (isCorrect) {
      setScore((s) => s + 1);
    } else {
      // Record mistake
      addMistake({
        sourceId: currentQ.sourceId,
        question: currentQ.prompt + (currentQ.subPrompt ? ` (${currentQ.subPrompt})` : ''),
        userAnswer: option,
        correctAnswer: currentQ.correctAnswer,
        explanation: currentQ.explanation,
        category: currentQ.category,
      });
    }

    setUserAnswers((prev) => [
      ...prev,
      {
        question: currentQ,
        userAnswer: option,
        isCorrect,
      },
    ]);
  };

  // Move to next question or finish
  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(secondsPerQuestion);
    } else {
      finishQuiz();
    }
  };

  // Finish and compute results
  const finishQuiz = () => {
    setIsPlaying(false);
    setIsFinished(true);

    const total = questions.length;
    const finalScore = score + (selectedOption === questions[currentIndex]?.correctAnswer ? 0 : 0);
    const pct = Math.round((finalScore / total) * 100);

    // Save to history
    let grade = 'C';
    if (pct >= 95) grade = 'A++';
    else if (pct >= 90) grade = 'A+';
    else if (pct >= 85) grade = 'A';
    else if (pct >= 80) grade = 'B++';
    else if (pct >= 70) grade = 'B+';
    else if (pct >= 60) grade = 'B';

    addQuizHistory({
      quizType: getQuizTypeName(quizType),
      totalQuestions: total,
      score: finalScore,
      percentage: pct,
      grade,
      timeSpentSeconds: totalTimeSpent,
    });

    if (pct >= 90) {
      triggerPerfectConfetti();
    } else if (pct >= 70) {
      triggerSuccessConfetti();
    }
  };

  const getQuizTypeName = (t: QuizType) => {
    switch (t) {
      case 'char_choice':
        return '焦點一：國字填空測驗';
      case 'zhuyin_choice':
        return '焦點四/五：字音精選測驗';
      case 'meaning_choice':
        return '焦點一：詞語釋義測驗';
      case 'confused_choice':
        return '焦點二/三：誤用與形近字辨析';
      default:
        return '綜合會考全真模擬';
    }
  };

  const currentQ = questions[currentIndex];

  // 1. CONFIGURATION VIEW
  if (!isPlaying && !isFinished) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs">
          <div className="flex items-center gap-3 pb-5 border-b border-stone-100">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                國文會考測驗模式
              </h2>
              <p className="text-xs sm:text-sm text-stone-500">
                依據完整會考課本教材題目，檢測字音、字形、註釋與形近字辨析掌握度
              </p>
            </div>
          </div>

          {/* Quiz Type Selector */}
          <div className="mt-6 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
              選擇測驗題型
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'comprehensive',
                  title: '綜合會考全真大模擬',
                  desc: '混合字音、字形、釋義與形近字（最推薦衝刺複習）',
                  badge: '推薦',
                },
                {
                  id: 'char_choice',
                  title: '國字填空辨正測驗',
                  desc: '大展(抱)負、荒腔走(板)等括號字形選填',
                  badge: 'P.155~157',
                },
                {
                  id: 'zhuyin_choice',
                  title: '常考字音與料理讀音',
                  desc: '圖窮匕現、汆燙、味噌、剛愎等常誤讀音',
                  badge: 'P.167~172',
                },
                {
                  id: 'confused_choice',
                  title: '誤用字與形近字辨析',
                  desc: '密vs蜜、疚vs咎、戊戌戍戎等對比選擇',
                  badge: 'P.158~166',
                },
                {
                  id: 'polyphonic_choice',
                  title: '一字多音破音字辨析',
                  desc: '咽、乘、創、差、冠、扁、省等審定音辨析',
                  badge: '破音必考',
                },
                {
                  id: 'classical_choice',
                  title: '文言虛詞與通假字辨析',
                  desc: '而、之、以、於等虛詞多義，說通悅、蚤通早等通假字',
                  badge: '文言核心',
                },
                {
                  id: 'meaning_choice',
                  title: '課文釋義與字義配對',
                  desc: '荒腔走板之「板」、無俾後悔等精確釋義',
                  badge: '註釋精選',
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setQuizType(item.id as QuizType)}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    quizType === item.id
                      ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20'
                      : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-stone-900 text-sm sm:text-base">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      {item.badge}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Number of questions */}
          <div className="mt-6 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
              測驗題數
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {[10, 20, 30, 50].map((num) => (
                <button
                  key={num}
                  onClick={() => setQuestionCount(num)}
                  className={`py-2.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                    questionCount === num
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {num} 題
                </button>
              ))}
            </div>
          </div>

          {/* Timer option */}
          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-500" />
              <div>
                <span className="text-sm font-bold text-stone-800">每題倒數計時（20秒）</span>
                <p className="text-xs text-stone-400">模擬會考高壓臨場作答節奏</p>
              </div>
            </div>
            <button
              onClick={() => setTimerEnabled(!timerEnabled)}
              className={`w-12 h-6 rounded-full transition cursor-pointer p-0.5 ${
                timerEnabled ? 'bg-amber-600' : 'bg-stone-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  timerEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Start Quiz button */}
          <div className="mt-8">
            <button
              onClick={() => startQuiz()}
              className="w-full py-4 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Flame className="w-5 h-5 text-amber-300" />
              <span>開始會考模擬測驗</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. ACTIVE QUIZ PLAY VIEW
  if (isPlaying && currentQ) {
    const progressPct = ((currentIndex + 1) / questions.length) * 100;

    return (
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Progress Bar & Header */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-600">
            <span className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                {currentQ.category}
              </span>
              <span>題號：{currentIndex + 1} / {questions.length}</span>
            </span>

            <div className="flex items-center gap-3">
              {timerEnabled && (
                <span
                  className={`flex items-center gap-1 font-bold ${
                    timeLeft <= 5 ? 'text-rose-600 animate-pulse' : 'text-stone-600'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {timeLeft} 秒
                </span>
              )}
              <span className="text-emerald-700 font-bold">
                目前得分：{score} 題
              </span>
            </div>
          </div>

          <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
            <div
              className="h-full bg-amber-600 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Question Prompt Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif-tc leading-snug">
              {currentQ.prompt}
            </h3>
            <button
              onClick={() => speakText(currentQ.prompt)}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition cursor-pointer shrink-0"
              title="朗讀題目"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {currentQ.subPrompt && (
            <div className="text-sm font-medium text-amber-900/90 bg-amber-50 p-3 rounded-xl border border-amber-200/80">
              {currentQ.subPrompt}
            </div>
          )}

          {/* Options Grid */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((option, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              const isSelected = selectedOption === option;
              const isCorrectOpt = option === currentQ.correctAnswer;

              let btnStyle = 'border-stone-200 bg-stone-50/70 hover:bg-amber-50/50 hover:border-amber-300 text-stone-800';

              if (isAnswered) {
                if (isCorrectOpt) {
                  btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/30';
                } else if (isSelected && !isCorrectOpt) {
                  btnStyle = 'border-rose-400 bg-rose-50 text-rose-900 ring-2 ring-rose-500/30';
                } else {
                  btnStyle = 'border-stone-200 bg-stone-100 text-stone-400 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(option)}
                  className={`p-4 rounded-2xl border text-left transition font-serif-tc font-bold text-base sm:text-lg flex items-center gap-3 cursor-pointer ${btnStyle}`}
                >
                  <span
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-sans font-bold text-sm shrink-0 ${
                      isAnswered && isCorrectOpt
                        ? 'bg-emerald-600 text-white'
                        : isAnswered && isSelected
                        ? 'bg-rose-600 text-white'
                        : 'bg-white text-stone-700 border border-stone-200 shadow-2xs'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="break-words flex-1">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation panel after answering */}
          {isAnswered && (
            <div className="pt-4 border-t border-stone-100 space-y-3 animate-fade-in">
              <div
                className={`p-4 rounded-2xl border ${
                  selectedOption === currentQ.correctAnswer
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50/80 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  {selectedOption === currentQ.correctAnswer ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <Sparkles className="w-4 h-4" /> 答對了！太厲害了
                    </span>
                  ) : (
                    <span className="text-rose-700">
                      答錯了！正確答案為：【{currentQ.correctAnswer}】
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-stone-800 leading-relaxed mt-2 bg-white/80 p-3 rounded-xl border border-stone-200/60">
                  <span className="font-bold text-stone-600">【完整解析】：</span>
                  {currentQ.explanation}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold transition flex items-center gap-2 cursor-pointer shadow-sm text-sm sm:text-base"
                >
                  <span>{currentIndex + 1 < questions.length ? '下一題' : '查看測驗成績'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. RESULTS VIEW
  const percentage = Math.round((score / questions.length) * 100);
  let gradeBadge = { label: 'A++', desc: '精熟頂尖', color: 'bg-emerald-600 text-white' };
  if (percentage < 60) {
    gradeBadge = { label: 'C', desc: '待加強', color: 'bg-rose-600 text-white' };
  } else if (percentage < 70) {
    gradeBadge = { label: 'B', desc: '基礎', color: 'bg-amber-600 text-white' };
  } else if (percentage < 80) {
    gradeBadge = { label: 'B+', desc: '基礎中標', color: 'bg-amber-500 text-white' };
  } else if (percentage < 85) {
    gradeBadge = { label: 'B++', desc: '基礎高標', color: 'bg-teal-600 text-white' };
  } else if (percentage < 90) {
    gradeBadge = { label: 'A', desc: '精熟', color: 'bg-emerald-500 text-white' };
  } else if (percentage < 95) {
    gradeBadge = { label: 'A+', desc: '精熟前標', color: 'bg-emerald-600 text-white' };
  }

  const wrongAnswers = userAnswers.filter((ua) => !ua.isCorrect);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Result Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm text-center space-y-5">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-100 text-amber-800 mx-auto shadow-xs">
          <Award className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-stone-100 text-stone-600 uppercase">
            {getQuizTypeName(quizType)}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-2">
            測驗完成！你的等第為：
          </h2>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className={`text-4xl sm:text-5xl font-black px-4 py-1.5 rounded-2xl ${gradeBadge.color}`}>
              {gradeBadge.label}
            </span>
            <span className="text-lg font-bold text-stone-600">
              （{gradeBadge.desc}）
            </span>
          </div>
        </div>

        {/* Score and Stats */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
            <div className="text-xs text-stone-500 font-semibold">答對題數</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5">
              {score} / {questions.length}
            </div>
          </div>
          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
            <div className="text-xs text-stone-500 font-semibold">得分率</div>
            <div className="text-xl sm:text-2xl font-black text-amber-700 mt-0.5">
              {percentage}%
            </div>
          </div>
          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
            <div className="text-xs text-stone-500 font-semibold">耗費時間</div>
            <div className="text-xl sm:text-2xl font-black text-stone-800 mt-0.5">
              {totalTimeSpent} 秒
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <button
            onClick={() => startQuiz(quizType, questionCount)}
            className="px-5 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold transition flex items-center gap-2 cursor-pointer shadow-xs text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>重新測驗一回</span>
          </button>

          {wrongAnswers.length > 0 && (
            <button
              onClick={onGoToMistakes}
              className="px-5 py-3 rounded-xl bg-rose-50 border border-rose-300 hover:bg-rose-100 text-rose-800 font-bold transition flex items-center gap-2 cursor-pointer text-sm"
            >
              <span>查看錯題筆記本 ({wrongAnswers.length})</span>
            </button>
          )}

          <button
            onClick={onGoToReview}
            className="px-5 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition flex items-center gap-2 cursor-pointer text-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>回到課文複習</span>
          </button>
        </div>
      </div>

      {/* Mistakes review breakdown */}
      {wrongAnswers.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              本次錯題檢視 ({wrongAnswers.length} 題已自動收錄至錯題筆記本)
            </h3>
          </div>

          <div className="space-y-4">
            {wrongAnswers.map((item, idx) => (
              <div
                key={idx}
                className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs sm:text-sm space-y-2"
              >
                <div className="font-bold text-stone-900 font-serif-tc text-base">
                  {item.question.prompt}
                </div>
                {item.question.subPrompt && (
                  <div className="text-stone-500 text-xs">
                    {item.question.subPrompt}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-bold">
                    你的作答：{item.userAnswer}
                  </span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                    正確答案：{item.question.correctAnswer}
                  </span>
                </div>
                <div className="text-stone-600 pt-1 text-xs leading-relaxed bg-white p-2.5 rounded-xl border border-stone-100">
                  <strong className="text-stone-500">解析：</strong>
                  {item.question.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
