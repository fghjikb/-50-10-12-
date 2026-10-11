export interface MistakeRecord {
  id: string;
  sourceId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  category: string;
  timestamp: number;
}

export interface QuizHistoryRecord {
  id: string;
  date: string;
  quizType: string;
  totalQuestions: number;
  score: number;
  percentage: number;
  grade: string;
  timeSpentSeconds: number;
}

const STORAGE_KEYS = {
  FAVORITES: 'guowen_favorites_v1',
  MISTAKES: 'guowen_mistakes_v1',
  MASTERED: 'guowen_mastered_v1',
  HISTORY: 'guowen_history_v1',
};

export const getFavorites = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const toggleFavorite = (id: string): string[] => {
  const current = getFavorites();
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(next));
  } catch {}
  return next;
};

export const getMastered = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MASTERED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const toggleMastered = (id: string): string[] => {
  const current = getMastered();
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  try {
    localStorage.setItem(STORAGE_KEYS.MASTERED, JSON.stringify(next));
  } catch {}
  return next;
};

export const getMistakes = (): MistakeRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MISTAKES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const setAllFavorites = (list: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(list));
  } catch {}
};

export const setAllMastered = (list: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.MASTERED, JSON.stringify(list));
  } catch {}
};

export const setAllMistakes = (list: MistakeRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(list));
  } catch {}
};

export const setAllQuizHistory = (list: QuizHistoryRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(list));
  } catch {}
};

export const addMistake = (
  mistake: Omit<MistakeRecord, 'id' | 'timestamp'>
): { next: MistakeRecord[]; created: MistakeRecord } => {
  const current = getMistakes();
  // Don't duplicate exactly same question, update it
  const existingIdx = current.findIndex((m) => m.question === mistake.question);
  const newRecord: MistakeRecord = {
    ...mistake,
    id: `mistake-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };

  let next: MistakeRecord[];
  if (existingIdx >= 0) {
    next = [...current];
    next[existingIdx] = newRecord;
  } else {
    next = [newRecord, ...current];
  }

  try {
    localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(next));
  } catch {}
  return { next, created: newRecord };
};

export const removeMistake = (id: string): MistakeRecord[] => {
  const current = getMistakes();
  const next = current.filter((m) => m.id !== id && m.sourceId !== id);
  try {
    localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(next));
  } catch {}
  return next;
};

export const clearMistakes = (): MistakeRecord[] => {
  try {
    localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify([]));
  } catch {}
  return [];
};

export const getQuizHistory = (): QuizHistoryRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addQuizHistory = (
  record: Omit<QuizHistoryRecord, 'id' | 'date'>
): { next: QuizHistoryRecord[]; created: QuizHistoryRecord } => {
  const current = getQuizHistory();
  const newRecord: QuizHistoryRecord = {
    ...record,
    id: `hist-${Date.now()}`,
    date: new Date().toLocaleString('zh-TW', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
  const next = [newRecord, ...current.slice(0, 49)];
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(next));
  } catch {}
  return { next, created: newRecord };
};

