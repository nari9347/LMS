import React, { useContext, useMemo, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Bot, CalendarCheck2, CalendarClock, ClipboardList, Loader2, RefreshCw, Trophy, X } from 'lucide-react';
import { BACKEND_URL } from '../context/AuthContext';

const getId = (value) => {
  if (value && typeof value === 'object') return value._id || value.id;
  return value;
};

const isNumericGrade = (grade) => {
  if (grade === undefined || grade === null) return false;
  const val = Number(grade);
  return !Number.isNaN(val);
};

const StudentAssistantChat = ({ dashboardData }) => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState('assignments');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  const loadInsights = async () => {
    if (loading || !dashboardData || !user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const courses = dashboardData.courses || [];

      const pendingAssignments = [...(dashboardData.pendingAssignments || [])]
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

      const urgentAssignment = pendingAssignments[0] || null;

      // Attendance tracker
      let totalAttendanceRecords = 0;
      let presentOrLate = 0;
      let absentCount = 0;

      for (const course of courses) {
        const attendanceRes = await axios
          .get(`${BACKEND_URL}/api/attendance/${course._id}`, { headers })
          .catch(() => ({ data: [] }));

        for (const dayRecord of attendanceRes.data || []) {
          const myRow = (dayRecord.records || []).find((row) => {
            const sid = String(getId(row.student));
            return sid === String(user._id || user.id);
          });

          if (!myRow) continue;

          totalAttendanceRecords += 1;
          if (myRow.status === 'Present' || myRow.status === 'Late') presentOrLate += 1;
          if (myRow.status === 'Absent') absentCount += 1;
        }
      }

      const attendancePercent = totalAttendanceRecords > 0
        ? Math.round((presentOrLate / totalAttendanceRecords) * 100)
        : 0;

      // Exam planner
      const testsByCourse = [];
      let totalTests = 0;
      for (const course of courses) {
        const testRes = await axios
          .get(`${BACKEND_URL}/api/test/${course._id}`, { headers })
          .catch(() => ({ data: [] }));

        const list = testRes.data || [];
        totalTests += list.length;
        testsByCourse.push({
          courseTitle: course.title,
          tests: list.slice(0, 3)
        });
      }

      // Marks + rank insights
      const gradedSubs = (dashboardData.recentSubmissions || []).filter((s) => isNumericGrade(s.grade));
      const myAverage = gradedSubs.length > 0
        ? (gradedSubs.reduce((acc, s) => acc + Number(s.grade), 0) / gradedSubs.length)
        : 0;

      let bestRank = null;
      let lastRankedCourse = '';

      for (const course of courses) {
        const subsRes = await axios
          .get(`${BACKEND_URL}/api/assignment/course/${course._id}/submissions-all`, { headers })
          .catch(() => ({ data: [] }));

        const grouped = {};
        for (const sub of subsRes.data || []) {
          if (!isNumericGrade(sub.grade)) continue;
          const sid = String(getId(sub.student));
          const sname = sub.student?.name || 'Student';
          if (!grouped[sid]) grouped[sid] = { name: sname, total: 0, count: 0 };
          grouped[sid].total += Number(sub.grade);
          grouped[sid].count += 1;
        }

        const leaderboard = Object.entries(grouped)
          .map(([sid, val]) => ({ id: sid, avg: val.total / val.count }))
          .sort((a, b) => b.avg - a.avg);

        const myIndex = leaderboard.findIndex((item) => item.id === String(user._id || user.id));
        if (myIndex !== -1) {
          const rank = myIndex + 1;
          if (bestRank === null || rank < bestRank) {
            bestRank = rank;
            lastRankedCourse = course.title;
          }
        }
      }

      setInsights({
        assignments: {
          pendingCount: pendingAssignments.length,
          urgentAssignment,
          pendingAssignments: pendingAssignments.slice(0, 5)
        },
        attendance: {
          percent: attendancePercent,
          absentCount,
          safeLevel: attendancePercent >= 75
        },
        exams: {
          totalTests,
          testsByCourse
        },
        marks: {
          average: myAverage,
          bestRank,
          rankCourse: lastRankedCourse
        }
      });
    } catch (err) {
      console.error('Student assistant insight error', err);
      setInsights({
        assignments: { pendingCount: 0, urgentAssignment: null, pendingAssignments: [] },
        attendance: { percent: 0, absentCount: 0, safeLevel: false },
        exams: { totalTests: 0, testsByCourse: [] },
        marks: { average: 0, bestRank: null, rankCourse: '' }
      });
    } finally {
      setLoading(false);
    }
  };

  const panel = useMemo(() => {
    if (!insights) return null;

    if (activePanel === 'assignments') {
      return (
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Pending Assignments:</strong> {insights.assignments.pendingCount}</p>
          {insights.assignments.urgentAssignment ? (
            <p>
              <strong>Urgent:</strong> {insights.assignments.urgentAssignment.title} ({new Date(insights.assignments.urgentAssignment.dueDate).toLocaleDateString()})
            </p>
          ) : (
            <p>All assignments completed.</p>
          )}
          {insights.assignments.pendingAssignments.map((a) => (
            <p key={a._id}>• {a.title}</p>
          ))}
        </div>
      );
    }

    if (activePanel === 'attendance') {
      return (
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Attendance:</strong> {insights.attendance.percent}%</p>
          <p><strong>Absences:</strong> {insights.attendance.absentCount}</p>
          <p>
            <strong>Status:</strong> {insights.attendance.safeLevel ? 'Safe (>= 75%)' : 'Warning (below 75%)'}
          </p>
        </div>
      );
    }

    if (activePanel === 'exams') {
      return (
        <div className="space-y-3 text-sm text-gray-700 max-h-64 overflow-y-auto pr-1">
          <p><strong>Near Exams / Tests:</strong> {insights.exams.totalTests}</p>
          {insights.exams.totalTests === 0 ? (
            <p>No tests scheduled yet by teachers.</p>
          ) : (
            insights.exams.testsByCourse.map((c) => (
              <div key={c.courseTitle}>
                <p className="font-semibold text-gray-900">{c.courseTitle}</p>
                {(c.tests || []).map((t) => (
                  <p key={t._id}>• {t.title}</p>
                ))}
              </div>
            ))
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2 text-sm text-gray-700">
        <p><strong>Average Marks:</strong> {insights.marks.average.toFixed(1)}</p>
        {insights.marks.bestRank ? (
          <p><strong>Best Rank:</strong> #{insights.marks.bestRank} in {insights.marks.rankCourse}</p>
        ) : (
          <p>Rank not available yet (need more graded submissions).</p>
        )}
      </div>
    );
  }, [activePanel, insights]);

  return (
    <>
      <button
        onClick={() => {
          const nextOpen = !isOpen;
          setIsOpen(nextOpen);
          if (nextOpen) loadInsights();
        }}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-indigo-600 text-white shadow-2xl hover:bg-indigo-700 transition"
        aria-label="Open student assistant"
      >
        <Bot className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between">
            <div>
              <p className="font-bold">Student Assistant</p>
              <p className="text-xs text-indigo-100">Assignments, attendance, exams and marks</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={loadInsights} className="p-1.5 rounded hover:bg-white/15" title="Refresh insights">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded hover:bg-white/15">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 bg-gray-50 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setActivePanel('assignments')} className="px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-indigo-300 text-sm font-semibold text-gray-700 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-indigo-600" /> Assignments
              </button>
              <button onClick={() => setActivePanel('attendance')} className="px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-indigo-300 text-sm font-semibold text-gray-700 flex items-center gap-2">
                <CalendarCheck2 className="w-4 h-4 text-emerald-600" /> Attendance
              </button>
              <button onClick={() => setActivePanel('exams')} className="px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-indigo-300 text-sm font-semibold text-gray-700 flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-orange-600" /> Exams
              </button>
              <button onClick={() => setActivePanel('marks')} className="px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-indigo-300 text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-violet-600" /> Marks
              </button>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-3 min-h-[170px]">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading insights...
                </div>
              ) : (
                panel
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentAssistantChat;
