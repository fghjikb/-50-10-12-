import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, testConnection, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  AppUser,
  determineRole,
  signInWithGoogle,
  signOutAccount,
  studentLogin,
  teacherPasscodeLogin,
} from '../services/firebaseService';

interface AuthContextType {
  currentUser: AppUser | null;
  firebaseUser: FirebaseUser | null;
  isAuthReady: boolean;
  isFirebaseConnected: boolean;
  isTeacher: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithStudent: (username: string, pass: string) => Promise<void>;
  loginWithTeacherPasscode: (pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileSeatNumber: (seat: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  firebaseUser: null,
  isAuthReady: false,
  isFirebaseConnected: false,
  isTeacher: false,
  loginWithGoogle: async () => {},
  loginWithStudent: async () => {},
  loginWithTeacherPasscode: async () => {},
  logout: async () => {},
  updateProfileSeatNumber: async () => {},
});

const ACTIVE_USER_SESSION_KEY = 'guowen_session_uid_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);

  // Check connection on mount
  useEffect(() => {
    testConnection().then((connected) => {
      setIsFirebaseConnected(connected);
    });
  }, []);

  // Restore active student/teacher session from Firestore on boot
  useEffect(() => {
    const restoreSession = async () => {
      const savedUid = sessionStorage.getItem(ACTIVE_USER_SESSION_KEY);
      if (savedUid) {
        try {
          const userDocRef = doc(db, 'users', savedUid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setCurrentUser(snap.data() as AppUser);
          }
        } catch (e) {
          console.warn('Failed to restore active session from firestore:', e);
        }
      }
      setIsAuthReady(true);
    };

    restoreSession();
  }, []);

  // Listen to Google Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        const role = determineRole(fbUser.email);
        const userDocRef = doc(db, 'users', fbUser.uid);

        try {
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as AppUser;
            const updatedProfile = {
              ...data,
              id: fbUser.uid,
              email: fbUser.email,
              avatarUrl: fbUser.photoURL || undefined,
            };
            setCurrentUser(updatedProfile);
            sessionStorage.setItem(ACTIVE_USER_SESSION_KEY, fbUser.uid);
          } else {
            const newProfile: AppUser = {
              id: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName || '國文教師',
              role,
              avatarUrl: fbUser.photoURL || undefined,
              createdAt: Date.now(),
              lastLoginAt: Date.now(),
            };
            await setDoc(userDocRef, newProfile);
            setCurrentUser(newProfile);
            sessionStorage.setItem(ACTIVE_USER_SESSION_KEY, fbUser.uid);
          }
        } catch (err) {
          console.warn('Failed to fetch user doc from firestore:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const user = await signInWithGoogle();
    setCurrentUser(user);
    sessionStorage.setItem(ACTIVE_USER_SESSION_KEY, user.id);
  };

  const loginWithStudent = async (username: string, pass: string) => {
    const student = await studentLogin(username, pass);
    setCurrentUser(student);
    sessionStorage.setItem(ACTIVE_USER_SESSION_KEY, student.id);
  };

  const loginWithTeacherPasscode = async (passcode: string) => {
    const teacher = await teacherPasscodeLogin(passcode);
    setCurrentUser(teacher);
    sessionStorage.setItem(ACTIVE_USER_SESSION_KEY, teacher.id);
  };

  const logout = async () => {
    await signOutAccount();
    sessionStorage.removeItem(ACTIVE_USER_SESSION_KEY);
    setCurrentUser(null);
  };

  const updateProfileSeatNumber = async (seatNumber: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, seatNumber };
    setCurrentUser(updated);
    try {
      await setDoc(doc(db, 'users', currentUser.id), { seatNumber }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.id}`);
    }
  };

  const isTeacher = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        isAuthReady,
        isFirebaseConnected,
        isTeacher,
        loginWithGoogle,
        loginWithStudent,
        loginWithTeacherPasscode,
        logout,
        updateProfileSeatNumber,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
