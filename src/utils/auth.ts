import {
  getFavorites,
  getMastered,
  getMistakes,
  getQuizHistory,
  QuizHistoryRecord,
  MistakeRecord,
} from './storage';
import { AppUser } from '../services/firebaseService';

export interface User {
  id: string;
  username: string;
  displayName: string;
  seatNumber?: string;
  role: 'admin' | 'student';
  email?: string;
  createdAt: number;
  lastLoginAt: number;
  avatarColor?: string;
}

export interface StudentProgressSummary {
  user: User;
  totalMastered: number;
  totalFavorites: number;
  totalMistakes: number;
  totalQuizzes: number;
  averageScore: number;
  latestGrade: string;
  lastQuizDate?: string;
  quizHistory: QuizHistoryRecord[];
  mistakes: MistakeRecord[];
}

const AUTH_STORAGE_KEYS = {
  CURRENT_USER: 'guowen_current_user_v1',
  USERS_LIST: 'guowen_users_list_v1',
};

export const DEFAULT_ADMIN: User = {
  id: 'user-admin-root',
  username: 'admin',
  displayName: '國文科召集老師',
  role: 'admin',
  email: 'mpuwu0825@gmail.com',
  createdAt: Date.now() - 30 * 86400000,
  lastLoginAt: Date.now(),
  avatarColor: 'bg-amber-700',
};

export const DEMO_STUDENTS: User[] = [
  {
    id: 'student-1',
    username: 'wang01',
    displayName: '王小明',
    seatNumber: '01',
    role: 'student',
    createdAt: Date.now() - 14 * 86400000,
    lastLoginAt: Date.now() - 3600000,
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 'student-2',
    username: 'lin08',
    displayName: '林詩涵',
    seatNumber: '08',
    role: 'student',
    createdAt: Date.now() - 12 * 86400000,
    lastLoginAt: Date.now() - 7200000,
    avatarColor: 'bg-indigo-600',
  },
  {
    id: 'student-3',
    username: 'chang15',
    displayName: '張哲宇',
    seatNumber: '15',
    role: 'student',
    createdAt: Date.now() - 10 * 86400000,
    lastLoginAt: Date.now() - 86400000,
    avatarColor: 'bg-blue-600',
  },
  {
    id: 'student-4',
    username: 'chen22',
    displayName: '陳冠廷',
    seatNumber: '22',
    role: 'student',
    createdAt: Date.now() - 7 * 86400000,
    lastLoginAt: Date.now() - 172800000,
    avatarColor: 'bg-purple-600',
  },
];

// Seed demo student data for rich offline/initial preview
export const seedDemoStudentData = (studentId: string) => {
  const historyKey = `guowen_history_${studentId}`;
  const masteredKey = `guowen_mastered_${studentId}`;
  const mistakesKey = `guowen_mistakes_${studentId}`;
  const favoritesKey = `guowen_favorites_${studentId}`;

  if (localStorage.getItem(historyKey)) return;

  let demoHistories: QuizHistoryRecord[] = [];
  let demoMistakes: MistakeRecord[] = [];
  let demoMasteredCount = 20;

  if (studentId === 'student-1') {
    demoMasteredCount = 68;
    demoHistories = [
      {
        id: `h-1-1`,
        date: '10/11 09:30',
        quizType: '綜合會考全真大模擬',
        totalQuestions: 20,
        score: 95,
        percentage: 95,
        grade: 'A++',
        timeSpentSeconds: 142,
      },
      {
        id: `h-1-2`,
        date: '10/10 16:20',
        quizType: '國字填空辨正測驗',
        totalQuestions: 20,
        score: 90,
        percentage: 90,
        grade: 'A+',
        timeSpentSeconds: 165,
      },
      {
        id: `h-1-3`,
        date: '10/08 20:15',
        quizType: '文言虛詞與通假字辨析',
        totalQuestions: 20,
        score: 85,
        percentage: 85,
        grade: 'A',
        timeSpentSeconds: 190,
      },
    ];
    demoMistakes = [
      {
        id: 'm-1-1',
        sourceId: 'f1-b-3',
        question: '「長途（　）涉」括號中正確國字為何？',
        userAnswer: '拔',
        correctAnswer: '跋',
        explanation: '長途跋涉：跋，陸地行走；勿寫成拔河之「拔」。',
        category: '焦點一：易寫錯的字與釋義',
        timestamp: Date.now() - 3600000,
      },
    ];
  } else if (studentId === 'student-2') {
    demoMasteredCount = 52;
    demoHistories = [
      {
        id: `h-2-1`,
        date: '10/11 11:10',
        quizType: '常考字音與料理讀音',
        totalQuestions: 20,
        score: 85,
        percentage: 85,
        grade: 'A',
        timeSpentSeconds: 155,
      },
      {
        id: `h-2-2`,
        date: '10/09 14:40',
        quizType: '綜合會考全真大模擬',
        totalQuestions: 20,
        score: 80,
        percentage: 80,
        grade: 'B++',
        timeSpentSeconds: 180,
      },
    ];
    demoMistakes = [
      {
        id: 'm-2-1',
        sourceId: 'f5-1',
        question: '「汆」燙的正確教育部審定讀音為何？',
        userAnswer: 'ㄩㄥˇ',
        correctAnswer: 'ㄘㄨㄢ',
        explanation: '汆燙：汆讀作「ㄘㄨㄢ」，入水微煮，常誤讀成「ㄊㄨㄣˇ」。',
        category: '焦點五：日常美食料理讀音',
        timestamp: Date.now() - 7200000,
      },
      {
        id: 'm-2-2',
        sourceId: 'f8-1',
        question: '「人不知而不慍」中「而」的語法作用為何？',
        userAnswer: '連詞，表示順承',
        correctAnswer: '連詞，表示轉折（然而、卻）',
        explanation: '人不知而不慍：人家不了解我，我卻不怨恨。前後語意相反，表轉折。',
        category: '焦點八：文言虛詞多義',
        timestamp: Date.now() - 7200000,
      },
    ];
  } else if (studentId === 'student-3') {
    demoMasteredCount = 38;
    demoHistories = [
      {
        id: `h-3-1`,
        date: '10/10 19:20',
        quizType: '誤用字與形近字辨析',
        totalQuestions: 20,
        score: 75,
        percentage: 75,
        grade: 'B+',
        timeSpentSeconds: 210,
      },
      {
        id: `h-3-2`,
        date: '10/07 10:15',
        quizType: '綜合會考全真大模擬',
        totalQuestions: 20,
        score: 70,
        percentage: 70,
        grade: 'B',
        timeSpentSeconds: 230,
      },
    ];
    demoMistakes = [
      {
        id: 'm-3-1',
        sourceId: 'f2-1',
        question: '請選出「__月期」正確填入之字：',
        userAnswer: '密',
        correctAnswer: '蜜',
        explanation: '蜜月、蜂蜜、甜蜜用「蜜」；精密、密閉、密友用「密」。',
        category: '焦點二：常誤用字辨析',
        timestamp: Date.now() - 86400000,
      },
      {
        id: 'm-3-2',
        sourceId: 'f9-1',
        question: '「學而時習之，不亦說乎」中「說」通何字？',
        userAnswer: '說',
        correctAnswer: '悅',
        explanation: '說通悅，讀作ㄩㄝˋ，指喜悅愉快。',
        category: '焦點九：會考重要通假字',
        timestamp: Date.now() - 86400000,
      },
    ];
  } else {
    demoMasteredCount = 24;
    demoHistories = [
      {
        id: `h-4-1`,
        date: '10/09 17:30',
        quizType: '國字填空辨正測驗',
        totalQuestions: 20,
        score: 65,
        percentage: 65,
        grade: 'B',
        timeSpentSeconds: 245,
      },
    ];
    demoMistakes = [
      {
        id: 'm-4-1',
        sourceId: 'f1-b-1',
        question: '「大展（　）負」括號中正確國字為何？',
        userAnswer: '暴',
        correctAnswer: '抱',
        explanation: '大展抱負：抱負，胸懷志趣；常誤寫成暴躁之「暴」。',
        category: '焦點一：易寫錯的字與釋義',
        timestamp: Date.now() - 172800000,
      },
    ];
  }

  const fakeMastered = Array.from({ length: demoMasteredCount }, (_, i) => `f1-b-${i + 1}`);
  const fakeFavorites = ['f1-b-1', 'f2-1', 'f8-1'];

  try {
    localStorage.setItem(historyKey, JSON.stringify(demoHistories));
    localStorage.setItem(masteredKey, JSON.stringify(fakeMastered));
    localStorage.setItem(mistakesKey, JSON.stringify(demoMistakes));
    localStorage.setItem(favoritesKey, JSON.stringify(fakeFavorites));
  } catch {}
};

export const initAuthSystem = () => {
  if (typeof window === 'undefined') return;

  try {
    const rawUsers = localStorage.getItem(AUTH_STORAGE_KEYS.USERS_LIST);
    if (!rawUsers) {
      const allUsers = [DEFAULT_ADMIN, ...DEMO_STUDENTS];
      localStorage.setItem(AUTH_STORAGE_KEYS.USERS_LIST, JSON.stringify(allUsers));
      DEMO_STUDENTS.forEach((st) => seedDemoStudentData(st.id));
    }

    const current = localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER);
    if (!current) {
      localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEMO_STUDENTS[0]));
    }
  } catch {}
};

export const getCurrentUser = (): User => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEMO_STUDENTS[0];
};

export const getAllUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.USERS_LIST);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [DEFAULT_ADMIN, ...DEMO_STUDENTS];
};

export const getAllStudents = (): User[] => {
  return getAllUsers().filter((u) => u.role === 'student');
};

export const getStudentProgress = (student: User): StudentProgressSummary => {
  const historyKey = `guowen_history_${student.id}`;
  const masteredKey = `guowen_mastered_${student.id}`;
  const mistakesKey = `guowen_mistakes_${student.id}`;
  const favoritesKey = `guowen_favorites_${student.id}`;

  let quizHistory: QuizHistoryRecord[] = [];
  let mastered: string[] = [];
  let mistakes: MistakeRecord[] = [];
  let favorites: string[] = [];

  try {
    const rawHist = localStorage.getItem(historyKey);
    quizHistory = rawHist ? JSON.parse(rawHist) : [];
  } catch {}

  try {
    const rawMast = localStorage.getItem(masteredKey);
    mastered = rawMast ? JSON.parse(rawMast) : [];
  } catch {}

  try {
    const rawMist = localStorage.getItem(mistakesKey);
    mistakes = rawMist ? JSON.parse(rawMist) : [];
  } catch {}

  try {
    const rawFav = localStorage.getItem(favoritesKey);
    favorites = rawFav ? JSON.parse(rawFav) : [];
  } catch {}

  if (quizHistory.length === 0 && student.id === DEMO_STUDENTS[0].id) {
    quizHistory = getQuizHistory();
  }
  if (mastered.length === 0 && student.id === DEMO_STUDENTS[0].id) {
    mastered = getMastered();
  }
  if (mistakes.length === 0 && student.id === DEMO_STUDENTS[0].id) {
    mistakes = getMistakes();
  }
  if (favorites.length === 0 && student.id === DEMO_STUDENTS[0].id) {
    favorites = getFavorites();
  }

  const totalQuizzes = quizHistory.length;
  const averageScore = totalQuizzes > 0
    ? Math.round(quizHistory.reduce((acc, q) => acc + q.score, 0) / totalQuizzes)
    : 0;
  const latestGrade = totalQuizzes > 0 ? quizHistory[0].grade : '未測驗';
  const lastQuizDate = totalQuizzes > 0 ? quizHistory[0].date : undefined;

  return {
    user: student,
    totalMastered: mastered.length,
    totalFavorites: favorites.length,
    totalMistakes: mistakes.length,
    totalQuizzes,
    averageScore,
    latestGrade,
    lastQuizDate,
    quizHistory,
    mistakes,
  };
};

export const getClassMetrics = () => {
  const students = getAllStudents();
  const summaries = students.map((s) => getStudentProgress(s));

  const totalStudents = students.length;
  const totalQuizzesCount = summaries.reduce((acc, s) => acc + s.totalQuizzes, 0);
  const totalScoresSum = summaries.reduce((acc, s) => acc + (s.averageScore * s.totalQuizzes), 0);
  const classAverage = totalQuizzesCount > 0 ? Math.round(totalScoresSum / totalQuizzesCount) : 0;
  const averageMastered = totalStudents > 0
    ? Math.round(summaries.reduce((acc, s) => acc + s.totalMastered, 0) / totalStudents)
    : 0;

  const gradeCounts: Record<string, number> = {
    'A++': 0,
    'A+': 0,
    'A': 0,
    'B++': 0,
    'B+': 0,
    'B': 0,
    'C': 0,
  };

  summaries.forEach((s) => {
    s.quizHistory.forEach((q) => {
      if (gradeCounts[q.grade] !== undefined) {
        gradeCounts[q.grade]++;
      }
    });
  });

  const mistakeFrequency: Record<string, { count: number; record: MistakeRecord; students: string[] }> = {};
  summaries.forEach((s) => {
    s.mistakes.forEach((m) => {
      const key = m.question;
      if (!mistakeFrequency[key]) {
        mistakeFrequency[key] = {
          count: 0,
          record: m,
          students: [],
        };
      }
      mistakeFrequency[key].count++;
      if (!mistakeFrequency[key].students.includes(s.user.displayName)) {
        mistakeFrequency[key].students.push(s.user.displayName);
      }
    });
  });

  const topMistakes = Object.values(mistakeFrequency)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalStudents,
    totalQuizzesCount,
    classAverage,
    averageMastered,
    gradeCounts,
    summaries,
    topMistakes,
  };
};
