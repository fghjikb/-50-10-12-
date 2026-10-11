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
  Keyboard as KeyboardIcon,
  CheckCircle2,
  Check,
  PenTool,
  Lock,
  Eye,
  AlertCircle,
  X,
} from 'lucide-react';
import { QuizType } from '../types';
import { generateQuizQuestions, QuizQuestion } from '../utils/quizGenerator';
import { triggerSuccessConfetti, triggerPerfectConfetti } from '../utils/confetti';
import { speakText } from '../utils/speech';
import { addMistake, addQuizHistory, MistakeRecord, QuizHistoryRecord } from '../utils/storage';
import { CustomQuizKeyboard } from './CustomQuizKeyboard';
import { HandwritingCanvas } from './HandwritingCanvas';

interface QuizModeProps {
  onGoToReview: () => void;
  onGoToMistakes: () => void;
  initialType?: QuizType;
  isQuizLocked?: boolean;
  isTeacher?: boolean;
  onRecordMistake?: (mistake: MistakeRecord) => void;
  onSaveQuizHistory?: (record: QuizHistoryRecord) => void;
}

export type QuestionFormatMode = 'choice' | 'non_choice';
export type NonChoiceInputStyle = 'handwriting' | 'keyboard';

export const QuizMode: React.FC<QuizModeProps> = ({
  onGoToReview,
  onGoToMistakes,
  initialType = 'comprehensive',
  isQuizLocked = false,
  isTeacher = false,
  onRecordMistake,
  onSaveQuizHistory,
}) => {
  // Config states
  const [quizType, setQuizType] = useState<QuizType>(initialType);
  const [questionFormatMode, setQuestionFormatMode] = useState<QuestionFormatMode>('non_choice');
  const [nonChoiceInputStyle, setNonChoiceInputStyle] = useState<NonChoiceInputStyle>('handwriting');
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [timerEnabled, setTimerEnabled] = useState<boolean>(true);
  const [secondsPerQuestion] = useState<number>(25);

  // Active quiz states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [customKeypadInput, setCustomKeypadInput] = useState<string>('');
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isWaitingHandwritingVerification, setIsWaitingHandwritingVerification] = useState<boolean>(false);
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
  const startQuiz = (
    type: QuizType = quizType,
    count: number = questionCount,
    fmtMode: QuestionFormatMode = questionFormatMode
  ) => {
    const generated = generateQuizQuestions(type, count);
    setQuestions(generated);
    setCurrentIndex(0);
    setSelectedOption(null);
    setCustomKeypadInput('');
    setIsAnswered(false);
    setIsWaitingHandwritingVerification(false);
    setScore(0);
    setUserAnswers([]);
    setTotalTimeSpent(0);
    setTimeLeft(secondsPerQuestion);
    setIsFinished(false);
    setIsPlaying(true);
  };

  // Timer countdown hook
  useEffect(() => {
    if (!isPlaying || isFinished || isAnswered || isWaitingHandwritingVerification || !timerEnabled) return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleProcessAnswer('（逾時未作答）', true);
          return 0;
        }
        return prev - 1;
      });
      setTotalTimeSpent((t) => t + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isFinished, isAnswered, isWaitingHandwritingVerification, timerEnabled, currentIndex]);

  // Normalize string for answer comparison
  const normalizeAnswer = (s: string) => {
    return s.trim().replace(/[\s\(\)（）]/g, '');
  };

  // Process user answer
  const handleProcessAnswer = (ans: string, isTimeout: boolean = false) => {
    if (isAnswered) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const currentQ = questions[currentIndex];
    const normUser = normalizeAnswer(ans);
    const normCorrect = normalizeAnswer(currentQ.correctAnswer);

    const isCorrect = !isTimeout && (normUser === normCorrect || ans.trim() === currentQ.correctAnswer.trim());

    setSelectedOption(ans);
    setIsAnswered(true);
    setIsWaitingHandwritingVerification(false);

    if (isCorrect) {
      setScore((s) => s + 1);
    } else {
      const { created } = addMistake({
        sourceId: currentQ.sourceId,
        question: currentQ.prompt + (currentQ.subPrompt ? ` (${currentQ.subPrompt})` : ''),
        userAnswer: ans,
        correctAnswer: currentQ.correctAnswer,
        explanation: currentQ.explanation,
        category: currentQ.category,
      });
      onRecordMistake?.(created);
    }

    setUserAnswers((prev) => [
      ...prev,
      {
        question: currentQ,
        userAnswer: ans,
        isCorrect,
      },
    ]);
  };

  // Choice mode submit
  const handleSelectChoiceOption = (option: string) => {
    handleProcessAnswer(option, false);
  };

  // Keypad submit
  const handleCustomKeypadSubmit = () => {
    if (!customKeypadInput.trim()) return;
    handleProcessAnswer(customKeypadInput.trim(), false);
  };

  // Handwriting submit: pauses timer and prompts for self-verification against standard font
  const handleHandwritingSubmitted = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsWaitingHandwritingVerification(true);
  };

  const handleConfirmHandwritingSelfCheck = (selfReportedCorrect: boolean) => {
    const currentQ = questions[currentIndex];
    if (selfReportedCorrect) {
      handleProcessAnswer(currentQ.correctAnswer, false);
    } else {
      handleProcessAnswer('（手寫字形筆劃有誤）', false);
    }
  };

  // Move to next question or finish
  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setCustomKeypadInput('');
      setIsAnswered(false);
      setIsWaitingHandwritingVerification(false);
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
    const finalScore = score;
    const pct = Math.round((finalScore / total) * 100);

    let grade = 'C';
    if (pct >= 95) grade = 'A++';
    else if (pct >= 90) grade = 'A+';
    else if (pct >= 85) grade = 'A';
    else if (pct >= 80) grade = 'B++';
    else if (pct >= 70) grade = 'B+';
    else if (pct >= 60) grade = 'B';

    const modeName =
      questionFormatMode === 'non_choice'
        ? nonChoiceInputStyle === 'handwriting'
          ? '【非選・田字手寫】'
          : '【非選・自製鍵盤】'
        : '【四選一】';

    const { created: historyCreated } = addQuizHistory({
      quizType: `${modeName} ${getQuizTypeName(quizType)}`,
      totalQuestions: total,
      score: finalScore,
      percentage: pct,
      grade,
      timeSpentSeconds: totalTimeSpent,
    });
    onSaveQuizHistory?.(historyCreated);

    if (pct >= 90) {
      triggerPerfectConfetti();
    } else if (pct >= 70) {
      triggerSuccessConfetti();
    }
  };

  const getQuizTypeName = (t: QuizType) => {
    switch (t) {
      case 'char_choice':
        return '焦點一：國字填空辨正測驗';
      case 'zhuyin_choice':
        return '焦點四/五：字音精選測驗';
      case 'meaning_choice':
        return '焦點一：詞語釋義測驗';
      case 'confused_choice':
        return '焦點二/三：誤用與形近字辨析';
      case 'polyphonic_choice':
        return '焦點六：一字多音破音字辨析';
      case 'classical_choice':
        return '焦點八/九：文言虛詞與通假字辨析';
      default:
        return '綜合會考全真模擬';
    }
  };

  // Locked Quiz Gate (增加把測驗功能關起來模式)
  if (isQuizLocked && !isTeacher) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6 text-center bg-white rounded-3xl border border-stone-200 shadow-xs space-y-5 animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-stone-900 font-serif-tc">
            會考測驗功能目前由老師管制關閉中
          </h3>
          <p className="text-sm text-stone-600 mt-2 max-w-md mx-auto leading-relaxed">
            任課老師目前已暫時鎖定測驗功能。請依照課堂指示進行<strong>「教材精讀總覽」</strong>或<strong>「字卡翻牌背誦」</strong>，待老師解鎖開放後即可進行測驗！
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={onGoToReview}
            className="px-6 py-3 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm shadow-sm transition cursor-pointer"
          >
            前往教材精讀總覽
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  const isPhoneticQuestion = currentQ
    ? currentQ.category?.includes('字音') ||
      currentQ.category?.includes('讀音') ||
      currentQ.category?.includes('料理') ||
      currentQ.prompt.includes('讀音') ||
      currentQ.prompt.includes('音讀') ||
      /[\u3105-\u3129]/.test(currentQ.correctAnswer)
    : false;

  // 1. CONFIGURATION VIEW
  if (!isPlaying && !isFinished) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs">
          <div className="flex items-center gap-3 pb-5 border-b border-stone-100">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-stone-900 tracking-tight font-serif-tc">
                  國文會考全真測驗模式
                </h2>
                {isQuizLocked && isTeacher && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-300 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    學生端已鎖定關閉中 (教師預覽)
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-stone-500">
                收錄完整會考題目，支援「田字格手寫作答」、「自製防作弊虛擬鍵盤」與「四選一測驗」
              </p>
            </div>
          </div>

          {/* TWO MAJOR QUESTION FORMAT TYPES */}
          <div className="mt-6 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <KeyboardIcon className="w-4 h-4 text-amber-700" />
              <span>題型呈現方式（依需求選擇）：</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Option A: Non-Choice */}
              <button
                type="button"
                onClick={() => setQuestionFormatMode('non_choice')}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  questionFormatMode === 'non_choice'
                    ? 'border-amber-700 bg-amber-50/80 ring-2 ring-amber-600/30'
                    : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-stone-900 text-base flex items-center gap-1.5 font-serif-tc">
                    非選擇題型
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-600 text-white shadow-2xs">
                    手寫板 / 自製鍵盤 ★ 推薦
                  </span>
                </div>
                <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                  避免同學透過輸入法選字猜答案！支援<strong>「田字格手寫板」</strong>筆畫書寫與<strong>「自製無提示鍵盤」</strong>。
                </p>
                <div className="mt-2.5 pt-2 border-t border-amber-200/50 text-[11px] font-semibold text-amber-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                  防猜答・支援手指觸控書寫
                </div>
              </button>

              {/* Option B: Standard 4-choice */}
              <button
                type="button"
                onClick={() => setQuestionFormatMode('choice')}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  questionFormatMode === 'choice'
                    ? 'border-amber-700 bg-amber-50/80 ring-2 ring-amber-600/30'
                    : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-stone-900 text-base font-serif-tc">
                    四選一選擇題型
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                    標準單選
                  </span>
                </div>
                <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                  傳統 ABCD 四選項作答模式，適合初學打底與快速考點檢閱。
                </p>
                <div className="mt-2.5 pt-2 border-stone-200/50 text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                  <span>快速作答・打底練習</span>
                </div>
              </button>
            </div>
          </div>

          {/* Sub-choice for Non-choice: Handwriting vs Keyboard */}
          {questionFormatMode === 'non_choice' && (
            <div className="mt-4 p-3 bg-amber-100/60 rounded-2xl border border-amber-200 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-amber-800" />
                <span>非選作答偏好方式：</span>
              </span>
              <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-amber-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setNonChoiceInputStyle('handwriting')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                    nonChoiceInputStyle === 'handwriting'
                      ? 'bg-amber-700 text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>田字格手寫作答</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNonChoiceInputStyle('keyboard')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                    nonChoiceInputStyle === 'keyboard'
                      ? 'bg-amber-700 text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <KeyboardIcon className="w-3.5 h-3.5" />
                  <span>自製鍵盤點選</span>
                </button>
              </div>
            </div>
          )}

          {/* Quiz Topics */}
          <div className="mt-6 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
              選擇測驗範圍
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'comprehensive',
                  title: '綜合會考全真大模擬',
                  desc: '混合字音、字形、釋義與形近字（全真模擬最推薦）',
                  badge: '全範圍衝刺',
                },
                {
                  id: 'char_choice',
                  title: '國字填空辨正測驗',
                  desc: '大展(抱)負、荒腔走(板)等易寫錯國字',
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
                  desc: '密vs蜜、疚vs咎、戊戌戍戎等對比辨正',
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
                <span className="text-sm font-bold text-stone-800">每題倒數計時（25秒）</span>
                <p className="text-xs text-stone-400">模擬會考臨場高壓作答節奏</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={timerEnabled}
                onChange={(e) => setTimerEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {/* Start Button */}
          <div className="mt-8 pt-4 border-t border-stone-100">
            <button
              onClick={() => startQuiz(quizType, questionCount, questionFormatMode)}
              className="w-full py-4 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer font-serif-tc"
            >
              <Flame className="w-5 h-5 text-amber-300 animate-pulse" />
              <span>
                開始測驗（{questionFormatMode === 'non_choice' ? (nonChoiceInputStyle === 'handwriting' ? '田字格手寫' : '自製鍵盤') : '四選一'}・共 {questionCount} 題）
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. ACTIVE QUIZ RUNNER VIEW
  if (isPlaying && currentQ) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
        {/* Top Progress & Timer Bar */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-stone-500 uppercase">進度</span>
            <span className="text-base font-extrabold text-stone-900">
              第 {currentIndex + 1} / {questions.length} 題
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
              {questionFormatMode === 'non_choice'
                ? nonChoiceInputStyle === 'handwriting'
                  ? '田字手寫'
                  : '非選鍵盤'
                : '四選一'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {timerEnabled && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
                  timeLeft <= 5
                    ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{timeLeft} 秒</span>
              </div>
            )}
            <div className="text-xs font-bold text-stone-600 bg-stone-100 px-3 py-1 rounded-xl">
              目前得分: <strong className="text-amber-700">{score}</strong> / {currentIndex}
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                {currentQ.category}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug font-serif-tc pt-2 tracking-wide">
                {currentQ.prompt}
              </h3>
            </div>

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

          {/* =========================================================================
              MODE A: NON-CHOICE (HANDWRITING or KEYBOARD)
             ========================================================================= */}
          {questionFormatMode === 'non_choice' ? (
            <div className="space-y-4 pt-1">
              {/* Toggle bar between Handwriting and Keyboard if character question */}
              {!isPhoneticQuestion && !isAnswered && !isWaitingHandwritingVerification && (
                <div className="flex justify-end gap-1.5">
                  <div className="bg-stone-100 p-1 rounded-xl border border-stone-200 flex text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setNonChoiceInputStyle('handwriting')}
                      className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                        nonChoiceInputStyle === 'handwriting'
                          ? 'bg-amber-700 text-white shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>田字格手寫</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNonChoiceInputStyle('keyboard')}
                      className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                        nonChoiceInputStyle === 'keyboard'
                          ? 'bg-amber-700 text-white shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <KeyboardIcon className="w-3.5 h-3.5" />
                      <span>自製鍵盤</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 1. HANDWRITING CANVAS VIEW (田字格手寫作答) */}
              {nonChoiceInputStyle === 'handwriting' && !isPhoneticQuestion && !isAnswered ? (
                <div>
                  {!isWaitingHandwritingVerification ? (
                    <HandwritingCanvas
                      onConfirm={handleHandwritingSubmitted}
                      charPrompt="請以手指或觸控筆在田字格內書寫正體字"
                    />
                  ) : (
                    /* Handwriting self-check panel against standard font */
                    <div className="p-5 rounded-2xl bg-amber-50/90 border border-amber-300 space-y-4 animate-fade-in">
                      <div className="text-center space-y-1">
                        <span className="text-xs font-bold text-amber-800 uppercase tracking-widest block">
                          手寫筆畫自檢核對
                        </span>
                        <h4 className="text-lg font-bold text-stone-900">
                          教育部標準正字審定為：
                        </h4>
                        <div className="my-2 inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl border-2 border-amber-500 font-serif-tc font-black text-5xl text-amber-950 shadow-md">
                          {currentQ.correctAnswer}
                        </div>
                      </div>

                      <div className="bg-white/80 p-3.5 rounded-xl border border-amber-200 text-xs text-stone-700 leading-relaxed text-center">
                        請對照您方才於田字格書寫之字形，確認<strong>部首、筆畫與結構</strong>是否完全正確無誤？
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => handleConfirmHandwritingSelfCheck(true)}
                          className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>我寫對了（計 1 分）</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmHandwritingSelfCheck(false)}
                          className="py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <X className="w-4 h-4" />
                          <span>筆畫有誤（記為錯題）</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* 2. CUSTOM KEYPAD VIEW */
                <>
                  {!isAnswered ? (
                    <>
                      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-900 uppercase">填答括號：</span>
                          <div className="inline-flex items-center px-4 py-2 rounded-xl bg-white border border-amber-300 font-serif-tc font-black text-2xl text-amber-950 shadow-xs min-w-[5rem] justify-center">
                            {customKeypadInput || <span className="text-stone-300 animate-pulse font-sans text-lg font-normal">（　）</span>}
                          </div>
                        </div>

                        <span className="text-xs text-stone-500 font-medium">
                          請點選下方自製無提示鍵盤輸入，完成後按「送出作答」
                        </span>
                      </div>

                      <CustomQuizKeyboard
                        mode={isPhoneticQuestion ? 'zhuyin' : 'char'}
                        targetChar={currentQ.correctAnswer}
                        expectedAnswer={currentQ.correctAnswer}
                        currentInput={customKeypadInput}
                        onInputChange={setCustomKeypadInput}
                        onSubmit={handleCustomKeypadSubmit}
                        disabled={isAnswered}
                      />
                    </>
                  ) : (
                    /* Answered state */
                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-stone-500">您的作答：</span>
                        <span className="font-serif-tc font-bold text-lg text-stone-900">
                          【{selectedOption || '未輸入'}】
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-stone-500">標準答案：</span>
                        <span className="font-serif-tc font-extrabold text-lg text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                          【{currentQ.correctAnswer}】
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            /* =========================================================================
                MODE B: 4-CHOICE OPTIONS (傳統四選一)
               ========================================================================= */
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
                    onClick={() => handleSelectChoiceOption(option)}
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
          )}

          {/* Explanation & Next Question Panel after answering */}
          {isAnswered && (
            <div className="pt-4 border-t border-stone-100 space-y-3 animate-fade-in">
              <div
                className={`p-4 rounded-2xl border ${
                  normalizeAnswer(selectedOption || '') === normalizeAnswer(currentQ.correctAnswer)
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50/80 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  {normalizeAnswer(selectedOption || '') === normalizeAnswer(currentQ.correctAnswer) ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <Sparkles className="w-4 h-4" /> 答對了！精準掌握會考考點
                    </span>
                  ) : (
                    <span className="text-rose-700">
                      答錯了！正確答案為：【{currentQ.correctAnswer}】
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-stone-800 leading-relaxed mt-2 bg-white/80 p-3 rounded-xl border border-stone-200/60 font-sans">
                  <span className="font-bold text-stone-600">【完整解析】：</span>
                  {currentQ.explanation}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold transition flex items-center gap-2 cursor-pointer shadow-sm text-sm sm:text-base font-serif-tc"
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
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs text-center space-y-6">
        <div className="inline-flex p-4 rounded-3xl bg-amber-50 text-amber-700 mb-1 border border-amber-200/80">
          <Award className="w-12 h-12" />
        </div>

        <div>
          <span className="text-xs font-bold text-amber-800 uppercase tracking-widest block mb-1">
            {questionFormatMode === 'non_choice'
              ? nonChoiceInputStyle === 'handwriting'
                ? '田字格手寫測驗結果'
                : '非選鍵盤測驗結果'
              : '四選一選擇測驗結果'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif-tc">
            {getQuizTypeName(quizType)}
          </h2>
        </div>

        {/* Score & Grade Display */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <span className="text-xs text-stone-500 block mb-1">答對題數</span>
            <span className="text-2xl font-black text-stone-900">
              {score} / {questions.length}
            </span>
          </div>
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <span className="text-xs text-stone-500 block mb-1">得分率</span>
            <span className="text-2xl font-black text-amber-700">{percentage}%</span>
          </div>
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <span className="text-xs text-stone-500 block mb-1">會考等第</span>
            <span className={`inline-block px-3 py-1 rounded-xl text-lg font-black ${gradeBadge.color}`}>
              {gradeBadge.label}
            </span>
          </div>
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <span className="text-xs text-stone-500 block mb-1">總耗時</span>
            <span className="text-2xl font-black text-stone-700">{totalTimeSpent} 秒</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-stone-100">
          <button
            onClick={() => startQuiz(quizType, questionCount, questionFormatMode)}
            className="px-6 py-3 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold transition flex items-center gap-2 cursor-pointer shadow-sm text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>再測一次</span>
          </button>

          {wrongAnswers.length > 0 && (
            <button
              onClick={onGoToMistakes}
              className="px-6 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold transition flex items-center gap-2 cursor-pointer text-sm"
            >
              <BookOpen className="w-4 h-4 text-rose-600" />
              <span>前往錯題本複習（{wrongAnswers.length} 題）</span>
            </button>
          )}

          <button
            onClick={onGoToReview}
            className="px-6 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition flex items-center gap-2 cursor-pointer text-sm"
          >
            <span>返回教材總複習</span>
          </button>
        </div>
      </div>
    </div>
  );
};
