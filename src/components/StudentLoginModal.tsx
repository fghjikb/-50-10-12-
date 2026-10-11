import React, { useState } from 'react';
import {
  X,
  User,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  LogIn,
  School,
  Sparkles,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface StudentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentLoginModal: React.FC<StudentLoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithStudent, loginWithGoogle, loginWithTeacherPasscode, isFirebaseConnected } = useAuth();

  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');

  // Student form
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Teacher form
  const [teacherPasscode, setTeacherPasscode] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('請輸入學生帳號與登入密碼！');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      await loginWithStudent(username.trim(), password.trim());
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '登入失敗，請確認帳號或密碼是否正確！');
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherPasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherPasscode.trim()) {
      setErrorMsg('請輸入教師教學專用驗證碼！');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      await loginWithTeacherPasscode(teacherPasscode.trim());
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '驗證碼錯誤，請重新輸入！');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google 登入失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden">
        {/* Modal Top Header */}
        <div className="bg-stone-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center font-bold font-serif-tc text-lg text-white shadow-sm">
              國
            </div>
            <div>
              <h3 className="font-bold text-lg tracking-tight font-serif-tc">
                會考國文學習系統登入
              </h3>
              <p className="text-xs text-amber-300/80">
                本系統為班級專屬授權・帳號由老師統一制定配發
              </p>
            </div>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-1.5 mt-4 bg-stone-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab('student');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'student'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>學生登入</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('teacher');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'teacher'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>教師／召集人</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. STUDENT LOGIN FORM */}
          {activeTab === 'student' && (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  學生帳號或座號：
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="例如：student01 或座號 01"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-hidden font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  登入密碼：
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="預設密碼為 8888 或老師發放之密碼"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-hidden font-medium"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm text-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? '驗證帳號中...' : '確認登入開始學習'}</span>
              </button>

              {/* Fast autofill helper for convenience */}
              <div className="pt-2 border-t border-stone-100">
                <span className="text-[11px] font-semibold text-stone-400 block mb-1.5">
                  快速帶入示範學生帳號：
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('student01');
                      setPassword('8888');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium cursor-pointer transition"
                  >
                    座號01 (student01 / 8888)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('student02');
                      setPassword('8888');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium cursor-pointer transition"
                  >
                    座號02 (student02 / 8888)
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* 2. TEACHER LOGIN FORM */}
          {activeTab === 'teacher' && (
            <div className="space-y-4">
              <form onSubmit={handleTeacherPasscodeSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    教學召集人管理密碼：
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                    <input
                      type="password"
                      value={teacherPasscode}
                      onChange={(e) => setTeacherPasscode(e.target.value)}
                      placeholder="請輸入召集人密碼 (預設 admin888)"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-hidden font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm text-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? '驗證中...' : '以教學召集人身分登入'}</span>
                </button>
              </form>

              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-stone-200"></div>
                <span className="shrink mx-3 text-stone-400 text-xs font-medium">或使用 Google</span>
                <div className="grow border-t border-stone-200"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs text-sm"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-4 h-4"
                />
                <span>以 Google 教師帳號登入</span>
              </button>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs leading-relaxed">
                <strong>教師專屬權限：</strong>
                登入後可制定全班學生帳號數量上限、一鍵批次生成學生帳號、列印發放名冊，並即時查閱全班字音字形測驗成績與錯題。
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
