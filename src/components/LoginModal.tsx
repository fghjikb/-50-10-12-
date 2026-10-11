import React, { useState } from 'react';
import {
  X,
  UserCheck,
  ShieldAlert,
  GraduationCap,
  Sparkles,
  ArrowRight,
  UserPlus,
  KeyRound,
  Check,
} from 'lucide-react';
import {
  User,
  getAllStudents,
  loginUser,
  registerStudent,
  switchUser,
} from '../utils/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUserChanged: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
}) => {
  const [tab, setTab] = useState<'student' | 'admin' | 'register'>('student');

  // Student login / register form state
  const [studentName, setStudentName] = useState<string>('');
  const [seatNumber, setSeatNumber] = useState<string>('');

  // Admin login form state
  const [adminUsername, setAdminUsername] = useState<string>('admin');
  const [adminPassword, setAdminPassword] = useState<string>('admin888');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  if (!isOpen) return null;

  const existingStudents = getAllStudents();

  const handleQuickSwitchStudent = (studentId: string) => {
    const target = switchUser(studentId);
    if (target) {
      onUserChanged(target);
      onClose();
    }
  };

  const handleAdminLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    const res = loginUser(adminUsername, adminPassword);
    if (res.success && res.user) {
      onUserChanged(res.user);
      setSuccessMessage('管理員登入成功！已具備後台權限');
      setTimeout(() => {
        onClose();
      }, 500);
    } else {
      setErrorMessage(res.message || '登入失敗，請確認帳號與密碼');
    }
  };

  const handleRegisterOrLoginStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!studentName.trim()) {
      setErrorMessage('請輸入學生姓名');
      return;
    }

    // Check if matching student name exists
    const match = existingStudents.find(
      (s) => s.displayName.trim() === studentName.trim()
    );
    if (match) {
      const switched = switchUser(match.id);
      if (switched) {
        onUserChanged(switched);
        onClose();
        return;
      }
    }

    // Register new student
    const res = registerStudent(studentName.trim(), seatNumber.trim() || undefined);
    if (res.success) {
      onUserChanged(res.user);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 bg-gradient-to-br from-amber-50 to-stone-50 border-b border-stone-200/80 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-600 text-white shadow-xs">
                {tab === 'admin' ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : (
                  <GraduationCap className="w-5 h-5" />
                )}
              </span>
              <div>
                <h3 className="text-lg font-bold text-stone-900 font-serif-tc">
                  {tab === 'admin'
                    ? '管理員 / 教師身分驗證'
                    : tab === 'register'
                    ? '建立新學生學習檔案'
                    : '學生登入與進度切換'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  國文會考學習歷程與後台進度系統
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-stone-200 bg-stone-100/50 p-1.5 gap-1.5">
          <button
            onClick={() => {
              setTab('student');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'student'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            學生登入 / 切換
          </button>
          <button
            onClick={() => {
              setTab('register');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'register'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <UserPlus className="w-4 h-4 text-amber-600" />
            註冊新學生
          </button>
          <button
            onClick={() => {
              setTab('admin');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'admin'
                ? 'bg-white text-amber-900 shadow-xs ring-1 ring-amber-300'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-700" />
            管理員後台
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              {successMessage}
            </div>
          )}

          {/* TAB 1: Student Quick Switch & Login */}
          {tab === 'student' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-600">
                  選擇現有學生帳號：
                </label>
                <span className="text-[11px] text-stone-400">
                  共 {existingStudents.length} 位已註冊學生
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {existingStudents.map((st) => {
                  const isCurrent = currentUser?.id === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => handleQuickSwitchStudent(st.id)}
                      className={`w-full p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                        isCurrent
                          ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                          : 'border-stone-200 bg-stone-50/60 hover:bg-stone-100 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl ${
                            st.avatarColor || 'bg-amber-600'
                          } text-white flex items-center justify-center font-bold text-sm shadow-xs`}
                        >
                          {st.seatNumber || st.displayName.slice(0, 1)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-stone-900 flex items-center gap-2">
                            <span>{st.displayName}</span>
                            {st.seatNumber && (
                              <span className="text-[11px] font-medium text-stone-500 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                                座號 {st.seatNumber}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-400">
                            帳號：{st.username}
                          </div>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" />
                          使用中
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-amber-700 hover:underline flex items-center gap-0.5">
                          切換登入 <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-400">需要為其他學生建檔？</span>
                <button
                  onClick={() => setTab('register')}
                  className="font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                >
                  + 立即註冊新學生
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Register New Student */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterOrLoginStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  學生真實姓名 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：陳怡均、李宗翰"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  班級座號 (選填)
                </label>
                <input
                  type="text"
                  placeholder="例如：28"
                  value={seatNumber}
                  onChange={(e) => setSeatNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                確認建立檔案並開始學習
              </button>
            </form>
          )}

          {/* TAB 3: Admin Login */}
          {tab === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 text-amber-950 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  管理員 / 授課教師登入專區
                </div>
                登入後可進入「管理員後台」，察看全班每位學生的歷次模擬測驗成績、單元掌握率與高頻錯題排行！
                <div className="mt-1 font-mono text-[11px] bg-white/80 p-1.5 rounded border border-amber-200">
                  預設帳號：<strong>admin</strong> ｜ 預設密碼：<strong>admin888</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  管理員帳號
                </label>
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  管理員密碼
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-sm font-mono"
                />
              </div>

              <div className="space-y-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  登入管理員系統
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAdminUsername('admin');
                    setAdminPassword('admin888');
                    handleAdminLogin();
                  }}
                  className="w-full py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  ⚡ 一鍵以「國文科召集老師」身分免密登入
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
