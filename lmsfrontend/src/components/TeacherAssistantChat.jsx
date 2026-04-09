import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { Bot, CalendarCheck2, ClipboardList, Loader2, RefreshCw, Sparkles, Trophy, X } from 'lucide-react';
import { BACKEND_URL } from '../context/AuthContext';

const isPendingGrade = (grade) => {
  if (grade === undefined || grade === null) return true;
  const g = String(grade).trim().toLowerCase();
  return g === '' || g === 'pending';
};

const getId = (value) => {
  if (value && typeof value === 'object') return value._id || value.id;
  return value;
};

const getName = (value, fallback = 'Student') => {
  if (value && typeof value === 'object') return value.name || fallback;
  return fallback;
};

const TeacherAssistantChat = ({ courses = [], onOpenCourse }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [activePanel, setActivePanel] = useState('health');

  const loadInsights = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const courseSnapshots = [];
      const attendanceAll = [];

      for (const course of courses) {
        const assignmentsRes = await axios.get(`${BACKEND_URL}/api/assignment/course/${course._id}`, { headers });
        const assignments = assignmentsRes.data || [];

        const submissionsNested = await Promise.all(
          assignments.map(async (assignment) => {
            const subRes = await axios.get(`${BACKEND_URL}/api/assignment/submissions/${assignment._id}`, { headers });
            return (subRes.data || []).map((sub) => ({ ...sub, assignmentTitle: assignment.title, assignmentId: assignment._id }));
          })
        );

        const attendanceRes = await axios.get(`${BACKEND_URL}/api/attendance/${course._id}`, { headers }).catch(() => ({ data: [] }));

        courseSnapshots.push({
          course,
          assignments,
          submissions: submissionsNested.flat()
        });

        attendanceAll.push({
          course,
          records: attendanceRes.data || []
        });
      }

      const allAssignments = courseSnapshots.flatMap((c) => c.assignments.map((a) => ({ ...a, course: c.course })));
      const allSubmissions = courseSnapshots.flatMap((c) => c.submissions.map((s) => ({ ...s, course: c.course })));

      const pendingToGrade = allSubmissions.filter((s) => isPendingGrade(s.grade));

      const missingByAssignment = [];
      for (const snapshot of courseSnapshots) {
        const enrolled = (snapshot.course.students || []).map((s) => ({ id: String(getId(s)), name: getName(s, 'Student') }));

        for (const assignment of snapshot.assignments) {
          const submittedIds = new Set(
            snapshot.submissions
              .filter((s) => String(getId(s.assignment)) === String(assignment._id) || String(s.assignmentId) === String(assignment._id))
              .map((s) => String(getId(s.student)))
          );

          const missingStudents = enrolled.filter((s) => !submittedIds.has(s.id));
          if (missingStudents.length > 0) {
            missingByAssignment.push({
              assignmentTitle: assignment.title,
              courseTitle: snapshot.course.title,
              missingStudents
            });
          }
        }
      }

      const attendanceStudentMap = {};
      let todayPresent = 0;
      let todayAbsent = 0;
      let todayLate = 0;
      const todayKey = new Date().toDateString();

      for (const courseBlock of attendanceAll) {
        for (const dayRecord of courseBlock.records) {
          const sameDay = new Date(dayRecord.date).toDateString() === todayKey;

          for (const row of dayRecord.records || []) {
            const sid = String(getId(row.student));
            const sname = getName(row.student, 'Student');

            if (!attendanceStudentMap[sid]) {
              attendanceStudentMap[sid] = { name: sname, presentLike: 0, total: 0 };
            }

            attendanceStudentMap[sid].total += 1;
            if (row.status === 'Present' || row.status === 'Late') {
              attendanceStudentMap[sid].presentLike += 1;
            }

            if (sameDay) {
              if (row.status === 'Present') todayPresent += 1;
              if (row.status === 'Absent') todayAbsent += 1;
              if (row.status === 'Late') todayLate += 1;
            }
          }
        }
      }

      const lowAttendance = Object.values(attendanceStudentMap)
        .map((s) => ({
          name: s.name,
          percentage: s.total > 0 ? Math.round((s.presentLike / s.total) * 100) : 0
        }))
        .filter((s) => s.percentage < 75)
        .sort((a, b) => a.percentage - b.percentage);

      setInsights({
        classHealth: {
          courses: courses.length,
          assignments: allAssignments.length,
          students: [...new Set(courses.flatMap((c) => (c.students || []).map((s) => String(getId(s)))))].length,
          pendingGrades: pendingToGrade.length
        },
        pendingToGrade,
        missingByAssignment,
        lowAttendance,
        todayAttendance: { present: todayPresent, absent: todayAbsent, late: todayLate }
      });
    } catch (err) {
      console.error('Teacher assistant insight error', err);
      setInsights({
        classHealth: { courses: courses.length, assignments: 0, students: 0, pendingGrades: 0 },
        pendingToGrade: [],
        missingByAssignment: [],
        lowAttendance: [],
        todayAttendance: { present: 0, absent: 0, late: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  const panel = useMemo(() => {
    if (!insights) return null;

    if (activePanel === 'health') {
      return (
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Courses:</strong> {insights.classHealth.courses}</p>
          <p><strong>Total Students:</strong> {insights.classHealth.students}</p>
          <p><strong>Total Assignments:</strong> {insights.classHealth.assignments}</p>
          <p><strong>Pending Grading:</strong> {insights.classHealth.pendingGrades}</p>
        </div>
      );
    }

    if (activePanel === 'pending') {
      return (
        <div className="space-y-3 text-sm text-gray-700 max-h-64 overflow-y-auto pr-1">
          <div>
            <p className="font-semibold text-gray-900 mb-1">Ungraded Submissions</p>
            {insights.pendingToGrade.length === 0 ? (
              <p>Everything is graded.</p>
            ) : (
              insights.pendingToGrade.slice(0, 6).map((item) => (
                <p key={item._id}>• {getName(item.student)} - {item.assignmentTitle}</p>
              ))
            )}
          </div>

          <div>
            <p className="font-semibold text-gray-900 mb-1">Missing Submissions</p>
            {insights.missingByAssignment.length === 0 ? (
              <p>No missing submissions right now.</p>
            ) : (
              insights.missingByAssignment.slice(0, 4).map((row, idx) => (
                <p key={`${row.assignmentTitle}-${idx}`}>
                  • {row.courseTitle} / {row.assignmentTitle}: {row.missingStudents.length} pending
                </p>
              ))
            )}
          </div>
        </div>
      );
    }

    if (activePanel === 'attendance') {
      return (
        <div className="space-y-3 text-sm text-gray-700 max-h-64 overflow-y-auto pr-1">
          <div>
            <p className="font-semibold text-gray-900 mb-1">Today Attendance Summary</p>
            <p>Present: {insights.todayAttendance.present}</p>
            <p>Absent: {insights.todayAttendance.absent}</p>
            <p>Late: {insights.todayAttendance.late}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-900 mb-1">Below 75% Attendance</p>
            {insights.lowAttendance.length === 0 ? (
              <p>No low-attendance alerts.</p>
            ) : (
              insights.lowAttendance.slice(0, 6).map((student, idx) => (
                <p key={`${student.name}-${idx}`}>• {student.name} - {student.percentage}%</p>
              ))
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3 text-sm text-gray-700">
        <p className="font-semibold text-gray-900">Quick Assignment Actions</p>
        <p>• Open a course dashboard and click <strong>+ New Assignment</strong> to create instantly.</p>
        <p>• Send reminder template: <strong>"Please submit before due date to avoid missing marks."</strong></p>
        <p>• Duplicate workflow: open old assignment, copy title/description, set new due date.</p>

        <div className="pt-2 space-y-2">
          {courses.length === 0 && <p>No courses available.</p>}
          {courses.slice(0, 3).map((c) => (
            <button
              key={c._id}
              onClick={() => onOpenCourse?.(c)}
              className="w-full text-left px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold"
            >
              Open {c.title}
            </button>
          ))}
        </div>
      </div>
    );
  }, [activePanel, insights, courses, onOpenCourse]);

  return (
    <>
      <button
        onClick={() => {
          const nextOpen = !isOpen;
          setIsOpen(nextOpen);
          if (nextOpen) loadInsights();
        }}
        className="fixed bottom-6 left-6 z-50 p-4 rounded-full bg-indigo-600 text-white shadow-2xl hover:bg-indigo-700 transition"
        aria-label="Open teacher assistant"
      >
        <Bot className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 left-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between">
            <div>
              <p className="font-bold">Teacher Assistant</p>
              <p className="text-xs text-indigo-100">Action insights for your classes</p>
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
              <button onClick={() => setActivePanel('health')} className="px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-indigo-300 text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-indigo-600" /> Health
              </button>
              <button onClick={() => setActivePanel('pending')} className="px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-indigo-300 text-sm font-semibold text-gray-700 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-orange-600" /> Pending
              </button>
              <button onClick={() => setActivePanel('attendance')} className="px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-indigo-300 text-sm font-semibold text-gray-700 flex items-center gap-2">
                <CalendarCheck2 className="w-4 h-4 text-emerald-600" /> Attendance
              </button>
              <button onClick={() => setActivePanel('quick')} className="px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-indigo-300 text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-600" /> Actions
              </button>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-3 min-h-[180px]">
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

export default TeacherAssistantChat;
