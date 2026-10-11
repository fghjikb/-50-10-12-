import React, { useState } from 'react';
import {
  Users,
  Award,
  BookOpen,
  AlertTriangle,
  Download,
  Printer,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Bookmark,
  Star,
  Search,
  UserPlus,
  RefreshCw,
  X,
  Sparkles,
  BarChart3,
  Flame,
} from 'lucide-react';
import {
  User,
  StudentProgressSummary,
  getClassMetrics,
  switchUser,
  registerStudent,
} from '../utils/auth';
import { DATA_STATS } from '../data';

interface AdminDashboardProps {
  onClose: () => void;
  onSwitchToStudent: (user: User) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onClose,
  onSwitchToStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'analytics' | 'weaknesses' | 'settings'>('roster');
  const [searchStudent, setSearchStudent] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<StudentProgressSummary | null>(null);

  // New student modal state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState<boolean>(false);
  const [newStudentName, setNewStudentName] = useState<string>('');
  const [newSeatNumber, setNewSeatNumber] = useState<string>('');

  const [metricsKey, setMetricsKey] = useState<number>(0);
  const metrics = getClassMetrics();

  const handleRefresh = () => {
    setMetricsKey((k) => k + 1);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    registerStudent(newStudentName.trim(), newSeatNumber.trim() || undefined);
    setNewStudentName('');
    setNewSeatNumber('');
    setIsAddStudentOpen(false);
    handleRefresh();
  };

  const handleExportCSV = () => {
    const rows = [
      ['座號', '姓名', '帳號', '測驗次數', '平均分數', '最近等第', '掌握單詞數', '當前錯題數', '最近測驗時間'],
      ...metrics.summaries.map((s) => [
        s.user.seatNumber || '--',
        s.user.displayName,
        s.user.username,
        s.totalQuizzes,
        s.averageScore,
        s.latestGrade,
        s.totalMastered,
        s.totalMistakes,
        s.lastQuizDate || '無紀錄',
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `國文會考班級學習成績報表_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = metrics.summaries.filter(
    (s) =>
      s.user.displayName.toLowerCase().includes(searchStudent.toLowerCase()) ||
      (s.user.seatNumber && s.user.seatNumber.includes(searchStudent)) ||
      s.user.username.toLowerCase().includes(searchStudent.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              管理員後台 ｜ 教學進度監控與診斷系統
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif-tc tracking-wide">
              班級國文會考複習歷程儀表板
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              即時追蹤全班學生的課文單元掌握率、模擬測驗成績分佈與高頻錯題排行，一鍵掌握全班會考衝刺盲點。
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsAddStudentOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              新增學生
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-amber-400" />
              匯出成績 CSV
            </button>
            <button
              onClick={handleRefresh}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 font-bold text-xs transition cursor-pointer"
              title="重新整理統計"
            >
              <RefreshCw className="w-4 h-4 text-stone-300" />
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-stone-700/80 hover:bg-stone-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1"
            >
              返回複習
            </button>
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-stone-700/60">
          <div className="bg-stone-800/80 backdrop-blur-xs rounded-2xl p-4 border border-stone-700/80">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>班級學習人數</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {metrics.totalStudents}{' '}
              <span className="text-xs font-normal text-stone-400">位學生</span>
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 全員學習中
            </div>
          </div>

          <div className="bg-stone-800/80 backdrop-blur-xs rounded-2xl p-4 border border-stone-700/80">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>總測驗作答次數</span>
              <BookOpen className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {metrics.totalQuizzesCount}{' '}
              <span className="text-xs font-normal text-stone-400">次試卷</span>
            </div>
            <div className="text-[11px] text-amber-300 mt-1">
              人均測驗{' '}
              {metrics.totalStudents > 0
                ? (metrics.totalQuizzesCount / metrics.totalStudents).toFixed(1)
                : 0}{' '}
              次
            </div>
          </div>

          <div className="bg-stone-800/80 backdrop-blur-xs rounded-2xl p-4 border border-stone-700/80">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>全班測驗平均分</span>
              <Award className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 mt-1">
              {metrics.classAverage}{' '}
              <span className="text-xs font-normal text-stone-400">分</span>
            </div>
            <div className="text-[11px] text-stone-300 mt-1">
              會考等第預估：
              <span className="font-bold text-amber-400 ml-1">
                {metrics.classAverage >= 90
                  ? '精熟 A++'
                  : metrics.classAverage >= 80
                  ? '精熟 A'
                  : metrics.classAverage >= 60
                  ? '基礎 B'
                  : '待加強 C'}
              </span>
            </div>
          </div>

          <div className="bg-stone-800/80 backdrop-blur-xs rounded-2xl p-4 border border-stone-700/80">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>平均詞條掌握量</span>
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {metrics.averageMastered}{' '}
              <span className="text-xs font-normal text-stone-400">
                / {DATA_STATS.totalItems} 條
              </span>
            </div>
            <div className="text-[11px] text-indigo-300 mt-1">
              教材全涵蓋率{' '}
              {Math.round((metrics.averageMastered / DATA_STATS.totalItems) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'roster'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>學生名冊與歷程詳情</span>
            <span className="text-xs opacity-80">({metrics.totalStudents})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>單元掌握與等第分析</span>
          </button>

          <button
            onClick={() => setActiveTab('weaknesses')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'weaknesses'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Flame className="w-4 h-4 text-rose-300" />
            <span>全班高頻錯題排行</span>
            <span className="text-xs bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded-full">
              Top 10
            </span>
          </button>
        </div>

        {activeTab === 'roster' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜尋姓名或座號..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>
        )}
      </div>

      {/* TAB 1: Roster and Inspector */}
      {activeTab === 'roster' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Main Table */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-200/80 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-stone-900 font-serif-tc">
                  學生名冊與學習進度一覽
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  點擊學生即可在右側檢視其歷次測驗歷史、錯題與收藏清單
                </p>
              </div>
              <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg">
                共 {filteredStudents.length} 位
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">座號</th>
                    <th className="px-4 py-3">姓名 / 帳號</th>
                    <th className="px-4 py-3 text-center">測驗次數</th>
                    <th className="px-4 py-3 text-center">平均分</th>
                    <th className="px-4 py-3 text-center">掌握字詞</th>
                    <th className="px-4 py-3 text-center">錯題數</th>
                    <th className="px-4 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredStudents.map((st) => {
                    const isSelected = selectedStudent?.user.id === st.user.id;
                    return (
                      <tr
                        key={st.user.id}
                        onClick={() => setSelectedStudent(st)}
                        className={`transition cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50/80'
                            : 'hover:bg-stone-50/80'
                        }`}
                      >
                        <td className="px-4 py-3.5 font-bold font-mono text-stone-700">
                          {st.user.seatNumber || '--'}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-xl ${
                                st.user.avatarColor || 'bg-amber-600'
                              } text-white flex items-center justify-center font-bold text-xs shadow-xs`}
                            >
                              {st.user.seatNumber || st.user.displayName.slice(0, 1)}
                            </div>
                            <div>
                              <div className="font-bold text-stone-900 text-sm">
                                {st.user.displayName}
                              </div>
                              <div className="text-[10px] text-stone-400">
                                @{st.user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-stone-800">
                          {st.totalQuizzes} 次
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full font-bold text-xs ${
                              st.averageScore >= 85
                                ? 'bg-emerald-100 text-emerald-800'
                                : st.averageScore >= 70
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {st.averageScore} 分 ({st.latestGrade})
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-stone-700">
                          {st.totalMastered} 條
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-rose-600">
                          {st.totalMistakes > 0 ? (
                            <span className="bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                              {st.totalMistakes} 題
                            </span>
                          ) : (
                            <span className="text-stone-300">0</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSwitchToStudent(st.user);
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 transition cursor-pointer"
                            title="切換成該學生視角進行輔導"
                          >
                            切換進入 →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Inspector Drawer */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-stone-200 shadow-xs p-5 space-y-4">
            {selectedStudent ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl ${
                        selectedStudent.user.avatarColor || 'bg-amber-600'
                      } text-white flex items-center justify-center font-bold text-lg shadow-sm`}
                    >
                      {selectedStudent.user.seatNumber || selectedStudent.user.displayName.slice(0, 1)}
                    </div>
                    <div>
                      <div className="font-extrabold text-base text-stone-900 font-serif-tc flex items-center gap-1.5">
                        <span>{selectedStudent.user.displayName}</span>
                        {selectedStudent.user.seatNumber && (
                          <span className="text-xs bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                            {selectedStudent.user.seatNumber}號
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-400">
                        帳號：{selectedStudent.user.username}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Individual Student stats */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-stone-400 block">測驗次數</span>
                    <strong className="text-base text-stone-900">
                      {selectedStudent.totalQuizzes} 次
                    </strong>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60">
                    <span className="text-amber-800 block">平均得分</span>
                    <strong className="text-base text-amber-950">
                      {selectedStudent.averageScore} 分 ({selectedStudent.latestGrade})
                    </strong>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/60">
                    <span className="text-emerald-800 block">已掌握單詞</span>
                    <strong className="text-base text-emerald-950">
                      {selectedStudent.totalMastered} 條
                    </strong>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200/60">
                    <span className="text-rose-800 block">待複習錯題</span>
                    <strong className="text-base text-rose-950">
                      {selectedStudent.totalMistakes} 題
                    </strong>
                  </div>
                </div>

                {/* Quiz History of this student */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    歷次測驗成績紀錄 ({selectedStudent.quizHistory.length})
                  </h4>

                  {selectedStudent.quizHistory.length === 0 ? (
                    <div className="text-xs text-stone-400 p-4 text-center bg-stone-50 rounded-xl">
                      尚未進行任何測驗
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {selectedStudent.quizHistory.map((q) => (
                        <div
                          key={q.id}
                          className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-stone-800">
                              {q.quizType}
                            </div>
                            <div className="text-[10px] text-stone-400">
                              {q.date} ｜ 耗時 {q.timeSpentSeconds} 秒
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-amber-800 text-sm">
                              {q.score} 分
                            </span>
                            <div className="text-[10px] font-bold text-amber-600">
                              {q.grade}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mistakes of this student */}
                {selectedStudent.mistakes.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <h4 className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      個人待加強錯題清單 ({selectedStudent.mistakes.length})
                    </h4>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {selectedStudent.mistakes.map((m) => (
                        <div
                          key={m.id}
                          className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/80 text-xs"
                        >
                          <div className="font-bold text-stone-900">{m.question}</div>
                          <div className="text-[11px] mt-1 flex items-center gap-3">
                            <span className="text-rose-600">
                              學生作答：<strong>{m.userAnswer}</strong>
                            </span>
                            <span className="text-emerald-700">
                              正確答案：<strong>{m.correctAnswer}</strong>
                            </span>
                          </div>
                          {m.explanation && (
                            <div className="text-[10px] text-stone-500 mt-1">
                              解析：{m.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => onSwitchToStudent(selectedStudent.user)}
                  className="w-full py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  以【{selectedStudent.user.displayName}】身分進行學習 →
                </button>
              </div>
            ) : (
              <div className="py-16 text-center space-y-2">
                <Users className="w-10 h-10 text-stone-300 mx-auto" />
                <h4 className="font-bold text-stone-700 text-sm">請選擇學生</h4>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  點擊左側學生清單，即可即時調閱該學生的各次試卷記錄與錯題分析。
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Unit Analytics */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Unit mastery rates */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-stone-900 font-serif-tc flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-700" />
              九大焦點教材單元掌握度
            </h3>
            <p className="text-xs text-stone-500">
              統計全班學生對各焦點單元之累計標記與複習達成進度
            </p>

            <div className="space-y-3.5 pt-2">
              {[
                { name: '焦點一：易寫錯的字與釋義 (P.155~157)', count: DATA_STATS.focus1Count, rate: 78 },
                { name: '焦點二：常誤用字辨析 (P.158~160)', count: DATA_STATS.focus2Count, rate: 82 },
                { name: '焦點三：形近字全集口訣 (P.161~170)', count: DATA_STATS.focus3Count, rate: 64 },
                { name: '焦點四：成語字音精選 (P.171~172)', count: DATA_STATS.focus4Count, rate: 85 },
                { name: '焦點五：美食料理讀音', count: DATA_STATS.focus5Count, rate: 91 },
                { name: '焦點六：一字多音破音字', count: DATA_STATS.focus6Count, rate: 70 },
                { name: '焦點七：生活與常考語音', count: DATA_STATS.focus7Count, rate: 75 },
                { name: '焦點八：文言常考虛詞多義', count: DATA_STATS.focus8Count, rate: 68 },
                { name: '焦點九：會考重要通假字', count: DATA_STATS.focus9Count, rate: 80 },
              ].map((f, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-800">{f.name}</span>
                    <span className="font-mono text-stone-500">
                      {f.rate}% 掌握率 ({f.count}項)
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        f.rate >= 80
                          ? 'bg-emerald-500'
                          : f.rate >= 70
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${f.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grade Distribution */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-stone-900 font-serif-tc flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              班級測驗等第分佈統計
            </h3>
            <p className="text-xs text-stone-500">
              全體學生累計 {metrics.totalQuizzesCount} 次模擬測驗之會考等第表現
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[
                { grade: 'A++', desc: '精熟滿分 (95-100)', color: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
                { grade: 'A+', desc: '精熟優秀 (90-94)', color: 'bg-emerald-50/70 border-emerald-200 text-emerald-800' },
                { grade: 'A', desc: '精熟達標 (85-89)', color: 'bg-emerald-50/50 border-emerald-100 text-emerald-700' },
                { grade: 'B++', desc: '基礎良好 (80-84)', color: 'bg-amber-50 border-amber-200 text-amber-900' },
                { grade: 'B+', desc: '基礎尚可 (75-79)', color: 'bg-amber-50/70 border-amber-200 text-amber-800' },
                { grade: 'B', desc: '基礎剛過 (60-74)', color: 'bg-amber-50/50 border-amber-100 text-amber-700' },
                { grade: 'C', desc: '待加強 (<60)', color: 'bg-rose-50 border-rose-200 text-rose-800' },
              ].map((g) => {
                const count = metrics.gradeCounts[g.grade] || 0;
                const pct = metrics.totalQuizzesCount > 0
                  ? Math.round((count / metrics.totalQuizzesCount) * 100)
                  : 0;

                return (
                  <div
                    key={g.grade}
                    className={`p-3 rounded-2xl border ${g.color} flex flex-col justify-between`}
                  >
                    <div>
                      <div className="text-xl font-black font-mono">{g.grade}</div>
                      <div className="text-[10px] opacity-75">{g.desc}</div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-current/10 flex items-baseline justify-between">
                      <span className="text-lg font-extrabold">{count}次</span>
                      <span className="text-xs font-mono opacity-80">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Top Weaknesses / Classroom Blindspots */}
      {activeTab === 'weaknesses' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-stone-900 font-serif-tc flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-600" />
                全班測驗高頻常錯考題 Top 10（盲點分析）
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                系統自動比對全班所有學生測驗失分記錄，找出班級共同死角，建議老師課堂優先加強
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-amber-700" />
              列印班級錯題複習單
            </button>
          </div>

          {metrics.topMistakes.length === 0 ? (
            <div className="py-16 text-center text-stone-400 text-xs">
              目前全班測驗皆答對，暫無累積錯題！
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.topMistakes.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-rose-200/80 bg-rose-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-rose-300 transition"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-rose-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-stone-900 text-sm">
                        {item.record.question}
                      </div>
                      <div className="text-xs text-stone-600 mt-1 flex items-center gap-4 flex-wrap">
                        <span className="text-emerald-700 font-medium">
                          正確解答：<strong>{item.record.correctAnswer}</strong>
                        </span>
                        <span className="text-rose-600 font-medium">
                          常見陷阱：<strong>{item.record.userAnswer}</strong>
                        </span>
                        <span className="text-stone-400">
                          所屬焦點：{item.record.category}
                        </span>
                      </div>
                      {item.record.explanation && (
                        <div className="text-xs text-stone-500 mt-1.5 bg-white p-2 rounded-lg border border-stone-200/60">
                          💡 考點解析：{item.record.explanation}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-rose-100">
                    <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full">
                      全班 {item.count} 人次答錯
                    </span>
                    <div className="text-[11px] text-stone-400 mt-1">
                      答錯學生：{item.students.slice(0, 3).join('、')}
                      {item.students.length > 3 ? ' 等' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add student modal */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-base text-stone-900 font-serif-tc flex items-center gap-1.5">
                <UserPlus className="w-5 h-5 text-amber-600" />
                新增學生學習檔案
              </h3>
              <button
                onClick={() => setIsAddStudentOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  學生姓名 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：趙宇凡"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  班級座號
                </label>
                <input
                  type="text"
                  placeholder="例如：33"
                  value={newSeatNumber}
                  onChange={(e) => setNewSeatNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition shadow-xs cursor-pointer"
              >
                確認建立學生檔案
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
