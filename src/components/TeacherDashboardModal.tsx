import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Award,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Cloud,
  KeyRound,
  Plus,
  Trash2,
  Printer,
  Shield,
  UserCheck,
  UserX,
  Edit2,
  Save,
  Check,
} from 'lucide-react';
import {
  fetchClassroomOverview,
  StudentProgressSummary,
  fetchClassSettings,
  updateClassSettings,
  fetchStudentAccounts,
  batchCreateStudentAccounts,
  createStudentAccount,
  updateStudentAccount,
  deleteStudentAccount,
  StudentAccount,
  ClassSettings,
} from '../services/firebaseService';

interface TeacherDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirebaseConnected: boolean;
}

export const TeacherDashboardModal: React.FC<TeacherDashboardModalProps> = ({
  isOpen,
  onClose,
  isFirebaseConnected,
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'accounts' | 'print_cards'>('analytics');
  const [loading, setLoading] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Analytics states
  const [summaries, setSummaries] = useState<StudentProgressSummary[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentProgressSummary | null>(null);

  // Account management states
  const [classSettings, setClassSettings] = useState<ClassSettings>({
    accountLimit: 35,
    className: '國文會考衝刺全真班',
    teacherName: '國文科召集老師',
    updatedAt: Date.now(),
  });
  const [studentAccounts, setStudentAccounts] = useState<StudentAccount[]>([]);

  // New account form
  const [newSeat, setNewSeat] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('8888');
  const [isAddingSingle, setIsAddingSingle] = useState<boolean>(false);

  // Batch generation form
  const [batchCount, setBatchCount] = useState<number>(35);
  const [batchPass, setBatchPass] = useState<string>('8888');

  // Quota edit
  const [editingQuota, setEditingQuota] = useState<number>(35);
  const [isSavingQuota, setIsSavingQuota] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    setActionSuccessMsg(null);
    try {
      const [settingsData, accountsData, overviewData] = await Promise.all([
        fetchClassSettings(),
        fetchStudentAccounts(),
        fetchClassroomOverview(),
      ]);

      setClassSettings(settingsData);
      setEditingQuota(settingsData.accountLimit);
      setStudentAccounts(accountsData);
      setSummaries(overviewData);
    } catch (e) {
      console.warn('Failed to load dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalStudents = summaries.length;
  const totalQuizzes = summaries.reduce((acc, s) => acc + s.totalQuizzes, 0);
  const totalScores = summaries.reduce((acc, s) => acc + s.averageScore * s.totalQuizzes, 0);
  const classAvg = totalQuizzes > 0 ? Math.round(totalScores / totalQuizzes) : 0;
  const avgMastered =
    totalStudents > 0
      ? Math.round(summaries.reduce((acc, s) => acc + s.totalMastered, 0) / totalStudents)
      : 0;

  // Grade count tally
  const gradeTally: Record<string, number> = {
    'A++': 0,
    'A+': 0,
    A: 0,
    'B++': 0,
    'B+': 0,
    B: 0,
    C: 0,
  };
  summaries.forEach((s) => {
    s.quizHistory.forEach((q) => {
      if (gradeTally[q.grade] !== undefined) gradeTally[q.grade]++;
    });
  });

  // Handle saving quota
  const handleSaveQuota = async () => {
    setIsSavingQuota(true);
    try {
      const updated = await updateClassSettings(
        editingQuota,
        classSettings.className,
        classSettings.teacherName
      );
      setClassSettings(updated);
      setActionSuccessMsg(`成功將班級帳號上限調整為 ${editingQuota} 位！`);
    } catch (err) {
      alert('更新帳號數量上限失敗');
    } finally {
      setIsSavingQuota(false);
    }
  };

  // Handle batch account creation
  const handleBatchGenerate = async () => {
    if (!window.confirm(`確定要為全班批次建立 ${batchCount} 個學生帳號嗎？`)) return;
    setLoading(true);
    try {
      await batchCreateStudentAccounts(batchCount, batchPass);
      setActionSuccessMsg(`成功批次建立 ${batchCount} 位學生帳號！已儲存至 Firebase 雲端。`);
      await loadData();
    } catch (err: any) {
      alert(`批次建立失敗: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle single account creation
  const handleCreateSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newName.trim()) return;

    if (studentAccounts.length >= classSettings.accountLimit) {
      alert(`已達目前制定的帳號數量上限 (${classSettings.accountLimit} 位)！請先調高上限。`);
      return;
    }

    setLoading(true);
    try {
      const seatStr = newSeat.trim().padStart(2, '0');
      await createStudentAccount({
        id: `std-${seatStr || Date.now()}`,
        username: newUsername.trim(),
        password: newPassword.trim() || '8888',
        displayName: newName.trim(),
        seatNumber: seatStr,
        role: 'student',
        isActive: true,
      });
      setIsAddingSingle(false);
      setNewSeat('');
      setNewName('');
      setNewUsername('');
      setNewPassword('8888');
      setActionSuccessMsg(`成功建立學生「${newName.trim()}」的帳號！`);
      await loadData();
    } catch (err: any) {
      alert(`新增失敗: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Toggle account active status
  const handleToggleActive = async (acc: StudentAccount) => {
    try {
      await updateStudentAccount(acc.id, { isActive: !acc.isActive });
      setStudentAccounts((prev) =>
        prev.map((item) => (item.id === acc.id ? { ...item, isActive: !item.isActive } : item))
      );
    } catch (err) {
      alert('切換帳號狀態失敗');
    }
  };

  // Delete account
  const handleDeleteAccount = async (acc: StudentAccount) => {
    if (!window.confirm(`確定要刪除座號 ${acc.seatNumber}（${acc.displayName}）的帳號嗎？`))
      return;
    try {
      await deleteStudentAccount(acc.id);
      setStudentAccounts((prev) => prev.filter((item) => item.id !== acc.id));
      setActionSuccessMsg(`已刪除座號 ${acc.seatNumber} 帳號。`);
    } catch (err) {
      alert('刪除失敗');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-700 text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-stone-900 font-serif-tc">
                  國文教學管理與全班學情儀表板
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <Cloud className="w-3 h-3 text-emerald-600" />
                  Firebase 即時儲存
                </span>
              </div>
              <p className="text-xs text-stone-500">
                由老師制定帳號數量與權限，完全不依賴本機快取，實時追蹤學生作答
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition cursor-pointer"
              title="重新整理數據"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-stone-200 bg-white text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'border-amber-700 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>全班學情與會考等第</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('accounts')}
            className={`pb-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'accounts'
                ? 'border-amber-700 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>學生帳號制定與名冊管理</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
              {studentAccounts.length}/{classSettings.accountLimit}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('print_cards')}
            className={`pb-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'print_cards'
                ? 'border-amber-700 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>列印發放帳號小卡</span>
          </button>
        </div>

        {actionSuccessMsg && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* =========================================================================
            TAB 1: ANALYTICS & SCORE OVERVIEW
           ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Key Metrics Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
                <div className="text-xs text-amber-900/80 font-bold">已開通學生帳號</div>
                <div className="text-2xl font-black text-amber-950 mt-1 font-serif-tc">
                  {studentAccounts.length}{' '}
                  <span className="text-xs font-normal text-stone-500">
                    / 上限 {classSettings.accountLimit} 位
                  </span>
                </div>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
                <div className="text-xs text-emerald-900/80 font-bold">班級測驗平均分</div>
                <div className="text-2xl font-black text-emerald-950 mt-1 font-serif-tc">
                  {classAvg} <span className="text-xs font-normal text-stone-500">分</span>
                </div>
              </div>

              <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4">
                <div className="text-xs text-indigo-900/80 font-bold">人均已掌握詞數</div>
                <div className="text-2xl font-black text-indigo-950 mt-1 font-serif-tc">
                  {avgMastered} <span className="text-xs font-normal text-stone-500">詞</span>
                </div>
              </div>

              <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4">
                <div className="text-xs text-rose-900/80 font-bold">累計測驗場次</div>
                <div className="text-2xl font-black text-rose-950 mt-1 font-serif-tc">
                  {totalQuizzes} <span className="text-xs font-normal text-stone-500">次</span>
                </div>
              </div>
            </div>

            {/* Grade Distribution Bar */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80">
              <div className="text-xs font-bold text-stone-700 flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-700" />
                  會考全真等第分布統計
                </span>
                <span className="text-stone-400">總計 {totalQuizzes} 筆雲端測驗記錄</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                {['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C'].map((g) => (
                  <div key={g} className="bg-white rounded-xl p-2 border border-stone-200">
                    <div className="font-extrabold text-amber-800">{g}</div>
                    <div className="text-base font-black text-stone-900 mt-0.5">
                      {gradeTally[g] || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Progress Roster */}
            <div>
              <h4 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-700" />
                個別學生學習進度與等第追蹤
              </h4>

              {summaries.length === 0 ? (
                <div className="text-center py-10 bg-stone-50 rounded-2xl border border-stone-200">
                  <Users className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                  <p className="text-stone-500 text-sm font-medium">目前尚未有學生登入作答</p>
                  <p className="text-xs text-stone-400 mt-1">
                    請至「學生帳號制定」分頁生成並發放帳號給同學！
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {summaries.map((summary) => (
                    <div
                      key={summary.user.id}
                      onClick={() => setSelectedStudent(summary)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                        selectedStudent?.user.id === summary.user.id
                          ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20'
                          : 'border-stone-200 bg-white hover:border-amber-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-amber-700 text-white font-bold flex items-center justify-center font-serif-tc shadow-xs">
                            {summary.user.seatNumber || summary.user.displayName.slice(0, 1)}
                          </div>
                          <div>
                            <div className="font-bold text-stone-900 text-sm">
                              {summary.user.displayName}
                            </div>
                            <div className="text-[11px] text-stone-400">
                              座號: {summary.user.seatNumber || '無'} ｜ 帳號: {summary.user.username || summary.user.id}
                            </div>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                          {summary.latestGrade}
                        </span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-stone-100 grid grid-cols-3 gap-2 text-center text-xs text-stone-600">
                        <div>
                          <span className="text-[10px] text-stone-400 block">已掌握</span>
                          <strong className="text-emerald-700">{summary.totalMastered}</strong> 詞
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block">平均分數</span>
                          <strong className="text-stone-900">{summary.averageScore}</strong> 分
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block">錯題數</span>
                          <strong className="text-rose-700">{summary.totalMistakes}</strong> 題
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: ACCOUNT QUOTA & ROSTER MANAGEMENT (老師制定帳號數量)
           ========================================================================= */}
        {activeTab === 'accounts' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Quota Control Banner */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-700" />
                  帳號數量由老師制定
                </span>
                <h4 className="text-base font-bold text-stone-900 mt-1">
                  目前班級使用上限：{classSettings.accountLimit} 位學生
                </h4>
                <p className="text-xs text-stone-600 mt-0.5">
                  非自由註冊機制，學生必須持有老師發放之帳號密碼方能登入作答，成績直接存入雲端。
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-amber-300 shadow-2xs">
                <span className="text-xs font-bold text-stone-700">調整上限：</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={editingQuota}
                  onChange={(e) => setEditingQuota(parseInt(e.target.value, 10) || 1)}
                  className="w-16 px-2 py-1 border border-stone-300 rounded-lg text-sm font-bold text-center"
                />
                <button
                  type="button"
                  disabled={isSavingQuota || editingQuota === classSettings.accountLimit}
                  onClick={handleSaveQuota}
                  className="px-3 py-1 rounded-lg bg-amber-700 hover:bg-amber-800 disabled:opacity-40 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <Save className="w-3 h-3" />
                  <span>儲存</span>
                </button>
              </div>
            </div>

            {/* Batch & Single Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-stone-900">
                  學生名冊清單（已建置 {studentAccounts.length} / 上限 {classSettings.accountLimit} 個）
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSingle(!isAddingSingle)}
                  className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>單獨新增學生</span>
                </button>

                <button
                  type="button"
                  onClick={handleBatchGenerate}
                  className="px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>一鍵批次生成全班帳號 ({batchCount}位)</span>
                </button>
              </div>
            </div>

            {/* Single Add Form */}
            {isAddingSingle && (
              <form
                onSubmit={handleCreateSingle}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 animate-fade-in"
              >
                <div className="text-xs font-bold text-stone-700">新增個別學生帳號：</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <input
                    type="text"
                    placeholder="座號 (例如: 01)"
                    value={newSeat}
                    onChange={(e) => setNewSeat(e.target.value)}
                    className="px-3 py-2 bg-white rounded-xl border border-stone-300 text-xs font-medium"
                    required
                  />
                  <input
                    type="text"
                    placeholder="姓名 (例如: 王小明)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="px-3 py-2 bg-white rounded-xl border border-stone-300 text-xs font-medium"
                    required
                  />
                  <input
                    type="text"
                    placeholder="帳號 (例如: student01)"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="px-3 py-2 bg-white rounded-xl border border-stone-300 text-xs font-medium"
                    required
                  />
                  <input
                    type="text"
                    placeholder="密碼 (預設: 8888)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="px-3 py-2 bg-white rounded-xl border border-stone-300 text-xs font-medium"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingSingle(false)}
                    className="px-3 py-1.5 rounded-xl text-stone-500 hover:bg-stone-200 text-xs font-medium cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition cursor-pointer"
                  >
                    確認新增並儲存至雲端
                  </button>
                </div>
              </form>
            )}

            {/* Account Roster Table */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100/80 text-stone-600 font-bold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">座號</th>
                    <th className="py-3 px-4">學生姓名</th>
                    <th className="py-3 px-4">登入帳號</th>
                    <th className="py-3 px-4">密碼</th>
                    <th className="py-3 px-4 text-center">帳號狀態</th>
                    <th className="py-3 px-4">最後登入</th>
                    <th className="py-3 px-4 text-right">管理操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {studentAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-400">
                        尚無任何學生帳號，請點擊「一鍵批次生成全班帳號」開始建置！
                      </td>
                    </tr>
                  ) : (
                    studentAccounts.map((acc) => (
                      <tr key={acc.id} className="hover:bg-amber-50/30 transition">
                        <td className="py-3 px-4 font-extrabold text-amber-900 font-serif-tc">
                          {acc.seatNumber || '-'}
                        </td>
                        <td className="py-3 px-4 font-bold text-stone-900">
                          {acc.displayName}
                        </td>
                        <td className="py-3 px-4 font-mono text-stone-600">
                          {acc.username}
                        </td>
                        <td className="py-3 px-4 font-mono text-stone-500">
                          {acc.password}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(acc)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition ${
                              acc.isActive
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-stone-100 text-stone-400 border border-stone-200'
                            }`}
                            title="點擊切換停用/啟用"
                          >
                            {acc.isActive ? (
                              <>
                                <UserCheck className="w-3 h-3 text-emerald-600" />
                                <span>已開通</span>
                              </>
                            ) : (
                              <>
                                <UserX className="w-3 h-3 text-stone-400" />
                                <span>已停用</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-stone-400 text-[11px]">
                          {acc.lastLoginAt
                            ? new Date(acc.lastLoginAt).toLocaleDateString('zh-TW', {
                                month: 'numeric',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '尚未登入'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteAccount(acc)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                            title="刪除帳號"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: PRINTABLE ACCOUNT CARDS (發放小卡)
           ========================================================================= */}
        {activeTab === 'print_cards' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 print:hidden">
              <div>
                <h4 className="font-bold text-stone-900 text-sm">
                  學生帳號發放小卡（附虛線裁切格）
                </h4>
                <p className="text-xs text-stone-500">
                  可直接使用瀏覽器列印，裁切後發放給全班同學登入練習
                </p>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>立即列印小卡</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 print:grid-cols-3">
              {studentAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className="border-2 border-dashed border-stone-300 rounded-2xl p-4 bg-stone-50/50 print:bg-white text-stone-800 space-y-2 relative"
                >
                  <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                    <span className="font-extrabold text-xs text-amber-900">
                      國文會考衝刺專用帳號卡
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                      座號 {acc.seatNumber}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div>
                      學生姓名：<strong className="text-stone-900">{acc.displayName}</strong>
                    </div>
                    <div>
                      登入帳號：<strong className="font-mono text-amber-800">{acc.username}</strong>
                    </div>
                    <div>
                      預設密碼：<strong className="font-mono text-stone-700">{acc.password}</strong>
                    </div>
                  </div>

                  <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-200">
                    請保管妥當，測驗成績與錯題將自動同步至雲端。
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
