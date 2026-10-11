import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { MistakeRecord, QuizHistoryRecord } from '../utils/storage';

export interface AppUser {
  id: string;
  username?: string;
  email: string | null;
  displayName: string;
  seatNumber?: string;
  role: 'admin' | 'student';
  avatarUrl?: string;
  avatarColor?: string;
  createdAt: number;
  lastLoginAt: number;
}

export interface StudentAccount {
  id: string;
  username: string;
  password: string;
  displayName: string;
  seatNumber?: string;
  role: 'student';
  isActive: boolean;
  createdAt: number;
  lastLoginAt?: number;
}

export interface ClassSettings {
  accountLimit: number;
  className: string;
  teacherName: string;
  isQuizLocked?: boolean;
  updatedAt: number;
}

export interface StudentProgressSummary {
  user: AppUser;
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

const ADMIN_EMAILS = ['mpuwu0825@gmail.com'];
const TEACHER_MASTER_PASSCODES = ['admin888', 'guowen2026', '888888'];

// Helper to determine role
export const determineRole = (email: string | null): 'admin' | 'student' => {
  if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
    return 'admin';
  }
  return 'student';
};

// 1. CLASS SETTINGS & QUOTA APIS
export const fetchClassSettings = async (): Promise<ClassSettings> => {
  const configDocRef = doc(db, 'classSettings', 'config');
  try {
    const snap = await getDoc(configDocRef);
    if (snap.exists()) {
      return snap.data() as ClassSettings;
    }
    // Default initial settings if not yet stored
    const defaultSettings: ClassSettings = {
      accountLimit: 35,
      className: '國文會考衝刺全真班',
      teacherName: '國文科召集老師',
      updatedAt: Date.now(),
    };
    await setDoc(configDocRef, defaultSettings);
    return defaultSettings;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'classSettings/config');
    return {
      accountLimit: 35,
      className: '國文會考衝刺全真班',
      teacherName: '國文科召集老師',
      updatedAt: Date.now(),
    };
  }
};

export const updateClassSettings = async (
  accountLimit: number,
  className: string = '國文會考衝刺全真班',
  teacherName: string = '國文科召集老師',
  isQuizLocked?: boolean
): Promise<ClassSettings> => {
  const configDocRef = doc(db, 'classSettings', 'config');
  const payload: Partial<ClassSettings> = {
    accountLimit,
    className,
    teacherName,
    updatedAt: Date.now(),
  };
  if (isQuizLocked !== undefined) {
    payload.isQuizLocked = isQuizLocked;
  }
  try {
    await setDoc(configDocRef, payload, { merge: true });
    return (await fetchClassSettings());
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'classSettings/config');
    return {
      accountLimit,
      className,
      teacherName,
      isQuizLocked: isQuizLocked || false,
      updatedAt: Date.now(),
    };
  }
};

export const updateQuizLockedStatus = async (isQuizLocked: boolean): Promise<void> => {
  const configDocRef = doc(db, 'classSettings', 'config');
  try {
    await setDoc(configDocRef, { isQuizLocked, updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'classSettings/config');
  }
};

export const subscribeClassSettings = (
  onUpdate: (settings: ClassSettings) => void
): (() => void) => {
  const configDocRef = doc(db, 'classSettings', 'config');
  return onSnapshot(
    configDocRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as ClassSettings);
      }
    },
    (err) => {
      console.warn('subscribeClassSettings error:', err);
    }
  );
};

// 2. STUDENT ACCOUNT MANAGEMENT (Controlled by Teacher)
export const fetchStudentAccounts = async (): Promise<StudentAccount[]> => {
  const accountsCol = collection(db, 'accounts');
  try {
    const snap = await getDocs(accountsCol);
    const accounts = snap.docs.map((d) => d.data() as StudentAccount);
    accounts.sort((a, b) => {
      const seatA = parseInt(a.seatNumber || '999', 10);
      const seatB = parseInt(b.seatNumber || '999', 10);
      return seatA - seatB;
    });
    return accounts;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'accounts');
    return [];
  }
};

export const batchCreateStudentAccounts = async (
  count: number,
  defaultPass: string = '8888'
): Promise<StudentAccount[]> => {
  const accountsCol = collection(db, 'accounts');
  const settings = await fetchClassSettings();
  const current = await fetchStudentAccounts();

  const allowedToCreate = Math.min(count, settings.accountLimit);
  const createdList: StudentAccount[] = [];

  const existingSeats = new Set(current.map((c) => c.seatNumber));

  for (let i = 1; i <= allowedToCreate; i++) {
    const seatStr = i < 10 ? `0${i}` : `${i}`;
    const id = `std-${seatStr}`;
    const username = `student${seatStr}`;

    const acc: StudentAccount = {
      id,
      username,
      password: defaultPass,
      displayName: `學生${seatStr}號`,
      seatNumber: seatStr,
      role: 'student',
      isActive: true,
      createdAt: Date.now(),
      lastLoginAt: undefined,
    };

    const docRef = doc(db, 'accounts', id);
    await setDoc(docRef, acc, { merge: true });

    // Also initialize corresponding user profile
    const userDocRef = doc(db, 'users', id);
    await setDoc(
      userDocRef,
      {
        id,
        username,
        displayName: acc.displayName,
        seatNumber: seatStr,
        role: 'student',
        email: null,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
      },
      { merge: true }
    );

    createdList.push(acc);
  }

  return createdList;
};

export const createStudentAccount = async (
  accData: Omit<StudentAccount, 'createdAt'>
): Promise<StudentAccount> => {
  const id = accData.id || `std-${Date.now().toString(36)}`;
  const account: StudentAccount = {
    ...accData,
    id,
    createdAt: Date.now(),
  };

  const docRef = doc(db, 'accounts', id);
  await setDoc(docRef, account);

  // Initialize user record
  const userDocRef = doc(db, 'users', id);
  await setDoc(
    userDocRef,
    {
      id,
      username: account.username,
      displayName: account.displayName,
      seatNumber: account.seatNumber,
      role: 'student',
      email: null,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    },
    { merge: true }
  );

  return account;
};

export const updateStudentAccount = async (
  id: string,
  updates: Partial<StudentAccount>
): Promise<void> => {
  const docRef = doc(db, 'accounts', id);
  try {
    await setDoc(docRef, updates, { merge: true });
    if (updates.displayName || updates.seatNumber) {
      const userDocRef = doc(db, 'users', id);
      await setDoc(
        userDocRef,
        {
          ...(updates.displayName ? { displayName: updates.displayName } : {}),
          ...(updates.seatNumber ? { seatNumber: updates.seatNumber } : {}),
        },
        { merge: true }
      );
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `accounts/${id}`);
  }
};

export const deleteStudentAccount = async (id: string): Promise<void> => {
  const docRef = doc(db, 'accounts', id);
  try {
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `accounts/${id}`);
  }
};

// 3. STUDENT & TEACHER LOGIN VERIFICATION
export const studentLogin = async (
  usernameInput: string,
  passwordInput: string
): Promise<AppUser> => {
  const accountsCol = collection(db, 'accounts');
  const snap = await getDocs(accountsCol);

  let matched = snap.docs
    .map((d) => d.data() as StudentAccount)
    .find(
      (acc) =>
        acc.username.trim().toLowerCase() === usernameInput.trim().toLowerCase() ||
        (acc.seatNumber && acc.seatNumber === usernameInput.trim()) ||
        (acc.seatNumber && parseInt(acc.seatNumber, 10) === parseInt(usernameInput.trim(), 10))
    );

  if (!matched) {
    throw new Error('查無此學生帳號或座號！請確認座號是否正確，或請老師至教學管理名冊建檔開通。');
  }

  // Exact password check - MUST match the account password, never allow random passwords
  if (!passwordInput || !passwordInput.trim()) {
    throw new Error('請輸入學生登入密碼！');
  }

  if (matched.password && matched.password.trim() !== passwordInput.trim()) {
    throw new Error('登入密碼不正確！請重新輸入正確密碼，或請老師至教學管理名冊重設。');
  }

  if (!matched.isActive) {
    throw new Error('此學生帳號目前已被老師暫時停用，請聯絡老師開通！');
  }

  // Update last login in Firestore
  const now = Date.now();
  await updateStudentAccount(matched.id, { lastLoginAt: now });

  const appUser: AppUser = {
    id: matched.id,
    username: matched.username,
    displayName: matched.displayName,
    seatNumber: matched.seatNumber,
    email: null,
    role: 'student',
    avatarColor: 'bg-amber-600',
    createdAt: matched.createdAt,
    lastLoginAt: now,
  };

  const userDocRef = doc(db, 'users', matched.id);
  await setDoc(userDocRef, appUser, { merge: true });

  return appUser;
};

export const teacherPasscodeLogin = async (passcode: string): Promise<AppUser> => {
  if (!TEACHER_MASTER_PASSCODES.includes(passcode.trim())) {
    throw new Error('教師專用驗證碼錯誤！請輸入正確之教學召集人密碼。');
  }

  const teacherUser: AppUser = {
    id: 'user-admin-root',
    username: 'admin',
    displayName: '國文科召集老師',
    role: 'admin',
    email: 'mpuwu0825@gmail.com',
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
    avatarColor: 'bg-amber-700',
  };

  const adminDocRef = doc(db, 'admins', teacherUser.id);
  await setDoc(adminDocRef, { userId: teacherUser.id, email: teacherUser.email }, { merge: true });

  const userDocRef = doc(db, 'users', teacherUser.id);
  await setDoc(userDocRef, teacherUser, { merge: true });

  return teacherUser;
};

// 4. GOOGLE AUTH FOR TEACHER
export const signInWithGoogle = async (): Promise<AppUser> => {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    const fbUser = cred.user;
    const role = determineRole(fbUser.email);

    const userProfile: AppUser = {
      id: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName || '國文學子',
      role,
      avatarUrl: fbUser.photoURL || undefined,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    };

    const userDocRef = doc(db, 'users', fbUser.uid);
    try {
      const existing = await getDoc(userDocRef);
      if (existing.exists()) {
        const data = existing.data();
        userProfile.createdAt = data.createdAt || Date.now();
        userProfile.seatNumber = data.seatNumber;
        userProfile.role = data.role || role;
        await setDoc(userDocRef, { ...userProfile, lastLoginAt: Date.now() }, { merge: true });
      } else {
        await setDoc(userDocRef, userProfile);
      }

      if (role === 'admin') {
        const adminDocRef = doc(db, 'admins', fbUser.uid);
        await setDoc(adminDocRef, { userId: fbUser.uid, email: fbUser.email }, { merge: true });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}`);
    }

    return userProfile;
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
};

export const signOutAccount = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-out failed:', error);
  }
};

// 5. REALTIME FIRESTORE DATA SYNC FOR STUDENT (No local storage!)
export const subscribeFavorites = (
  userId: string,
  onUpdate: (favorites: string[]) => void
): (() => void) => {
  const colRef = collection(db, 'users', userId, 'favorites');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const ids = snapshot.docs.map((d) => d.id);
      onUpdate(ids);
    },
    (error) => {
      console.warn('subscribeFavorites error:', error);
    }
  );
};

export const saveFavoriteToFirestore = async (userId: string, wordId: string, isFav: boolean) => {
  const docRef = doc(db, 'users', userId, 'favorites', wordId);
  try {
    if (isFav) {
      await setDoc(docRef, { wordId, userId, createdAt: new Date().toISOString() });
    } else {
      await deleteDoc(docRef);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/favorites/${wordId}`);
  }
};

export const subscribeMastered = (
  userId: string,
  onUpdate: (mastered: string[]) => void
): (() => void) => {
  const colRef = collection(db, 'users', userId, 'mastered');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const ids = snapshot.docs.map((d) => d.id);
      onUpdate(ids);
    },
    (error) => {
      console.warn('subscribeMastered error:', error);
    }
  );
};

export const saveMasteredToFirestore = async (userId: string, wordId: string, isMastered: boolean) => {
  const docRef = doc(db, 'users', userId, 'mastered', wordId);
  try {
    if (isMastered) {
      await setDoc(docRef, { wordId, userId, createdAt: new Date().toISOString() });
    } else {
      await deleteDoc(docRef);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/mastered/${wordId}`);
  }
};

export const subscribeMistakes = (
  userId: string,
  onUpdate: (mistakes: MistakeRecord[]) => void
): (() => void) => {
  const colRef = collection(db, 'users', userId, 'mistakes');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as MistakeRecord);
      items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      onUpdate(items);
    },
    (error) => {
      console.warn('subscribeMistakes error:', error);
    }
  );
};

export const saveMistakeToFirestore = async (userId: string, mistake: MistakeRecord) => {
  const docRef = doc(db, 'users', userId, 'mistakes', mistake.id);
  try {
    await setDoc(docRef, { ...mistake, userId });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/mistakes/${mistake.id}`);
  }
};

export const deleteMistakeFromFirestore = async (userId: string, mistakeId: string) => {
  const docRef = doc(db, 'users', userId, 'mistakes', mistakeId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/mistakes/${mistakeId}`);
  }
};

export const clearAllMistakesInFirestore = async (userId: string) => {
  const colRef = collection(db, 'users', userId, 'mistakes');
  try {
    const snap = await getDocs(colRef);
    const deletes = snap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletes);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/mistakes`);
  }
};

export const subscribeQuizHistory = (
  userId: string,
  onUpdate: (history: QuizHistoryRecord[]) => void
): (() => void) => {
  const colRef = collection(db, 'users', userId, 'quizHistory');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as QuizHistoryRecord);
      items.sort((a, b) => ((b as any).timestamp || 0) - ((a as any).timestamp || 0));
      onUpdate(items);
    },
    (error) => {
      console.warn('subscribeQuizHistory error:', error);
    }
  );
};

export const saveQuizHistoryToFirestore = async (
  userId: string,
  record: QuizHistoryRecord
) => {
  const docRef = doc(db, 'users', userId, 'quizHistory', record.id);
  try {
    await setDoc(docRef, {
      ...record,
      userId,
      timestamp: Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/quizHistory/${record.id}`);
  }
};

// 6. TEACHER DASHBOARD OVERVIEW API
export const fetchClassroomOverview = async (): Promise<StudentProgressSummary[]> => {
  try {
    // 1. First get all authorized student accounts
    const accounts = await fetchStudentAccounts();
    const summaries: StudentProgressSummary[] = [];

    for (const acc of accounts) {
      const userId = acc.id;
      const user: AppUser = {
        id: acc.id,
        username: acc.username,
        displayName: acc.displayName,
        seatNumber: acc.seatNumber,
        email: null,
        role: 'student',
        createdAt: acc.createdAt,
        lastLoginAt: acc.lastLoginAt || 0,
      };

      try {
        const [favSnap, mastSnap, misSnap, histSnap] = await Promise.all([
          getDocs(collection(db, 'users', userId, 'favorites')),
          getDocs(collection(db, 'users', userId, 'mastered')),
          getDocs(collection(db, 'users', userId, 'mistakes')),
          getDocs(collection(db, 'users', userId, 'quizHistory')),
        ]);

        const mistakes = misSnap.docs.map((d) => d.data() as MistakeRecord);
        const quizHistory = histSnap.docs.map((d) => d.data() as QuizHistoryRecord);
        quizHistory.sort((a, b) => ((b as any).timestamp || 0) - ((a as any).timestamp || 0));

        const totalQuizzes = quizHistory.length;
        const averageScore =
          totalQuizzes > 0
            ? Math.round(quizHistory.reduce((acc, q) => acc + q.score, 0) / totalQuizzes)
            : 0;
        const latestGrade = totalQuizzes > 0 ? quizHistory[0].grade : '未測驗';
        const lastQuizDate = totalQuizzes > 0 ? quizHistory[0].date : undefined;

        summaries.push({
          user,
          totalMastered: mastSnap.size,
          totalFavorites: favSnap.size,
          totalMistakes: mistakes.length,
          totalQuizzes,
          averageScore,
          latestGrade,
          lastQuizDate,
          quizHistory,
          mistakes,
        });
      } catch (e) {
        summaries.push({
          user,
          totalMastered: 0,
          totalFavorites: 0,
          totalMistakes: 0,
          totalQuizzes: 0,
          averageScore: 0,
          latestGrade: '未測驗',
          quizHistory: [],
          mistakes: [],
        });
      }
    }

    return summaries;
  } catch (error) {
    console.warn('fetchClassroomOverview failed:', error);
    return [];
  }
};
